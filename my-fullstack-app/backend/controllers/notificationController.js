const Notification = require("../models/Notification");

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate("sender", "full_name organization_name role")
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Check if user is the recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        console.error("Mark notification read error:", error);
        res.status(500).json({ message: "Error updating notification", error: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({ message: "Error updating notifications", error: error.message });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};
