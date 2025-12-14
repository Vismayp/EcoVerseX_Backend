const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getCircles = async (req, res) => {
  try {
    const circles = await prisma.ecoCircle.findMany({
      include: { _count: { select: { members: true } } },
    });
    res.json(circles);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.joinCircle = async (req, res) => {
  try {
    if (!req.dbUser) return res.status(400).json({ error: "User not synced" });
    const { id } = req.params;

    const membership = await prisma.userEcoCircle.create({
      data: {
        userId: req.dbUser.id,
        circleId: id,
        role: "MEMBER",
      },
    });
    res.json(membership);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to join circle" });
  }
};
