const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { PrismaClient } = require("@prisma/client");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Firebase Admin SDK
const serviceAccount = require("./firebase-service-account.json"); // You'll need to add this file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Auth middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// User routes
app.get("/api/user/profile", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Activity routes
app.post("/api/activities", authenticate, async (req, res) => {
  try {
    const { type, title, description, co2Saved, waterSaved } = req.body;

    const activity = await prisma.activity.create({
      data: {
        userId: req.user.uid,
        type,
        title,
        description,
        co2Saved: co2Saved ? parseFloat(co2Saved) : null,
        waterSaved: waterSaved ? parseFloat(waterSaved) : null,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/activities", authenticate, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { userId: req.user.uid },
      orderBy: { createdAt: "desc" },
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Missions routes
app.get("/api/missions", async (req, res) => {
  try {
    const missions = await prisma.mission.findMany({
      where: { isActive: true },
    });

    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Shop routes
app.get("/api/shop/items", async (req, res) => {
  try {
    const items = await prisma.shopItem.findMany({
      where: { isActive: true },
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// AgriTours routes
app.get("/api/agritours", async (req, res) => {
  try {
    const tours = await prisma.agriTour.findMany({
      where: { isActive: true },
    });

    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
