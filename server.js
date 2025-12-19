const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Firebase Admin SDK
let admin;
try {
  const adminModule = require("firebase-admin");
  const serviceAccount = require("./firebase-service-account.json");
  if (adminModule.apps.length === 0) {
    admin = adminModule.initializeApp({
      credential: adminModule.credential.cert(serviceAccount),
    });
  } else {
    admin = adminModule.apps[0];
  }
} catch (error) {
  console.warn("Firebase service account not found. Auth will be disabled.");
  admin = null;
}

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

// Swagger (OpenAPI)
const swaggerUi = require("swagger-ui-express");
const openapi = require("./src/openapi");
app.get("/api/docs.json", (req, res) => {
  res.json(openapi);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));

// Auth middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // Mock for testing if needed
    if (
      (process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development") &&
      token === "mock-token"
    ) {
      req.user = {
        uid: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/avatar.jpg",
      };
      return next();
    }

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

app.post("/api/user/sync", authenticate, async (req, res) => {
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
});

// Activity routes
app.post("/api/activities", authenticate, async (req, res) => {
  try {
    const { type, title, description, co2Saved, waterSaved } = req.body;

    // Get the user from DB
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
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
    // Get the user from DB
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const activities = await prisma.activity.findMany({
      where: { userId: user.id },
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

app.post("/api/missions/:id/join", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the user from DB
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userMission = await prisma.userMission.create({
      data: {
        userId: user.id,
        missionId: id,
        status: "ACTIVE",
      },
    });
    res.status(201).json(userMission);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      // Unique constraint violation - already joined
      return res.status(400).json({ error: "Already joined this mission" });
    }
    res.status(500).json({ error: "Failed to join mission" });
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
app.get("/api/tours", async (req, res) => {
  try {
    const tours = await prisma.agriTour.findMany({
      where: { isActive: true },
    });

    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// EcoCircles routes
app.get("/api/circles", async (req, res) => {
  try {
    const circles = await prisma.ecoCircle.findMany();

    res.json(circles);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/circles/:id/join", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the user from DB
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userCircle = await prisma.userEcoCircle.create({
      data: {
        userId: user.id,
        circleId: id,
        role: "MEMBER",
      },
    });
    res.status(201).json(userCircle);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      // Unique constraint violation - already joined
      return res.status(400).json({ error: "Already joined this circle" });
    }
    res.status(500).json({ error: "Failed to join circle" });
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
