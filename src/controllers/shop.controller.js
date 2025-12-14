const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getItems = async (req, res) => {
  try {
    const items = await prisma.shopItem.findMany({
      where: { isActive: true },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    if (!req.dbUser) return res.status(400).json({ error: "User not synced" });
    const { itemId, quantity } = req.body;

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: "Item not found" });

    const totalCost = item.price * (quantity || 1);

    if (req.dbUser.ecoCoins < totalCost) {
      return res.status(400).json({ error: "Insufficient EcoCoins" });
    }

    // Transactional update
    const result = await prisma.$transaction(async (prisma) => {
      // Deduct coins
      await prisma.user.update({
        where: { id: req.dbUser.id },
        data: { ecoCoins: { decrement: totalCost } },
      });

      // Create order
      const order = await prisma.shopOrder.create({
        data: {
          userId: req.dbUser.id,
          itemId,
          quantity: quantity || 1,
          totalCost,
          status: "PENDING",
        },
      });

      return order;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};
