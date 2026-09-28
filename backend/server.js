// Import dependencies
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const targetRoutes = require("./src/routes/targetRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const userRoutes = require("./src/routes/userRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const chatRoutes = require("./src/routes/chatRoutes");

// Initialize the app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware — web app + Chrome extension (chrome-extension:// origins)
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^chrome-extension:\/\/.+$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(null, true);
    },
  })
);
app.use(express.json()); // Allows the server to accept JSON data

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);

// A simple test route
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running smoothly!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
