const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

// TODO: Add admin role check middleware
router.get("/stats", authenticate, requireAdmin, adminController.getStats);
router.get(
  "/activities/pending",
  authenticate,
  requireAdmin,
  adminController.getPendingActivities
);
router.post(
  "/activities/:id/verify",
  authenticate,
  requireAdmin,
  adminController.verifyActivity
);

module.exports = router;
