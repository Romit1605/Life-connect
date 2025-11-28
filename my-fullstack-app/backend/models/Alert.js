const mongoose = require("mongoose");

const alertSchema = mongoose.Schema(
    {
        bloodBank: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        alertType: {
            type: String,
            enum: ["blood", "medicine"],
            default: "blood",
        },
        bloodType: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            required: function () { return this.alertType === "blood"; },
        },
        medicineName: {
            type: String,
            required: function () { return this.alertType === "medicine"; },
        },
        batchNumber: {
            type: String,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        urgency: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
        message: {
            type: String,
            required: true,
        },
        location: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "acknowledged"],
            default: "pending",
        },
        responses: [
            {
                respondent: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                action: {
                    type: String,
                    enum: ["approved", "rejected"],
                },
                message: String,
                respondedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        acknowledgedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
alertSchema.index({ bloodBank: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ expiryDate: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Alert", alertSchema);
