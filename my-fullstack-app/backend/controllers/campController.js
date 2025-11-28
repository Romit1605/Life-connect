const Camp = require("../models/Camp");
const Notification = require("../models/Notification");
const User = require("../models/User");

// @desc    Get all camps
// @route   GET /api/camps
// @access  Public
const getCamps = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        let query = {};

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Filter by date range if provided
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Geospatial query
        const { lat, lng, radius } = req.query;
        if (lat && lng) {
            const radiusInKm = radius || 10; // Default 10km
            query.coordinates = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radiusInKm * 1000 // Convert to meters
                }
            };
        }

        const camps = await Camp.find(query)
            .sort({ date: 1 })
            .populate("organizer", "full_name organization_name email")
            .populate("hospitalApproval.approvedBy", "full_name organization_name")
            .populate("governmentApproval.approvedBy", "full_name organization_name");
        res.status(200).json(camps);
    } catch (error) {
        console.error("Get camps error:", error);
        res.status(500).json({ message: "Error fetching camps", error: error.message });
    }
};

// @desc    Get a single camp by ID
// @route   GET /api/camps/:id
// @access  Public
const getCampById = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id)
            .populate("organizer", "full_name organization_name email phone")
            .populate("hospitalApproval.approvedBy", "full_name organization_name")
            .populate("governmentApproval.approvedBy", "full_name organization_name");

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        res.status(200).json(camp);
    } catch (error) {
        console.error("Get camp by ID error:", error);
        res.status(500).json({ message: "Error fetching camp", error: error.message });
    }
};

// Helper function to mock geocoding (replace with real geocoding service in production)
const geocodeAddress = async (address) => {
    // This is a mock implementation. In a real app, use Google Maps Geocoding API or similar.
    // For now, we'll generate random coordinates around a central point (e.g., New York)
    // to simulate different locations.
    const baseLat = 40.7128;
    const baseLng = -74.0060;
    const randomOffset = () => (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees

    return {
        lat: baseLat + randomOffset(),
        lng: baseLng + randomOffset()
    };
};

// @desc    Create a camp
// @route   POST /api/camps
// @access  Private (Hospital/NGO/BloodBank)
const createCamp = async (req, res) => {
    const { name, date, location, description, contact_phone, coordinates, resourceRequests, volunteersNeeded } = req.body;

    if (!name || !date || !location) {
        return res.status(400).json({ message: "Please add all required fields: name, date, and location" });
    }

    try {
        let campCoordinates = coordinates;

        // If coordinates are not provided, try to geocode the location
        if (!campCoordinates || !campCoordinates.lat || !campCoordinates.lng) {
            campCoordinates = await geocodeAddress(location);
        }

        const camp = await Camp.create({
            name,
            date,
            location,
            description,
            contact_phone,
            coordinates: campCoordinates,
            resourceRequests: resourceRequests || [],
            volunteersNeeded: volunteersNeeded || 0,
            organizer: req.user.id,
        });

        // Send approval request to hospitals
        const hospitals = await User.find({ role: "hospital" });
        for (const hospital of hospitals) {
            await Notification.create({
                recipient: hospital._id,
                type: "new_alert",
                message: `New camp "${name}" scheduled by ${req.user.organization_name || req.user.full_name} requires your approval.`,
                relatedId: camp._id,
                relatedModel: "Camp",
            });
        }

        // Send approval request to government
        const government = await User.find({ role: "government" });
        for (const gov of government) {
            await Notification.create({
                recipient: gov._id,
                type: "new_alert",
                message: `New camp "${name}" scheduled by ${req.user.organization_name || req.user.full_name} requires government approval.`,
                relatedId: camp._id,
                relatedModel: "Camp",
            });
        }

        // Send resource requests to hospitals and pharmacies
        if (resourceRequests && resourceRequests.length > 0) {
            for (const request of resourceRequests) {
                if (request.targetOrganization) {
                    await Notification.create({
                        recipient: request.targetOrganization,
                        type: "new_request",
                        message: `Resource request for camp "${name}": ${request.quantity} ${request.itemName}`,
                        relatedId: camp._id,
                        relatedModel: "Camp",
                    });
                }
            }
        }

        const populatedCamp = await Camp.findById(camp._id)
            .populate("organizer", "full_name organization_name email")
            .populate("resourceRequests.targetOrganization", "full_name organization_name");
        res.status(201).json(populatedCamp);
    } catch (error) {
        console.error("Create camp error:", error);
        res.status(500).json({ message: "Error creating camp", error: error.message });
    }
};

// @desc    Update a camp
// @route   PUT /api/camps/:id
// @access  Private (Only organizer can update)
const updateCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        // Check if user is the organizer
        if (camp.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this camp" });
        }

        const { name, date, location, description, contact_phone, status, coordinates } = req.body;

        let campCoordinates = coordinates || camp.coordinates;

        // If location changed but coordinates didn't, re-geocode
        if (location && location !== camp.location && (!coordinates || !coordinates.lat)) {
            campCoordinates = await geocodeAddress(location);
        }

        const updatedCamp = await Camp.findByIdAndUpdate(
            req.params.id,
            {
                name: name || camp.name,
                date: date || camp.date,
                location: location || camp.location,
                description: description !== undefined ? description : camp.description,
                contact_phone: contact_phone !== undefined ? contact_phone : camp.contact_phone,
                status: status || camp.status,
                coordinates: campCoordinates,
            },
            { new: true, runValidators: true }
        ).populate("organizer", "full_name organization_name email");

        res.status(200).json(updatedCamp);
    } catch (error) {
        console.error("Update camp error:", error);
        res.status(500).json({ message: "Error updating camp", error: error.message });
    }
};

// @desc    Delete a camp
// @route   DELETE /api/camps/:id
// @access  Private (Only organizer can delete)
const deleteCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        // Check if user is the organizer
        if (camp.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this camp" });
        }

        await Camp.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Camp deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("Delete camp error:", error);
        res.status(500).json({ message: "Error deleting camp", error: error.message });
    }
};

// @desc    Approve a camp (Hospital)
// @route   PUT /api/camps/:id/approve
// @access  Private (Hospital only)
const approveCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        if (req.user.role !== "hospital") {
            return res.status(403).json({ message: "Only hospitals can approve camps" });
        }

        if (camp.hospitalApproval.status === "approved") {
            return res.status(400).json({ message: "Camp is already approved by hospital" });
        }

        camp.hospitalApproval.status = "approved";
        camp.hospitalApproval.approvedBy = req.user.id;
        camp.hospitalApproval.approvedAt = new Date();

        // Check if both hospital and government have approved
        if (camp.governmentApproval.status === "approved") {
            camp.approvalStatus = "approved";

            // Notify all users about the approved camp
            const allUsers = await User.find({});
            for (const user of allUsers) {
                await Notification.create({
                    recipient: user._id,
                    type: "new_alert",
                    message: `New camp "${camp.name}" has been approved and will take place on ${new Date(camp.date).toLocaleDateString()} at ${camp.location}.`,
                    relatedId: camp._id,
                    relatedModel: "Camp",
                });
            }
        }

        await camp.save();

        // Notify NGO organizer
        await Notification.create({
            recipient: camp.organizer,
            type: "request_update",
            message: `Your camp "${camp.name}" has been approved by hospital.${camp.approvalStatus === "approved" ? " The camp is now fully approved!" : " Waiting for government approval."}`,
            relatedId: camp._id,
            relatedModel: "Camp",
        });

        const populatedCamp = await Camp.findById(camp._id)
            .populate("organizer", "full_name organization_name email")
            .populate("hospitalApproval.approvedBy", "full_name organization_name")
            .populate("governmentApproval.approvedBy", "full_name organization_name");

        res.status(200).json(populatedCamp);
    } catch (error) {
        console.error("Approve camp error:", error);
        res.status(500).json({ message: "Error approving camp", error: error.message });
    }
};

// @desc    Approve a camp (Government)
// @route   PUT /api/camps/:id/approve-government
// @access  Private (Government only)
const approveGovernmentCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can approve camps" });
        }

        if (camp.governmentApproval.status === "approved") {
            return res.status(400).json({ message: "Camp is already approved by government" });
        }

        camp.governmentApproval.status = "approved";
        camp.governmentApproval.approvedBy = req.user.id;
        camp.governmentApproval.approvedAt = new Date();

        // Check if both hospital and government have approved
        if (camp.hospitalApproval.status === "approved") {
            camp.approvalStatus = "approved";

            // Notify all users about the approved camp
            const allUsers = await User.find({});
            for (const user of allUsers) {
                await Notification.create({
                    recipient: user._id,
                    type: "new_alert",
                    message: `New camp "${camp.name}" has been approved and will take place on ${new Date(camp.date).toLocaleDateString()} at ${camp.location}.`,
                    relatedId: camp._id,
                    relatedModel: "Camp",
                });
            }
        }

        await camp.save();

        // Notify NGO organizer
        await Notification.create({
            recipient: camp.organizer,
            type: "request_update",
            message: `Your camp "${camp.name}" has been approved by government.${camp.approvalStatus === "approved" ? " The camp is now fully approved!" : " Waiting for hospital approval."}`,
            relatedId: camp._id,
            relatedModel: "Camp",
        });

        const populatedCamp = await Camp.findById(camp._id)
            .populate("organizer", "full_name organization_name email")
            .populate("hospitalApproval.approvedBy", "full_name organization_name")
            .populate("governmentApproval.approvedBy", "full_name organization_name");

        res.status(200).json(populatedCamp);
    } catch (error) {
        console.error("Approve camp error:", error);
        res.status(500).json({ message: "Error approving camp", error: error.message });
    }
};

// @desc    Reject a camp
// @route   PUT /api/camps/:id/reject
// @access  Private (Hospital/Government)
const rejectCamp = async (req, res) => {
    try {
        const { reason } = req.body;
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        if (req.user.role !== "hospital" && req.user.role !== "government") {
            return res.status(403).json({ message: "Only hospitals and government can reject camps" });
        }

        if (req.user.role === "hospital") {
            camp.hospitalApproval.status = "rejected";
            camp.hospitalApproval.rejectionReason = reason;
        } else if (req.user.role === "government") {
            camp.governmentApproval.status = "rejected";
            camp.governmentApproval.rejectionReason = reason;
        }

        camp.approvalStatus = "rejected";
        camp.rejectionReason = reason || "No reason provided";
        await camp.save();

        // Notify NGO organizer
        await Notification.create({
            recipient: camp.organizer,
            type: "request_update",
            message: `Your camp "${camp.name}" has been rejected by ${req.user.organization_name || req.user.full_name}. Reason: ${camp.rejectionReason}`,
            relatedId: camp._id,
            relatedModel: "Camp",
        });

        const populatedCamp = await Camp.findById(camp._id)
            .populate("organizer", "full_name organization_name email");

        res.status(200).json(populatedCamp);
    } catch (error) {
        console.error("Reject camp error:", error);
        res.status(500).json({ message: "Error rejecting camp", error: error.message });
    }
};

// @desc    Register for a camp
// @route   POST /api/camps/:id/register
// @access  Private
const registerForCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id).populate("organizer", "full_name organization_name");

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        // Check if user already registered
        const alreadyRegistered = camp.registrations.some(
            (reg) => reg.user.toString() === req.user.id
        );

        if (alreadyRegistered) {
            return res.status(400).json({ message: "You are already registered for this camp" });
        }

        // Add registration
        camp.registrations.push({
            user: req.user.id,
            registeredAt: new Date(),
        });

        await camp.save();

        // Notify hospitals
        const hospitals = await User.find({ role: "hospital" });
        for (const hospital of hospitals) {
            await Notification.create({
                recipient: hospital._id,
                type: "new_alert",
                message: `${req.user.full_name} has registered for camp "${camp.name}" organized by ${camp.organizer.organization_name || camp.organizer.full_name}.`,
                relatedId: camp._id,
                relatedModel: "Camp",
            });
        }

        // Notify government
        const government = await User.find({ role: "government" });
        for (const gov of government) {
            await Notification.create({
                recipient: gov._id,
                type: "new_alert",
                message: `${req.user.full_name} has registered for camp "${camp.name}" organized by ${camp.organizer.organization_name || camp.organizer.full_name}.`,
                relatedId: camp._id,
                relatedModel: "Camp",
            });
        }

        // Notify NGO organizer
        await Notification.create({
            recipient: camp.organizer._id,
            type: "new_alert",
            message: `${req.user.full_name} has registered for your camp "${camp.name}".`,
            relatedId: camp._id,
            relatedModel: "Camp",
        });

        res.status(200).json({ message: "Successfully registered for camp", camp });
    } catch (error) {
        console.error("Register for camp error:", error);
        res.status(500).json({ message: "Error registering for camp", error: error.message });
    }
};

module.exports = {
    getCamps,
    getCampById,
    createCamp,
    updateCamp,
    deleteCamp,
    approveCamp,
    approveGovernmentCamp,
    rejectCamp,
    registerForCamp,
};
