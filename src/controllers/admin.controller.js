const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
