const express = require("express");
const router = express.Router();
const agritourController = require("../controllers/agritour.controller");
const authenticate = require("../middleware/auth.middleware");

router.get("/", agritourController.getTours);
router.post("/book", authenticate, agritourController.bookTour);

module.exports = router;
