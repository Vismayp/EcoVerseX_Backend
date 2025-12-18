const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

router.post(
  "/send",
  authenticate,
  requireAdmin,
  notificationController.sendNotification
);

module.exports = router;
