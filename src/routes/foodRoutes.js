const express = require("express");
const { getFoods, createFood, updateFood, deleteFood } = require("../controllers/foodController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getFoods);
router.post("/", authMiddleware, createFood);
router.put("/:id", authMiddleware, updateFood);
router.delete("/:id", authMiddleware, deleteFood);

module.exports = router;
