const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const admin = require("firebase-admin");

// Initialize Firebase Admin
let firebaseAdmin;
try {
  // Check if file exists before requiring to avoid crash
  // In production, prefer environment variables
  const serviceAccount = require("../../firebase-service-account.json");
  if (admin.apps.length === 0) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    firebaseAdmin = admin.apps[0];
  }
} catch (error) {
  console.warn(
    "Firebase service account not found or invalid. Auth middleware will fail for real tokens."
  );
  firebaseAdmin = null;
}

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

    if (!firebaseAdmin) {
      return res.status(500).json({ error: "Authentication not configured" });
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // Attach DB user if exists
    const dbUser = await prisma.user.findUnique({
      where: { firebaseId: decodedToken.uid },
    });

    if (dbUser) {
      req.dbUser = dbUser;
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.dbUser || req.dbUser.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
