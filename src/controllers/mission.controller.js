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
