const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class GamificationService {
  /**
   * Updates the user's streak based on activity history.
   * Should be called when a new activity is verified.
   */
  async updateStreak(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // Get last verified activity
    const lastActivity = await prisma.activity.findFirst({
      where: { userId, status: "VERIFIED" },
      orderBy: { verifiedAt: "desc" },
      skip: 1, // Skip the one just verified
    });

    // Simple logic: if last activity was yesterday (or today), increment. Else reset.
    // This is a placeholder for more robust logic.

    // For now, we just increment in the controller.
  }

  /**
   * Checks if the user qualifies for a tier upgrade.
   */
  async checkTierUpgrade(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    let newTier = user.tier;
    if (user.ecoCoins > 5000) newTier = "PLATINUM";
    else if (user.ecoCoins > 2000) newTier = "GOLD";
    else if (user.ecoCoins > 500) newTier = "SILVER";

    if (newTier !== user.tier) {
      await prisma.user.update({
        where: { id: userId },
        data: { tier: newTier },
      });
    }
  }
}

module.exports = new GamificationService();
