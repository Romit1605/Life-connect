const VolunteerApplication = require("../models/VolunteerApplication");
const Camp = require("../models/Camp");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Apply for volunteer position
// @route   POST /api/volunteers/apply
// @access  Private
const applyForVolunteer = async (req, res) => {
    try {
        const { campId, applicationMessage, skills, availability } = req.body;

        if (!campId) {
            return res.status(400).json({ message: "Camp ID is required" });
        }

        const camp = await Camp.findById(campId).populate("organizer", "full_name organization_name");

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        // Check if already applied
        const existingApplication = await VolunteerApplication.findOne({
            camp: campId,
            volunteer: req.user.id,
        });

        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this camp" });
        }

        const application = await VolunteerApplication.create({
            camp: campId,
            volunteer: req.user.id,
            applicationMessage,
            skills,
            availability,
        });

        // Notify NGO organizer
        await Notification.create({
            recipient: camp.organizer._id,
            type: "volunteer_application",
            message: `${req.user.full_name} has applied to volunteer for your camp "${camp.name}".`,
            relatedId: application._id,
            relatedModel: "VolunteerApplication",
        });

        const populatedApplication = await VolunteerApplication.findById(application._id)
            .populate("volunteer", "full_name email phone")
            .populate("camp", "name date location");

        res.status(201).json(populatedApplication);
    } catch (error) {
        console.error("Apply for volunteer error:", error);
        res.status(500).json({ message: "Error submitting application", error: error.message });
    }
};

// @desc    Get all volunteer applications for NGO's camps
// @route   GET /api/volunteers/applications
// @access  Private (NGO only)
const getVolunteerApplications = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can view volunteer applications" });
        }

        // Get all camps organized by this NGO
        const camps = await Camp.find({ organizer: req.user.id });
        const campIds = camps.map(camp => camp._id);

        const applications = await VolunteerApplication.find({ camp: { $in: campIds } })
            .populate("volunteer", "full_name email phone")
            .populate("camp", "name date location status")
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error("Get volunteer applications error:", error);
        res.status(500).json({ message: "Error fetching applications", error: error.message });
    }
};

// @desc    Get volunteer's own applications
// @route   GET /api/volunteers/my-applications
// @access  Private
const getMyApplications = async (req, res) => {
    try {
        const applications = await VolunteerApplication.find({ volunteer: req.user.id })
            .populate({
                path: "camp",
                select: "name date location status description organizer",
                populate: {
                    path: "organizer",
                    select: "full_name organization_name email phone"
                }
            })
            .populate("reviewedBy", "full_name organization_name")
            .sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error("Get my applications error:", error);
        res.status(500).json({ message: "Error fetching applications", error: error.message });
    }
};

// @desc    Approve volunteer application
// @route   PUT /api/volunteers/:id/approve
// @access  Private (NGO only)
const approveVolunteerApplication = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can approve volunteer applications" });
        }

        const application = await VolunteerApplication.findById(req.params.id)
            .populate("volunteer", "full_name email")
            .populate("camp", "name date location organizer");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify NGO owns this camp
        if (application.camp.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to approve this application" });
        }

        if (application.status === "approved") {
            return res.status(400).json({ message: "Application is already approved" });
        }

        application.status = "approved";
        application.reviewedBy = req.user.id;
        application.reviewedAt = new Date();
        await application.save();

        // Notify volunteer
        await Notification.create({
            recipient: application.volunteer._id,
            type: "volunteer_approved",
            message: `Congratulations! Your volunteer application for "${application.camp.name}" has been approved.`,
            relatedId: application._id,
            relatedModel: "VolunteerApplication",
        });

        res.status(200).json(application);
    } catch (error) {
        console.error("Approve volunteer application error:", error);
        res.status(500).json({ message: "Error approving application", error: error.message });
    }
};

// @desc    Reject volunteer application
// @route   PUT /api/volunteers/:id/reject
// @access  Private (NGO only)
const rejectVolunteerApplication = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can reject volunteer applications" });
        }

        const { reason } = req.body;

        const application = await VolunteerApplication.findById(req.params.id)
            .populate("volunteer", "full_name email")
            .populate("camp", "name date location organizer");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify NGO owns this camp
        if (application.camp.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to reject this application" });
        }

        if (application.status === "rejected") {
            return res.status(400).json({ message: "Application is already rejected" });
        }

        application.status = "rejected";
        application.rejectionReason = reason || "No reason provided";
        application.reviewedBy = req.user.id;
        application.reviewedAt = new Date();
        await application.save();

        // Notify volunteer
        await Notification.create({
            recipient: application.volunteer._id,
            type: "volunteer_rejected",
            message: `Your volunteer application for "${application.camp.name}" has been declined. Reason: ${application.rejectionReason}`,
            relatedId: application._id,
            relatedModel: "VolunteerApplication",
        });

        res.status(200).json(application);
    } catch (error) {
        console.error("Reject volunteer application error:", error);
        res.status(500).json({ message: "Error rejecting application", error: error.message });
    }
};

// @desc    Update hours worked for volunteer
// @route   PUT /api/volunteers/:id/hours
// @access  Private (NGO only)
const updateVolunteerHours = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can update volunteer hours" });
        }

        const { hoursWorked } = req.body;

        if (!hoursWorked || hoursWorked < 0) {
            return res.status(400).json({ message: "Please provide valid hours worked" });
        }

        const application = await VolunteerApplication.findById(req.params.id)
            .populate("volunteer", "full_name email")
            .populate("camp", "name organizer");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify NGO owns this camp
        if (application.camp.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        application.hoursWorked = hoursWorked;
        application.attendanceMarked = true;
        await application.save();

        res.status(200).json(application);
    } catch (error) {
        console.error("Update volunteer hours error:", error);
        res.status(500).json({ message: "Error updating hours", error: error.message });
    }
};

module.exports = {
    applyForVolunteer,
    getVolunteerApplications,
    getMyApplications,
    approveVolunteerApplication,
    rejectVolunteerApplication,
    updateVolunteerHours,
};
