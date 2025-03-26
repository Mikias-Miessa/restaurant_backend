const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const userRoutes = require("./src/routes/userRoutes");
const foodRoutes = require("./src/routes/foodRoutes");
const authMiddleware = require("./src/middleware/authMiddleware");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

const seedAdmin = require("./src/database/seeders/adminSeeder");

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection with updated options
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s
    family: 4, // Use IPv4, skip trying IPv6
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    // Call seedAdmin after successful connection
    seedAdmin();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join room based on role
  socket.on("join", (role) => {
    if (role === "admin") {
      socket.join("admin-room");
      console.log("Admin joined admin-room");
    }
  });

  // Handle new orders
  socket.on("new-order", (orderData) => {
    console.log("New order received:", orderData);
    // Broadcast to admin room
    io.to("admin-room").emit("order-received", orderData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/foods", authMiddleware, foodRoutes);

// Start server
const PORT = process.env.PORT || 5000;
httpServer
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server error:", err);
  });

// Handle server shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
