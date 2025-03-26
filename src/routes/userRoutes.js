const express = require("express");
const {
  registerUser,
  loginUser,
  updateUser,
  getProfile,
  getUsers,
  deleteUser,
  updateProfile,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Public routes
router.post("/login", loginUser);

// Protected routes for all authenticated users
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Protected routes (admin only)
router.get("/", [authMiddleware, adminMiddleware], getUsers);
router.post("/register", [authMiddleware, adminMiddleware], registerUser);
router.put("/:id", [authMiddleware, adminMiddleware], updateUser);
router.delete("/:id", [authMiddleware, adminMiddleware], deleteUser);

module.exports = router;
