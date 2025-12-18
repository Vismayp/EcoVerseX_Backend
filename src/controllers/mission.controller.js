const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllMissions = async (req, res) => {
  try {
    const missions = await prisma.mission.findMany({
      where: { isActive: true },
    });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.joinMission = async (req, res) => {
  try {
    if (!req.dbUser) return res.status(400).json({ error: "User not synced" });
    const { id } = req.params;

    const userMission = await prisma.userMission.create({
      data: {
        userId: req.dbUser.id,
        missionId: id,
        status: "ACTIVE",
      },
    });
    res.json(userMission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to join mission" });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    if (!req.dbUser) return res.status(400).json({ error: "User not synced" });
    const { id } = req.params; // UserMission ID or Mission ID? Let's assume Mission ID and find the UserMission
    const { progress, status } = req.body;

    // Find the UserMission
    const userMission = await prisma.userMission.findUnique({
      where: {
        userId_missionId: {
          userId: req.dbUser.id,
          missionId: id,
        },
      },
      include: { mission: true },
    });

    if (!userMission) {
      return res.status(404).json({ error: "Mission not joined" });
    }

    const data = {};
    if (progress !== undefined) data.progress = progress;
    if (status) {
      data.status = status;
      if (status === "COMPLETED" && userMission.status !== "COMPLETED") {
        data.completedAt = new Date();
        // Award coins
        await prisma.user.update({
          where: { id: req.dbUser.id },
          data: { ecoCoins: { increment: userMission.mission.reward } },
        });
      }
    }

    const updated = await prisma.userMission.update({
      where: { id: userMission.id },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update mission progress" });
  }
};
