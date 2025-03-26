const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.registerUser = async (req, res) => {
  console.log("Registration request received:", {
    username: req.body.username,
    role: req.body.role,
    hasPassword: !!req.body.password,
  });

  const { username, password, role } = req.body;
  try {
    // Validate role
    if (role && !["admin", "waiter"].includes(role)) {
      console.log("Invalid role detected:", role);
      return res
        .status(400)
        .send("Invalid role. Must be either 'admin' or 'waiter'");
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Username already exists:", username);
      return res.status(400).send("Username already exists");
    }

    console.log("Generating salt and hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("Creating new user with role:", role);
    const user = new User({
      username,
      password: hashedPassword,
      role: role || "waiter", // Default to waiter if no role specified
    });

    await user.save();
    console.log("User successfully created:", {
      username,
      role: user.role,
      id: user._id,
    });

    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Registration error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(400).send(error.message);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { _id: user._id, role: user.role, username: user.username }, // Include username in token
      process.env.JWT_SECRET
    );

    // Send response with all necessary user data
    res.status(200).json({
      token,
      role: user.role,
      username: user.username, // Explicitly send username
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (username) {
      // Check if new username is already taken by another user
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).send("Username already exists");
      }
      user.username = username;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (role) {
      user.role = role;
    }

    await user.save();
    res.send("User updated successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Get all waiters
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "waiter" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const { username, currentPassword, newPassword } = req.body;

    // If updating username
    if (username) {
      // Check if new username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).send("Username already exists");
      }
      user.username = username;
    }

    // If updating password
    if (currentPassword && newPassword) {
      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return res.status(401).send("Current password is incorrect");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};
