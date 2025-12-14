const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.calculateAndSave = async (req, res) => {
  try {
    if (!req.dbUser) return res.status(400).json({ error: "User not synced" });
    const { projectName, treeSpecies, treeCount } = req.body;

    // Simple calculation logic (Mango Tree ~ 22kg/year)
    const speciesRate = treeSpecies.toLowerCase().includes("mango")
      ? 0.022
      : 0.02; // tonnes
    const annualSeq = treeCount * speciesRate;
    const totalSeq = annualSeq * 20; // 20 years projection

    const credit = await prisma.carbonCredit.create({
      data: {
        userId: req.dbUser.id,
        projectName,
        treeSpecies,
        treeCount: parseInt(treeCount),
        annualSeq,
        totalSeq,
        status: "PENDING",
      },
    });

    res.json(credit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save calculation" });
  }
};

exports.getMyCredits = async (req, res) => {
  try {
    if (!req.dbUser) return res.status(400).json({ error: "User not synced" });
    const credits = await prisma.carbonCredit.findMany({
      where: { userId: req.dbUser.id },
    });
    res.json(credits);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
