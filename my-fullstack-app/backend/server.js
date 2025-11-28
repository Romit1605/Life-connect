
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

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
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/medicine", require("./routes/medicineRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/policies", require("./routes/policyRoutes"));
app.use("/api/volunteers", require("./routes/volunteerRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/volunteer-requests", require("./routes/volunteerRequestRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
