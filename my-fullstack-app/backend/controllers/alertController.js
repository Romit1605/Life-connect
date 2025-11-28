const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const User = require("../models/User");

// @desc    Create a new alert
// @route   POST /api/alerts
// @access  Private (Any authenticated user)
const createAlert = async (req, res) => {
    const {
        alertType = "blood",
        bloodType,
        medicineName,
        batchNumber,
        quantity,
        expiryDate,
        urgency,
        message,
        location
    } = req.body;

    // Validation based on alert type
    if (alertType === "blood") {
        if (!bloodType || !quantity || !expiryDate || !message) {
            return res.status(400).json({ message: "Please provide all required fields for blood alert" });
        }
    } else if (alertType === "medicine") {
        if (!medicineName || !quantity || !expiryDate || !message) {
            return res.status(400).json({ message: "Please provide all required fields for medicine alert" });
        }
    }

    try {
        const alertData = {
            bloodBank: req.user.id, // This field name is legacy but used for the creator
            alertType,
            quantity,
            expiryDate,
            urgency: urgency || "medium",
            message,
            location,
        };

        if (alertType === "blood") {
            alertData.bloodType = bloodType;
        } else {
            alertData.medicineName = medicineName;
            alertData.batchNumber = batchNumber;
        }

        const alert = await Alert.create(alertData);

        const populatedAlert = await Alert.findById(alert._id)
            .populate("bloodBank", "full_name organization_name email phone location");

        // Create notifications for NGOs and Hospitals
        const recipients = await User.find({
            role: { $in: ["ngo", "hospital", "government"] }
        }).select("_id");

        const alertTitle = alertType === "blood"
            ? `Blood Expiry Alert: ${bloodType}`
            : `Medicine Expiry Alert: ${medicineName}`;

        const notifications = recipients.map(user => ({
            recipient: user._id,
            sender: req.user.id,
            type: "new_alert",
            message: `🚨 ${alertTitle} (${quantity} units) expiring on ${new Date(expiryDate).toLocaleDateString()}`,
            relatedId: alert._id,
            relatedModel: "Alert",
            actionUrl: `/alerts/${alert._id}`,
            priority: urgency === "critical" ? "urgent" : urgency,
            metadata: {
                alertType,
                bloodType,
                medicineName,
                quantity,
                expiryDate,
                urgency,
            },
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(populatedAlert);
    } catch (error) {
        console.error("Create alert error:", error);
        res.status(500).json({ message: "Error creating alert", error: error.message });
    }
};

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
    try {
        const { status, urgency } = req.query;
        let query = {};

        // Blood banks see only their own alerts
        if (req.user.role === "blood_bank") {
            query.bloodBank = req.user.id;
        }

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Filter by urgency if provided
        if (urgency) {
            query.urgency = urgency;
        }

        const alerts = await Alert.find(query)
            .sort({ createdAt: -1 })
            .populate("bloodBank", "full_name organization_name email phone location")
            .populate("responses.respondent", "full_name organization_name role");

        res.status(200).json(alerts);
    } catch (error) {
        console.error("Get alerts error:", error);
        res.status(500).json({ message: "Error fetching alerts", error: error.message });
    }
};

// @desc    Get a single alert by ID
// @route   GET /api/alerts/:id
// @access  Private
const getAlertById = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id)
            .populate("bloodBank", "full_name organization_name email phone location")
            .populate("responses.respondent", "full_name organization_name role");

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        res.status(200).json(alert);
    } catch (error) {
        console.error("Get alert by ID error:", error);
        res.status(500).json({ message: "Error fetching alert", error: error.message });
    }
};

// @desc    Respond to an alert (approve/reject)
// @route   PUT /api/alerts/:id/respond
// @access  Private (Any authenticated user)
const respondToAlert = async (req, res) => {
    const { action, message } = req.body;

    // Debug log to check user role
    console.log("User attempting to respond:", {
        userId: req.user.id,
        userRole: req.user.role,
        userName: req.user.full_name || req.user.organization_name
    });

    if (!action || !["approved", "rejected"].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'approved' or 'rejected'" });
    }

    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        // Check if alert is already approved by someone else
        if (alert.status === "approved") {
            return res.status(400).json({
                message: "This alert has already been approved by another organization"
            });
        }

        // Check if user already responded
        const existingResponse = alert.responses.find(
            r => r.respondent.toString() === req.user.id
        );

        if (existingResponse) {
            return res.status(400).json({ message: "You have already responded to this alert" });
        }

        // Add response
        alert.responses.push({
            respondent: req.user.id,
            action,
            message: message || "",
        });

        // If approved, change alert status to "approved"
        if (action === "approved") {
            alert.status = "approved";
        }

        await alert.save();

        const updatedAlert = await Alert.findById(alert._id)
            .populate("bloodBank", "full_name organization_name email phone location")
            .populate("responses.respondent", "full_name organization_name role");

        // Create notification for blood bank
        await Notification.create({
            recipient: alert.bloodBank,
            sender: req.user.id,
            type: action === "approved" ? "alert_approved" : "alert_rejected",
            message: `${req.user.organization_name || req.user.full_name} ${action} your blood expiry alert for ${alert.bloodType}`,
            relatedId: alert._id,
            relatedModel: "Alert",
            actionUrl: `/alerts/${alert._id}`,
            priority: "high",
            metadata: {
                action,
                bloodType: alert.bloodType,
                quantity: alert.quantity,
            },
        });

        // If approved, notify all other NGOs and Hospitals that the alert has been approved
        if (action === "approved") {
            const otherRecipients = await User.find({
                role: { $in: ["ngo", "hospital"] },
                _id: { $ne: req.user.id } // Exclude the user who approved
            }).select("_id");

            const otherNotifications = otherRecipients.map(user => ({
                recipient: user._id,
                sender: req.user.id,
                type: "alert_approved",
                message: `${req.user.organization_name || req.user.full_name} has approved the blood expiry alert for ${alert.bloodType} (${alert.quantity} units)`,
                relatedId: alert._id,
                relatedModel: "Alert",
                actionUrl: `/alerts/${alert._id}`,
                priority: "medium",
                metadata: {
                    action: "approved",
                    bloodType: alert.bloodType,
                    quantity: alert.quantity,
                    approvedBy: req.user.organization_name || req.user.full_name,
                },
            }));

            if (otherNotifications.length > 0) {
                await Notification.insertMany(otherNotifications);
            }
        }

        res.status(200).json(updatedAlert);
    } catch (error) {
        console.error("Respond to alert error:", error);
        res.status(500).json({ message: "Error responding to alert", error: error.message });
    }
};

// @desc    Acknowledge alert responses
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private (Blood Bank only)
const acknowledgeAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        // Check if user is the blood bank that created the alert
        if (alert.bloodBank.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to acknowledge this alert" });
        }

        alert.status = "acknowledged";
        alert.acknowledgedAt = new Date();
        await alert.save();

        const updatedAlert = await Alert.findById(alert._id)
            .populate("bloodBank", "full_name organization_name email phone location")
            .populate("responses.respondent", "full_name organization_name role");

        res.status(200).json(updatedAlert);
    } catch (error) {
        console.error("Acknowledge alert error:", error);
        res.status(500).json({ message: "Error acknowledging alert", error: error.message });
    }
};

module.exports = {
    createAlert,
    getAlerts,
    getAlertById,
    respondToAlert,
    acknowledgeAlert,
};
