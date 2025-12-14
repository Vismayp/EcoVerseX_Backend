const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/auth.middleware");

router.get("/profile", authenticate, userController.getProfile);
router.post("/sync", authenticate, userController.syncUser);
router.get("/leaderboard", userController.getLeaderboard);

module.exports = router;
