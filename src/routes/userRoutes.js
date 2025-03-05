const express = require("express");
const {
  registerUser,
  loginUser,
  updateUser,
  getProfile,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/update", authMiddleware, updateUser);

module.exports = router;
