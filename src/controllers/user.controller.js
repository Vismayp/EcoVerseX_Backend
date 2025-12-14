const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.user.uid },
      include: {
        activities: { take: 5, orderBy: { createdAt: "desc" } },
        // missions: true // Uncomment when needed
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.syncUser = async (req, res) => {
  try {
    const { email, name, picture } = req.user; // Standard Firebase claims

    const user = await prisma.user.upsert({
      where: { firebaseId: req.user.uid },
      update: {
        email: email,
        displayName: name,
        photoURL: picture,
      },
      create: {
        firebaseId: req.user.uid,
        email: email || `user_${req.user.uid}@example.com`, // Fallback
        displayName: name || "Eco Warrior",
        photoURL: picture,
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to sync user" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { ecoCoins: "desc" },
      take: 20,
      select: {
        id: true,
        displayName: true,
        photoURL: true,
        ecoCoins: true,
        tier: true,
        streak: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
