const Request = require("../models/Request");
const Notification = require("../models/Notification");
const User = require("../models/User");

// @desc    Get all requests
// @route   GET /api/requests
// @access  Public
const getRequests = async (req, res) => {
    try {
        const { type, urgency, status, startDate, endDate } = req.query;
        let query = {};

        // Filter by type if provided
        if (type) {
            query.type = type;
        }

        // Filter by urgency if provided
        if (urgency) {
            query.urgency = urgency;
        }

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Filter by date range if provided
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const requests = await Request.find(query)
            .sort({ createdAt: -1 })
            .populate("requester", "full_name organization_name email phone location");
        res.status(200).json(requests);
    } catch (error) {
        console.error("Get requests error:", error);
        res.status(500).json({ message: "Error fetching requests", error: error.message });
    }
};

// @desc    Get a single request by ID
// @route   GET /api/requests/:id
// @access  Public
const getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate("requester", "full_name organization_name email phone location");

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(200).json(request);
    } catch (error) {
        console.error("Get request by ID error:", error);
        res.status(500).json({ message: "Error fetching request", error: error.message });
    }
};

// @desc    Create a request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
    const { type, item_name, quantity, urgency, location, notes } = req.body;

    if (!type || !item_name || !quantity) {
        return res.status(400).json({ message: "Please add all required fields: type, item_name, and quantity" });
    }

    try {
        const request = await Request.create({
            requester: req.user.id,
            type,
            item_name,
            quantity,
            urgency: urgency || "medium",
            location,
            notes,
        });

        const populatedRequest = await Request.findById(request._id)
            .populate("requester", "full_name organization_name email phone location");

        // Create notifications for relevant users based on request type
        let targetRole;
        if (type === "medicine") {
            targetRole = "pharmacy";
        } else if (type === "blood") {
            targetRole = "blood_bank";
        }

        if (targetRole) {
            // Find all users with the target role
            const targetUsers = await User.find({ role: targetRole }).select("_id");

            // Create notifications for all target users
            const notifications = targetUsers.map(user => ({
                recipient: user._id,
                type: "new_request",
                message: `New ${type} request: ${item_name} (${quantity} units) - ${urgency} urgency`,
                relatedId: request._id,
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error("Create request error:", error);
        res.status(500).json({ message: "Error creating request", error: error.message });
    }
};


// @desc    Update a request
// @route   PUT /api/requests/:id
// @access  Private (Requester can update all, others can update status)
const updateRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        const { type, item_name, quantity, urgency, location, notes, status } = req.body;
        const isRequester = request.requester.toString() === req.user.id;

        // If not requester, only allow status update
        if (!isRequester) {
            // Check if only status is being updated (or nothing)
            const otherFieldsUpdated = type || item_name || quantity || urgency || location || notes;
            if (otherFieldsUpdated) {
                return res.status(403).json({ message: "Not authorized to update request details" });
            }

            // If status is updated, it must be to fulfilled or cancelled
            if (status && !["fulfilled", "cancelled"].includes(status)) {
                return res.status(400).json({ message: "Invalid status update" });
            }
        }

        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            {
                type: isRequester ? (type || request.type) : request.type,
                item_name: isRequester ? (item_name || request.item_name) : request.item_name,
                quantity: isRequester && quantity !== undefined ? quantity : request.quantity,
                urgency: isRequester ? (urgency || request.urgency) : request.urgency,
                location: isRequester && location !== undefined ? location : request.location,
                notes: isRequester && notes !== undefined ? notes : request.notes,
                status: status || request.status,
            },
            { new: true, runValidators: true }
        ).populate("requester", "full_name organization_name email phone location");

        // Create notification if status changed and user is not requester
        if (status && status !== request.status && !isRequester) {
            await Notification.create({
                recipient: request.requester,
                type: "request_update",
                message: `Your request for ${request.item_name} has been ${status}.`,
                relatedId: request._id,
            });
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error("Update request error:", error);
        res.status(500).json({ message: "Error updating request", error: error.message });
    }
};

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private (Only requester can delete)
const deleteRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Check if user is the requester
        if (request.requester.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this request" });
        }

        await Request.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Request deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("Delete request error:", error);
        res.status(500).json({ message: "Error deleting request", error: error.message });
    }
};

module.exports = {
    getRequests,
    getRequestById,
    createRequest,
    updateRequest,
    deleteRequest,
};
