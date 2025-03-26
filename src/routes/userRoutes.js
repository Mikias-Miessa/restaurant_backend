const express = require("express");
const {
  registerUser,
  loginUser,
  updateUser,
  getProfile,
  getUsers,
  deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Public routes
router.post("/login", loginUser);

// Protected routes (admin only)
router.get("/", [authMiddleware, adminMiddleware], getUsers);
router.post("/register", [authMiddleware, adminMiddleware], registerUser);
router.put("/:id", [authMiddleware, adminMiddleware], updateUser);
router.delete("/:id", [authMiddleware, adminMiddleware], deleteUser);

module.exports = router;
