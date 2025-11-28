const express = require("express");
const router = express.Router();
const {
    generateCertificate,
    getNGOCertificates,
    getMyCertificates,
    getCertificateById,
    deleteCertificate,
} = require("../controllers/certificateController");
const { protect } = require("../middleware/authMiddleware");

// Generate certificate for volunteer
router.post("/generate", protect, generateCertificate);

// Get all certificates for NGO
router.get("/ngo", protect, getNGOCertificates);

// Get volunteer's certificates
router.get("/my-certificates", protect, getMyCertificates);

// Get certificate by ID
router.get("/:id", getCertificateById);

// Delete certificate
router.delete("/:id", protect, deleteCertificate);

module.exports = router;
