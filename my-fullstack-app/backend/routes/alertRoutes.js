const express = require("express");
const router = express.Router();
const {
    createAlert,
    getAlerts,
    getAlertById,
    respondToAlert,
    acknowledgeAlert,
} = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createAlert);
router.get("/", protect, getAlerts);
router.get("/:id", protect, getAlertById);
router.put("/:id/respond", protect, respondToAlert);
router.put("/:id/acknowledge", protect, acknowledgeAlert);

module.exports = router;
