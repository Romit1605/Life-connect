const express = require("express");
const router = express.Router();
const {
    createVolunteerRequest,
    getVolunteerRequests,
    getMyVolunteerRequests,
    updateVolunteerRequest,
    deleteVolunteerRequest,
} = require("../controllers/volunteerRequestController");
const { protect } = require("../middleware/authMiddleware");

// Create volunteer request
router.post("/", protect, createVolunteerRequest);

// Get all volunteer requests
router.get("/", getVolunteerRequests);

// Get NGO's volunteer requests
router.get("/my-requests", protect, getMyVolunteerRequests);

// Update volunteer request
router.put("/:id", protect, updateVolunteerRequest);

// Delete volunteer request
router.delete("/:id", protect, deleteVolunteerRequest);

module.exports = router;
