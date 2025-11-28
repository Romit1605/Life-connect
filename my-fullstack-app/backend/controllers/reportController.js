const Camp = require("../models/Camp");
const Request = require("../models/Request");
const Donation = require("../models/Donation");
const User = require("../models/User");
const Policy = require("../models/Policy");

// @desc    Generate comprehensive government report
// @route   GET /api/reports/comprehensive
// @access  Private (Government only)
const generateComprehensiveReport = async (req, res) => {
    try {
        // Check if user is government
        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can access reports" });
        }

        const { startDate, endDate } = req.query;
        let dateFilter = {};

        // Apply date filtering if provided
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Fetch all camps with approval details
        const camps = await Camp.find(dateFilter)
            .populate("organizer", "full_name organization_name email phone")
            .populate("hospitalApproval.approvedBy", "full_name organization_name")
            .populate("governmentApproval.approvedBy", "full_name organization_name")
            .sort({ createdAt: -1 });

        // Fetch all blood requests
        const bloodRequests = await Request.find({ type: "blood", ...dateFilter })
            .populate("requester", "full_name organization_name email phone location")
            .populate("approvedBy", "full_name organization_name")
            .sort({ createdAt: -1 });

        // Fetch all medicine requests
        const medicineRequests = await Request.find({ type: "medicine", ...dateFilter })
            .populate("requester", "full_name organization_name email phone location")
            .populate("approvedBy", "full_name organization_name")
            .sort({ createdAt: -1 });

        // Fetch all donations for statistics
        const donations = await Donation.find(dateFilter)
            .populate("donor", "full_name email")
            .sort({ createdAt: -1 });

        // Fetch all policies
        const policies = await Policy.find(dateFilter)
            .populate("lastUpdatedBy", "full_name organization_name")
            .sort({ role: 1, sectionNumber: 1 });

        // Calculate statistics
        const stats = {
            camps: {
                total: camps.length,
                approved: camps.filter(c => c.approvalStatus === "approved").length,
                rejected: camps.filter(c => c.approvalStatus === "rejected").length,
                pending: camps.filter(c => c.approvalStatus === "pending").length,
            },
            bloodRequests: {
                total: bloodRequests.length,
                fulfilled: bloodRequests.filter(r => r.status === "fulfilled").length,
                pending: bloodRequests.filter(r => r.status === "pending").length,
                cancelled: bloodRequests.filter(r => r.status === "cancelled").length,
            },
            medicineRequests: {
                total: medicineRequests.length,
                fulfilled: medicineRequests.filter(r => r.status === "fulfilled").length,
                pending: medicineRequests.filter(r => r.status === "pending").length,
                cancelled: medicineRequests.filter(r => r.status === "cancelled").length,
            },
            donations: {
                total: donations.length,
                totalUnits: donations.reduce((sum, d) => sum + (d.quantity || 0), 0),
            },
            policies: {
                total: policies.length,
                byRole: {
                    pharmacy: policies.filter(p => p.role === "pharmacy").length,
                    blood_bank: policies.filter(p => p.role === "blood_bank").length,
                    hospital: policies.filter(p => p.role === "hospital").length,
                    ngo: policies.filter(p => p.role === "ngo").length,
                }
            }
        };

        // Prepare comprehensive report data
        const report = {
            generatedAt: new Date(),
            generatedBy: {
                id: req.user.id,
                name: req.user.full_name || req.user.organization_name,
                email: req.user.email,
            },
            dateRange: {
                startDate: startDate || "All time",
                endDate: endDate || "Present",
            },
            statistics: stats,
            camps: camps.map(camp => ({
                id: camp._id,
                name: camp.name,
                organizer: camp.organizer?.organization_name || camp.organizer?.full_name || "Unknown",
                organizerEmail: camp.organizer?.email || "",
                organizerPhone: camp.organizer?.phone || "",
                date: camp.date,
                location: camp.location,
                status: camp.status,
                approvalStatus: camp.approvalStatus,
                hospitalApproval: {
                    status: camp.hospitalApproval?.status || "pending",
                    approvedBy: camp.hospitalApproval?.approvedBy?.organization_name || camp.hospitalApproval?.approvedBy?.full_name || "",
                    approvedAt: camp.hospitalApproval?.approvedAt || null,
                    rejectionReason: camp.hospitalApproval?.rejectionReason || "",
                },
                governmentApproval: {
                    status: camp.governmentApproval?.status || "pending",
                    approvedBy: camp.governmentApproval?.approvedBy?.organization_name || camp.governmentApproval?.approvedBy?.full_name || "",
                    approvedAt: camp.governmentApproval?.approvedAt || null,
                    rejectionReason: camp.governmentApproval?.rejectionReason || "",
                },
                volunteersNeeded: camp.volunteersNeeded || 0,
                registrations: camp.registrations?.length || 0,
                createdAt: camp.createdAt,
            })),
            bloodRequests: bloodRequests.map(req => ({
                id: req._id,
                requester: req.requester?.organization_name || req.requester?.full_name || "Unknown",
                requesterEmail: req.requester?.email || "",
                requesterPhone: req.requester?.phone || "",
                requesterLocation: req.requester?.location || "",
                bloodType: req.item_name,
                quantity: req.quantity,
                urgency: req.urgency,
                status: req.status,
                approvedBy: req.approvedBy?.organization_name || req.approvedBy?.full_name || "",
                notes: req.notes || "",
                createdAt: req.createdAt,
                updatedAt: req.updatedAt,
            })),
            medicineRequests: medicineRequests.map(req => ({
                id: req._id,
                requester: req.requester?.organization_name || req.requester?.full_name || "Unknown",
                requesterEmail: req.requester?.email || "",
                requesterPhone: req.requester?.phone || "",
                requesterLocation: req.requester?.location || "",
                medicineName: req.item_name,
                quantity: req.quantity,
                urgency: req.urgency,
                status: req.status,
                approvedBy: req.approvedBy?.organization_name || req.approvedBy?.full_name || "",
                notes: req.notes || "",
                createdAt: req.createdAt,
                updatedAt: req.updatedAt,
            })),
            policies: policies.map(policy => ({
                id: policy._id,
                role: policy.role,
                sectionTitle: policy.sectionTitle,
                sectionNumber: policy.sectionNumber,
                policyItems: policy.policyItems,
                version: policy.version,
                lastUpdatedBy: policy.lastUpdatedBy?.organization_name || policy.lastUpdatedBy?.full_name || "",
                createdAt: policy.createdAt,
                updatedAt: policy.updatedAt,
            })),
        };

        res.status(200).json(report);
    } catch (error) {
        console.error("Generate report error:", error);
        res.status(500).json({ message: "Error generating report", error: error.message });
    }
};

module.exports = {
    generateComprehensiveReport,
};
