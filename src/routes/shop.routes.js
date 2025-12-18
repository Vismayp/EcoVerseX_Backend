const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/items", shopController.getItems);
router.post("/orders", authenticate, shopController.createOrder);

module.exports = router;
