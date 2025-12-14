const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middleware/auth.middleware");

// TODO: Add admin role check middleware
router.get("/stats", authenticate, adminController.getStats);

module.exports = router;
