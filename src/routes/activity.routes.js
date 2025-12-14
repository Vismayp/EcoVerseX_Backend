const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activity.controller");
const authenticate = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post(
  "/",
  authenticate,
  upload.single("image"),
  activityController.createActivity
);
router.get("/", authenticate, activityController.getMyActivities);
router.get("/pending", authenticate, activityController.getPendingActivities);
router.patch("/:id/verify", authenticate, activityController.verifyActivity);

module.exports = router;
