const express = require("express");
const router = express.Router();
const carbonController = require("../controllers/carbon.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/calculate", authenticate, carbonController.calculateAndSave);
router.get("/my-credits", authenticate, carbonController.getMyCredits);

module.exports = router;
