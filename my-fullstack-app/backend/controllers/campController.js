const Camp = require("../models/Camp");

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

        const camps = await Camp.find(query).sort({ date: 1 }).populate("organizer", "full_name organization_name email");
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
        const camp = await Camp.findById(req.params.id).populate("organizer", "full_name organization_name email phone");

        if (!camp) {
            return res.status(404).json({ message: "Camp not found" });
        }

        res.status(200).json(camp);
    } catch (error) {
        console.error("Get camp by ID error:", error);
        res.status(500).json({ message: "Error fetching camp", error: error.message });
    }
};

// @desc    Create a camp
// @route   POST /api/camps
// @access  Private (Hospital/NGO/BloodBank)
const createCamp = async (req, res) => {
    const { name, date, location, description, contact_phone, coordinates } = req.body;

    if (!name || !date || !location) {
        return res.status(400).json({ message: "Please add all required fields: name, date, and location" });
    }

    try {
        const camp = await Camp.create({
            name,
            date,
            location,
            description,
            contact_phone,
            coordinates,
            organizer: req.user.id,
        });

        const populatedCamp = await Camp.findById(camp._id).populate("organizer", "full_name organization_name email");
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

        const { name, date, location, description, contact_phone, status } = req.body;

        const updatedCamp = await Camp.findByIdAndUpdate(
            req.params.id,
            {
                name: name || camp.name,
                date: date || camp.date,
                location: location || camp.location,
                description: description !== undefined ? description : camp.description,
                contact_phone: contact_phone !== undefined ? contact_phone : camp.contact_phone,
                status: status || camp.status,
                coordinates: req.body.coordinates || camp.coordinates,
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

module.exports = {
    getCamps,
    getCampById,
    createCamp,
    updateCamp,
    deleteCamp,
};
