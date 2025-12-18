const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const gamificationService = require("../services/gamification.service");

exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalActivities,
      pendingActivities,
      totalCO2,
      totalWater,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.activity.count(),
      prisma.activity.count({ where: { status: "PENDING" } }),
      prisma.activity.aggregate({ _sum: { co2Saved: true } }),
      prisma.activity.aggregate({ _sum: { waterSaved: true } }),
    ]);

    res.json({
      totalUsers,
      totalActivities,
      pendingActivities,
      totalCO2Saved: totalCO2._sum.co2Saved || 0,
      totalWaterSaved: totalWater._sum.waterSaved || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPendingActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { displayName: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body; // status: 'APPROVED' or 'REJECTED'

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    if (activity.status !== "PENDING") {
      return res.status(400).json({ error: "Activity already processed" });
    }

    await prisma.$transaction(async (prisma) => {
      // Update activity
      await prisma.activity.update({
        where: { id },
        data: {
          status,
          verifiedAt: new Date(),
          // verifiedBy: req.user.uid, // Assuming admin is authenticated
        },
      });

      if (status === "APPROVED") {
        // Calculate rewards (simplified)
        // In a real app, this might depend on activity type/impact
        const reward = 10; // Base reward
        const co2Reward = (activity.co2Saved || 0) * 5; // 5 coins per kg
        const totalReward = Math.round(reward + co2Reward);

        // Update user wallet and stats
        const user = await prisma.user.findUnique({
          where: { id: activity.userId },
        });

        // Streak logic: Check if last activity was within 7 days
        // If lastActivityDate is null, it's the first activity -> streak = 1
        // If diff < 7 days, streak++
        // If diff > 7 days, streak = 1
        let newStreak = user.streak;
        const now = new Date();
        if (user.lastActivityDate) {
          const diffTime = Math.abs(now - user.lastActivityDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        await prisma.user.update({
          where: { id: activity.userId },
          data: {
            ecoCoins: { increment: totalReward },
            streak: newStreak,
            lastActivityDate: now,
          },
        });
      }
    });

    if (status === "APPROVED") {
      // Check for tier upgrade after transaction
      await gamificationService.checkTierUpgrade(activity.userId);
    }

    res.json({ message: `Activity ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify activity" });
  }
};
