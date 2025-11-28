const express = require("express");
const router = express.Router();
const { generateComprehensiveReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/reports/comprehensive
// @desc    Generate comprehensive government report
// @access  Private (Government only)
router.get("/comprehensive", protect, generateComprehensiveReport);

module.exports = router;
