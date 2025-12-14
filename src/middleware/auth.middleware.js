const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Initialize Firebase Admin
try {
  // Check if file exists before requiring to avoid crash
  // In production, prefer environment variables
  const serviceAccount = require("../../firebase-service-account.json");
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.warn(
    "Firebase service account not found or invalid. Auth middleware will fail for real tokens."
  );
}

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // Mock for testing if needed
    if (process.env.NODE_ENV === "test" && token === "mock-token") {
      req.user = { uid: "test-user-id", email: "test@example.com" };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
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

module.exports = authenticate;
