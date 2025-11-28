const VolunteerRequest = require("../models/VolunteerRequest");
const Camp = require("../models/Camp");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Create volunteer request
// @route   POST /api/volunteer-requests
// @access  Private (NGO only)
const createVolunteerRequest = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can create volunteer requests" });
        }

        const { campId, volunteersNeeded, description, requiredSkills, responsibilities, deadline } = req.body;

        if (!campId || !volunteersNeeded || !description) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const camp = await Camp.findById(campId);

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        // Verify NGO owns this camp
        if (camp.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to create volunteer request for this camp" });
        }

        const volunteerRequest = await VolunteerRequest.create({
            camp: campId,
            ngo: req.user.id,
            volunteersNeeded,
            description,
            requiredSkills,
            responsibilities,
            deadline,
        });

        // Notify all users about volunteer opportunity
        const allUsers = await User.find({});
        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: "volunteer_request",
            message: `New volunteer opportunity: ${volunteersNeeded} volunteers needed for "${camp.name}". ${description}`,
            relatedId: volunteerRequest._id,
            relatedModel: "VolunteerRequest",
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        const populatedRequest = await VolunteerRequest.findById(volunteerRequest._id)
            .populate("camp", "name date location")
            .populate("ngo", "organization_name");

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error("Create volunteer request error:", error);
        res.status(500).json({ message: "Error creating volunteer request", error: error.message });
    }
};

// @desc    Get all volunteer requests
// @route   GET /api/volunteer-requests
// @access  Public
const getVolunteerRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        const requests = await VolunteerRequest.find(query)
            .populate("camp", "name date location status")
            .populate("ngo", "organization_name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Get volunteer requests error:", error);
        res.status(500).json({ message: "Error fetching volunteer requests", error: error.message });
    }
};

// @desc    Get NGO's volunteer requests
// @route   GET /api/volunteer-requests/my-requests
// @access  Private (NGO only)
const getMyVolunteerRequests = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can view their volunteer requests" });
        }

        const requests = await VolunteerRequest.find({ ngo: req.user.id })
            .populate("camp", "name date location status")
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Get my volunteer requests error:", error);
        res.status(500).json({ message: "Error fetching volunteer requests", error: error.message });
    }
};

// @desc    Update volunteer request status
// @route   PUT /api/volunteer-requests/:id
// @access  Private (NGO only)
const updateVolunteerRequest = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can update volunteer requests" });
        }

        const { status, volunteersNeeded, description, requiredSkills, responsibilities } = req.body;

        const volunteerRequest = await VolunteerRequest.findById(req.params.id);

        if (!volunteerRequest) {
            return res.status(404).json({ message: "Volunteer request not found" });
        }

        // Verify NGO owns this request
        if (volunteerRequest.ngo.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this volunteer request" });
        }

        if (status) volunteerRequest.status = status;
        if (volunteersNeeded) volunteerRequest.volunteersNeeded = volunteersNeeded;
        if (description) volunteerRequest.description = description;
        if (requiredSkills !== undefined) volunteerRequest.requiredSkills = requiredSkills;
        if (responsibilities !== undefined) volunteerRequest.responsibilities = responsibilities;

        await volunteerRequest.save();

        const populatedRequest = await VolunteerRequest.findById(volunteerRequest._id)
            .populate("camp", "name date location")
            .populate("ngo", "organization_name");

        res.status(200).json(populatedRequest);
    } catch (error) {
        console.error("Update volunteer request error:", error);
        res.status(500).json({ message: "Error updating volunteer request", error: error.message });
    }
};

// @desc    Delete volunteer request
// @route   DELETE /api/volunteer-requests/:id
// @access  Private (NGO only)
const deleteVolunteerRequest = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can delete volunteer requests" });
        }

        const volunteerRequest = await VolunteerRequest.findById(req.params.id);

        if (!volunteerRequest) {
            return res.status(404).json({ message: "Volunteer request not found" });
        }

        // Verify NGO owns this request
        if (volunteerRequest.ngo.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this volunteer request" });
        }

        await VolunteerRequest.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Volunteer request deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("Delete volunteer request error:", error);
        res.status(500).json({ message: "Error deleting volunteer request", error: error.message });
    }
};

module.exports = {
    createVolunteerRequest,
    getVolunteerRequests,
    getMyVolunteerRequests,
    updateVolunteerRequest,
    deleteVolunteerRequest,
};
