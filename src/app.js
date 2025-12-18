const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const app = express();

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
const openapi = require("./openapi");
app.get("/api/docs.json", (req, res) => {
  res.json(openapi);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Import Routes
const userRoutes = require("./routes/user.routes");
const activityRoutes = require("./routes/activity.routes");
const missionRoutes = require("./routes/mission.routes");
const shopRoutes = require("./routes/shop.routes");
const agritourRoutes = require("./routes/agritour.routes");
const carbonRoutes = require("./routes/carbon.routes");
const communityRoutes = require("./routes/community.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const errorHandler = require("./middleware/error.middleware");

// Use Routes
app.use("/api/user", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/tours", agritourRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/circles", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
