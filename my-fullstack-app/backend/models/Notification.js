const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: [
                "new_request",           // New medicine/blood request
                "request_update",        // Request status changed
                "request_fulfilled",     // Request fulfilled
                "request_rejected",      // Request rejected
                "new_alert",            // New blood expiry alert
                "alert_approved",       // Alert approved by NGO/Hospital
                "alert_rejected",       // Alert rejected by NGO/Hospital
                "donation_received",    // New donation received
                "camp_registered",      // Volunteer registered for camp
                "policy_update",        // New policy added or updated
                "volunteer_application", // New volunteer application
                "volunteer_approved",   // Volunteer application approved
                "volunteer_rejected",   // Volunteer application rejected
                "volunteer_request",    // New volunteer request posted
                "certificate_issued",   // Certificate issued to volunteer
                "system"                // System notifications
            ],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            // Can reference Request, Alert, Donation, Camp, or Policy
        },
        relatedModel: {
            type: String,
            enum: ["Request", "Alert", "Donation", "Camp", "Policy", "VolunteerApplication", "Certificate", "VolunteerRequest"],
        },
        actionUrl: {
            type: String,
            // URL to navigate to when notification is clicked
        },
        metadata: {
            // Additional data specific to notification type
            type: mongoose.Schema.Types.Mixed,
        },
        read: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ sender: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
