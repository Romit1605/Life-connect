const Request = require("../models/Request");

// @desc    Get all requests
// @route   GET /api/requests
// @access  Public
const getRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .sort({ createdAt: -1 })
            .populate("requester", "full_name organization_name email phone location");
        res.status(200).json(requests);
    } catch (error) {
        console.error("Get requests error:", error);
        res.status(500).json({ message: "Error fetching requests", error: error.message });
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

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error("Create request error:", error);
        res.status(500).json({ message: "Error creating request", error: error.message });
    }
};

module.exports = {
    getRequests,
    createRequest,
};
