const Donation = require("../models/Donation");

// @desc    Get user donations
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.id })
            .sort({ donation_date: -1 })
            .populate("donor", "full_name email blood_type")
            .populate("camp", "name location date");
        res.status(200).json(donations);
    } catch (error) {
        console.error("Get donations error:", error);
        res.status(500).json({ message: "Error fetching donations", error: error.message });
    }
};

// @desc    Create a donation record
// @route   POST /api/donations
// @access  Private
const createDonation = async (req, res) => {
    const { camp, blood_type, units, location, donation_date } = req.body;

    if (!blood_type) {
        return res.status(400).json({ message: "Please add blood type" });
    }

    try {
        const donation = await Donation.create({
            donor: req.user.id,
            camp,
            blood_type,
            units: units || 1,
            location,
            donation_date: donation_date || Date.now(),
        });

        const populatedDonation = await Donation.findById(donation._id)
            .populate("donor", "full_name email blood_type")
            .populate("camp", "name location date");

        res.status(201).json(populatedDonation);
    } catch (error) {
        console.error("Create donation error:", error);
        res.status(500).json({ message: "Error creating donation", error: error.message });
    }
};

module.exports = {
    getDonations,
    createDonation,
};
