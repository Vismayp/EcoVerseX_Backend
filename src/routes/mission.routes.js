const express = require("express");
const router = express.Router();
const missionController = require("../controllers/mission.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/", missionController.getAllMissions);
router.post("/:id/join", authenticate, missionController.joinMission);
router.patch("/:id/progress", authenticate, missionController.updateProgress);

module.exports = router;
