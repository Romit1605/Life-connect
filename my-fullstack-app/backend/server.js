const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/camps", require("./routes/campRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
