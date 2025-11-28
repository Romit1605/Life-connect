const mongoose = require("mongoose");

const requestSchema = mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["blood", "medicine"],
            required: true,
        },
        item_name: {
            type: String, // e.g., "A+" or "Paracetamol"
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
        },
        urgency: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["pending", "fulfilled", "cancelled"],
            default: "pending",
        },
        location: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
requestSchema.index({ type: 1 });
requestSchema.index({ urgency: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ requester: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Request", requestSchema);
