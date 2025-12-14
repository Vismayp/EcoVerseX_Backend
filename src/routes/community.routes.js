const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const authenticate = require("../middleware/auth.middleware");

router.get("/", communityController.getCircles);
router.post("/:id/join", authenticate, communityController.joinCircle);

module.exports = router;
