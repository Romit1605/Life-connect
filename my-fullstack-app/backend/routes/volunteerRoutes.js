const express = require("express");
const router = express.Router();
const {
    applyForVolunteer,
    getVolunteerApplications,
    getMyApplications,
    approveVolunteerApplication,
    rejectVolunteerApplication,
    updateVolunteerHours,
} = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware");

// Apply for volunteer position
router.post("/apply", protect, applyForVolunteer);

// Get all volunteer applications for NGO's camps
router.get("/applications", protect, getVolunteerApplications);

// Get volunteer's own applications
router.get("/my-applications", protect, getMyApplications);

// Approve volunteer application
router.put("/:id/approve", protect, approveVolunteerApplication);

// Reject volunteer application
router.put("/:id/reject", protect, rejectVolunteerApplication);

// Update volunteer hours
router.put("/:id/hours", protect, updateVolunteerHours);

module.exports = router;
