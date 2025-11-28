const Policy = require("../models/Policy");
const Notification = require("../models/Notification");
const User = require("../models/User");

// @desc    Get all policies
// @route   GET /api/policies
// @access  Public
const getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find({ isActive: true })
            .sort({ role: 1, sectionNumber: 1 })
            .populate("lastUpdatedBy", "full_name organization_name");
        res.status(200).json(policies);
    } catch (error) {
        console.error("Get all policies error:", error);
        res.status(500).json({ message: "Error fetching policies", error: error.message });
    }
};

// @desc    Get policies by role
// @route   GET /api/policies/:role
// @access  Public
const getPoliciesByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const policies = await Policy.find({ role, isActive: true })
            .sort({ sectionNumber: 1 })
            .populate("lastUpdatedBy", "full_name organization_name");
        res.status(200).json(policies);
    } catch (error) {
        console.error("Get policies by role error:", error);
        res.status(500).json({ message: "Error fetching policies", error: error.message });
    }
};

// @desc    Create a new policy
// @route   POST /api/policies
// @access  Private (Government only)
const createPolicy = async (req, res) => {
    try {
        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can create policies" });
        }

        const { role, sectionTitle, sectionNumber, policyItems } = req.body;

        if (!role || !sectionTitle || !sectionNumber || !policyItems || policyItems.length === 0) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const policy = await Policy.create({
            role,
            sectionTitle,
            sectionNumber,
            policyItems,
            lastUpdatedBy: req.user.id,
        });

        const populatedPolicy = await Policy.findById(policy._id)
            .populate("lastUpdatedBy", "full_name organization_name");

        // Send notifications to all users
        const allUsers = await User.find({});
        const roleDisplayName = role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: "policy_update",
            message: `New policy added: ${roleDisplayName} - ${sectionTitle}`,
            relatedId: policy._id,
            relatedModel: "Policy",
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(populatedPolicy);
    } catch (error) {
        console.error("Create policy error:", error);
        res.status(500).json({ message: "Error creating policy", error: error.message });
    }
};

// @desc    Update a policy
// @route   PUT /api/policies/:id
// @access  Private (Government only)
const updatePolicy = async (req, res) => {
    try {
        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can update policies" });
        }

        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        const { sectionTitle, sectionNumber, policyItems } = req.body;

        // Increment version
        policy.version += 1;
        policy.sectionTitle = sectionTitle || policy.sectionTitle;
        policy.sectionNumber = sectionNumber !== undefined ? sectionNumber : policy.sectionNumber;
        policy.policyItems = policyItems || policy.policyItems;
        policy.lastUpdatedBy = req.user.id;

        await policy.save();

        const populatedPolicy = await Policy.findById(policy._id)
            .populate("lastUpdatedBy", "full_name organization_name");

        // Send notifications to all users
        const allUsers = await User.find({});
        const roleDisplayName = policy.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: "policy_update",
            message: `Policy updated: ${roleDisplayName} - ${policy.sectionTitle}`,
            relatedId: policy._id,
            relatedModel: "Policy",
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(200).json(populatedPolicy);
    } catch (error) {
        console.error("Update policy error:", error);
        res.status(500).json({ message: "Error updating policy", error: error.message });
    }
};

// @desc    Delete a policy
// @route   DELETE /api/policies/:id
// @access  Private (Government only)
const deletePolicy = async (req, res) => {
    try {
        if (req.user.role !== "government") {
            return res.status(403).json({ message: "Only government can delete policies" });
        }

        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        // Soft delete by setting isActive to false
        policy.isActive = false;
        policy.lastUpdatedBy = req.user.id;
        await policy.save();

        // Send notifications to all users
        const allUsers = await User.find({});
        const roleDisplayName = policy.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: "policy_update",
            message: `Policy removed: ${roleDisplayName} - ${policy.sectionTitle}`,
            relatedId: policy._id,
            relatedModel: "Policy",
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(200).json({ message: "Policy deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("Delete policy error:", error);
        res.status(500).json({ message: "Error deleting policy", error: error.message });
    }
};

module.exports = {
    getAllPolicies,
    getPoliciesByRole,
    createPolicy,
    updatePolicy,
    deletePolicy,
};
