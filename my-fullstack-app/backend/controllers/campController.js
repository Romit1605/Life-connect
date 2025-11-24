const Camp = require("../models/Camp");

// @desc    Get all camps
// @route   GET /api/camps
// @access  Public
const getCamps = async (req, res) => {
    try {
        const camps = await Camp.find().sort({ date: 1 }).populate("organizer", "full_name organization_name email");
        res.status(200).json(camps);
    } catch (error) {
        console.error("Get camps error:", error);
        res.status(500).json({ message: "Error fetching camps", error: error.message });
    }
};

// @desc    Create a camp
// @route   POST /api/camps
// @access  Private (Hospital/NGO/BloodBank)
const createCamp = async (req, res) => {
    const { name, date, location, description, contact_phone } = req.body;

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
            organizer: req.user.id,
        });

        const populatedCamp = await Camp.findById(camp._id).populate("organizer", "full_name organization_name email");
        res.status(201).json(populatedCamp);
    } catch (error) {
        console.error("Create camp error:", error);
        res.status(500).json({ message: "Error creating camp", error: error.message });
    }
};

module.exports = {
    getCamps,
    createCamp,
};
