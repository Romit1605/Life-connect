const express = require("express");
const router = express.Router();
const {
    getAllPolicies,
    getPoliciesByRole,
    createPolicy,
    updatePolicy,
    deletePolicy,
    seedPolicies,
} = require("../controllers/policyController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/policies
// @desc    Get all policies
// @access  Public
router.get("/", getAllPolicies);

// @route   POST /api/policies/seed
// @desc    Seed default policies
// @access  Private (Government only)
router.post("/seed", protect, seedPolicies);

// @route   GET /api/policies/:role
// @desc    Get policies by role
// @access  Public
router.get("/:role", getPoliciesByRole);

// @route   POST /api/policies
// @desc    Create new policy
// @access  Private (Government only)
router.post("/", protect, createPolicy);

// @route   PUT /api/policies/:id
// @desc    Update policy
// @access  Private (Government only)
router.put("/:id", protect, updatePolicy);

// @route   DELETE /api/policies/:id
// @desc    Delete policy
// @access  Private (Government only)
router.delete("/:id", protect, deletePolicy);

module.exports = router;
