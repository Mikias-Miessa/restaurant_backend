const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Invalid credentials");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.header("Authorization", token).send({ token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.updateUser = async (req, res) => {
  const { username, currentUsername, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);

    if (username && currentUsername) {
      // Verify current username
      if (currentUsername !== user.username) {
        return res.status(400).send("Current username is incorrect");
      }

      // Check if new username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).send("Username already exists");
      }

      user.username = username;
    }

    if (newPassword && currentPassword) {
      // Verify current password
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!validPassword) {
        return res.status(400).send("Current password is incorrect");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.send("Profile updated successfully");
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
