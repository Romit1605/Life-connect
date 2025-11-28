const Certificate = require("../models/Certificate");
const VolunteerApplication = require("../models/VolunteerApplication");
const Camp = require("../models/Camp");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Generate certificate for volunteer
// @route   POST /api/certificates/generate
// @access  Private (NGO only)
const generateCertificate = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can generate certificates" });
        }

        const { volunteerId, campId, campType, programDirector, medicalCoordinator } = req.body;

        if (!volunteerId || !campId || !campType) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Get volunteer application
        const application = await VolunteerApplication.findOne({
            volunteer: volunteerId,
            camp: campId,
            status: "approved",
        })
            .populate("volunteer", "full_name email")
            .populate("camp", "name date organizer");

        if (!application) {
            return res.status(404).json({ message: "Approved volunteer application not found" });
        }

        // Verify NGO owns this camp
        if (application.camp.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to generate certificate for this camp" });
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
            volunteer: volunteerId,
            camp: campId,
        });

        if (existingCertificate) {
            return res.status(400).json({ message: "Certificate already exists for this volunteer and camp" });
        }

        // Check if hours are marked
        if (!application.attendanceMarked || application.hoursWorked === 0) {
            return res.status(400).json({ message: "Please mark volunteer hours before generating certificate" });
        }

        // Generate certificate ID
        const certificateId = `VC-${campType.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const certificate = await Certificate.create({
            volunteer: volunteerId,
            camp: campId,
            ngo: req.user.id,
            certificateId,
            volunteerName: application.volunteer.full_name,
            campName: application.camp.name,
            campType,
            hoursWorked: application.hoursWorked,
            startDate: application.camp.date,
            endDate: application.camp.date, // Can be updated if needed
            programDirector: programDirector || "Program Director",
            medicalCoordinator: medicalCoordinator || "Medical Coordinator",
        });

        // Notify volunteer
        await Notification.create({
            recipient: volunteerId,
            type: "certificate_issued",
            message: `Your volunteer certificate for "${application.camp.name}" has been issued! Certificate ID: ${certificateId}`,
            relatedId: certificate._id,
            relatedModel: "Certificate",
        });

        const populatedCertificate = await Certificate.findById(certificate._id)
            .populate("volunteer", "full_name email")
            .populate("camp", "name date location")
            .populate("ngo", "organization_name");

        res.status(201).json(populatedCertificate);
    } catch (error) {
        console.error("Generate certificate error:", error);
        res.status(500).json({ message: "Error generating certificate", error: error.message });
    }
};

// @desc    Get all certificates for NGO
// @route   GET /api/certificates/ngo
// @access  Private (NGO only)
const getNGOCertificates = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can view their certificates" });
        }

        const certificates = await Certificate.find({ ngo: req.user.id })
            .populate("volunteer", "full_name email phone")
            .populate("camp", "name date location")
            .sort({ createdAt: -1 });

        res.status(200).json(certificates);
    } catch (error) {
        console.error("Get NGO certificates error:", error);
        res.status(500).json({ message: "Error fetching certificates", error: error.message });
    }
};

// @desc    Get volunteer's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
const getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ volunteer: req.user.id })
            .populate("camp", "name date location")
            .populate("ngo", "organization_name")
            .sort({ createdAt: -1 });

        res.status(200).json(certificates);
    } catch (error) {
        console.error("Get my certificates error:", error);
        res.status(500).json({ message: "Error fetching certificates", error: error.message });
    }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
const getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate("volunteer", "full_name email")
            .populate("camp", "name date location")
            .populate("ngo", "organization_name");

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        res.status(200).json(certificate);
    } catch (error) {
        console.error("Get certificate by ID error:", error);
        res.status(500).json({ message: "Error fetching certificate", error: error.message });
    }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private (NGO only)
const deleteCertificate = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can delete certificates" });
        }

        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        // Verify NGO owns this certificate
        if (certificate.ngo.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this certificate" });
        }

        await Certificate.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Certificate deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("Delete certificate error:", error);
        res.status(500).json({ message: "Error deleting certificate", error: error.message });
    }
};

module.exports = {
    generateCertificate,
    getNGOCertificates,
    getMyCertificates,
    getCertificateById,
    deleteCertificate,
};
