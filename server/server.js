require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./db");

// Admin routes
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// User routes
const userRoutes = require("./routes/userRoutes");
const userExerciseRoutes = require("./routes/userExerciseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("AveFit API is running 🚀"));

// Admin API
app.use("/api/admin", adminRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/settings", settingsRoutes);

// User API
app.use("/api/user", userRoutes);
app.use("/api/user/exercises", userExerciseRoutes);
app.use("/api/user/exercise-categories", userExerciseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));