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

// @desc    Get all donations (for admin/hospital view)
// @route   GET /api/donations/all
// @access  Public
const getAllDonations = async (req, res) => {
    try {
        const { blood_type, status, startDate, endDate } = req.query;
        let query = {};

        // Filter by blood type if provided
        if (blood_type) {
            query.blood_type = blood_type;
        }

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Filter by date range if provided
        if (startDate || endDate) {
            query.donation_date = {};
            if (startDate) query.donation_date.$gte = new Date(startDate);
            if (endDate) query.donation_date.$lte = new Date(endDate);
        }

        const donations = await Donation.find(query)
            .sort({ donation_date: -1 })
            .populate("donor", "full_name email blood_type phone location")
            .populate("camp", "name location date");

        res.status(200).json(donations);
    } catch (error) {
        console.error("Get all donations error:", error);
        res.status(500).json({ message: "Error fetching donations", error: error.message });
    }
};

// @desc    Get donation statistics
// @route   GET /api/donations/stats
// @access  Public
const getDonationStats = async (req, res) => {
    try {
        // Total donations count
        const totalDonations = await Donation.countDocuments();

        // Total units donated
        const unitsResult = await Donation.aggregate([
            {
                $group: {
                    _id: null,
                    totalUnits: { $sum: "$units" }
                }
            }
        ]);
        const totalUnits = unitsResult.length > 0 ? unitsResult[0].totalUnits : 0;

        // Donations by blood type
        const byBloodType = await Donation.aggregate([
            {
                $group: {
                    _id: "$blood_type",
                    count: { $sum: 1 },
                    units: { $sum: "$units" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Donations by status
        const byStatus = await Donation.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent donations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentDonations = await Donation.countDocuments({
            donation_date: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            totalDonations,
            totalUnits,
            byBloodType,
            byStatus,
            recentDonations
        });
    } catch (error) {
        console.error("Get donation stats error:", error);
        res.status(500).json({ message: "Error fetching donation statistics", error: error.message });
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

// @desc    Update a donation
// @route   PUT /api/donations/:id
// @access  Private (Only donor can update)
const updateDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Check if user is the donor
        if (donation.donor.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this donation" });
        }

        const { camp, blood_type, units, location, donation_date, status } = req.body;

        const updatedDonation = await Donation.findByIdAndUpdate(
            req.params.id,
            {
                camp: camp || donation.camp,
                blood_type: blood_type || donation.blood_type,
                units: units !== undefined ? units : donation.units,
                location: location !== undefined ? location : donation.location,
                donation_date: donation_date || donation.donation_date,
                status: status || donation.status,
            },
            { new: true, runValidators: true }
        ).populate("donor", "full_name email blood_type")
            .populate("camp", "name location date");

        res.status(200).json(updatedDonation);
    } catch (error) {
        console.error("Update donation error:", error);
        res.status(500).json({ message: "Error updating donation", error: error.message });
    }
};

// @desc    Delete a donation
// @route   DELETE /api/donations/:id
// @access  Private (Only donor can delete)
const deleteDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Check if user is the donor
        if (donation.donor.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this donation" });
        }

        await Donation.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Donation deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("Delete donation error:", error);
        res.status(500).json({ message: "Error deleting donation", error: error.message });
    }
};

module.exports = {
    getDonations,
    getAllDonations,
    getDonationStats,
    createDonation,
    updateDonation,
    deleteDonation,
};
