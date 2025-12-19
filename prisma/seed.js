const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Seed Missions
  const missions = [
    {
      title: "Plastic Free Week",
      description: "Avoid single-use plastics for a whole week.",
      type: "PLASTIC_FREE",
      duration: 7,
      reward: 100,
      co2Target: 5.0,
      isActive: true,
    },
    {
      title: "Bike to Work",
      description: "Commute to work or school by bicycle.",
      type: "COMMUTE_CHANGE",
      duration: 1,
      reward: 50,
      co2Target: 2.5,
      isActive: true,
    },
    {
      title: "Plant a Tree",
      description: "Plant a native tree in your community.",
      type: "CO2_REDUCTION",
      duration: 1,
      reward: 500,
      co2Target: 20.0,
      isActive: true,
    },
  ];

  for (const m of missions) {
    await prisma.mission.create({ data: m });
  }
  console.log("Seeded Missions");

  // Seed Shop Items
  const shopItems = [
    {
      name: "Bamboo Toothbrush",
      description: "Biodegradable bamboo toothbrush.",
      price: 50,
      category: "Personal Care",
      stock: 100,
      isActive: true,
    },
    {
      name: "Reusable Water Bottle",
      description: "Stainless steel water bottle.",
      price: 200,
      category: "Lifestyle",
      stock: 50,
      isActive: true,
    },
    {
      name: "Solar Power Bank",
      description: "Charge your devices with the sun.",
      price: 1000,
      category: "Electronics",
      stock: 20,
      isActive: true,
    },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.create({ data: item });
  }
  console.log("Seeded Shop Items");

  // Seed AgriTours
  const tours = [
    {
      name: "Green Valley Organic Farm",
      description: "Experience organic farming firsthand.",
      location: "California, USA",
      duration: "2 hours",
      price: 50,
      isActive: true,
    },
    {
      name: "Urban Rooftop Garden",
      description: "Learn about urban agriculture.",
      location: "New York, USA",
      duration: "3 hours",
      price: 30,
      isActive: true,
    },
  ];

  for (const tour of tours) {
    await prisma.agriTour.create({ data: tour });
  }
  console.log("Seeded AgriTours");

  // Seed EcoCircles
  const circles = [
    {
      name: "Eco Warriors NYC",
      description: "A community for sustainability enthusiasts in NYC.",
      location: "New York, USA",
    },
    {
      name: "Zero Waste Living",
      description: "Tips and tricks for a zero waste lifestyle.",
      location: "Global",
    },
  ];

  for (const circle of circles) {
    await prisma.ecoCircle.create({ data: circle });
  }
  console.log("Seeded EcoCircles");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
