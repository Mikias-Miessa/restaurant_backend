const bcrypt = require("bcrypt");
const User = require("../../models/User");

async function seedAdmin() {
  try {
    // Check if any admin already exists by role
    const existingAdmin = await User.findOne({ role: "admin" });

    if (!existingAdmin) {
      // Hash the password
      const hashedPassword = await bcrypt.hash("123456", 10);

      // Create admin user
      const adminUser = new User({
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });

      await adminUser.save();
      console.log("Admin user created successfully");
    } else {
      console.log("An admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

module.exports = seedAdmin;
