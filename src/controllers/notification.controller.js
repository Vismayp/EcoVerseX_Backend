const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.sendNotification = async (req, res) => {
  try {
    if (!admin || !admin.apps.length) {
      return res.status(500).json({ error: "Firebase not configured" });
    }
    const { title, body, target, userId } = req.body;

    let tokens = [];

    if (target === "ALL") {
      const users = await prisma.user.findMany({
        where: { fcmToken: { not: null } },
        select: { fcmToken: true },
      });
      tokens = users.map((u) => u.fcmToken);
    } else if (target === "USER" && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true },
      });
      if (user && user.fcmToken) {
        tokens = [user.fcmToken];
      }
    }

    if (tokens.length === 0) {
      return res
        .status(404)
        .json({ message: "No target users found with tokens" });
    }

    // Send multicast message
    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};
