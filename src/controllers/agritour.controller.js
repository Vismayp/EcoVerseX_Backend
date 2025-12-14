const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getTours = async (req, res) => {
  try {
    const tours = await prisma.agriTour.findMany({
      where: { isActive: true },
    });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.bookTour = async (req, res) => {
  try {
    if (!req.dbUser) return res.status(400).json({ error: "User not synced" });
    const { tourId, tickets, bookingDate } = req.body;

    const tour = await prisma.agriTour.findUnique({ where: { id: tourId } });
    if (!tour) return res.status(404).json({ error: "Tour not found" });

    const totalCost = tour.price * (tickets || 1);

    // Check balance if paying with EcoCoins (assuming EcoCoins for now)
    if (req.dbUser.ecoCoins < totalCost) {
      return res.status(400).json({ error: "Insufficient EcoCoins" });
    }

    const booking = await prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: req.dbUser.id },
        data: { ecoCoins: { decrement: totalCost } },
      });

      return await prisma.agriTourBooking.create({
        data: {
          userId: req.dbUser.id,
          tourId,
          tickets: tickets || 1,
          totalCost,
          bookingDate: new Date(bookingDate),
          status: "PENDING",
        },
      });
    });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to book tour" });
  }
};
