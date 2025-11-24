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
        },
        quantity: {
            type: Number,
            required: true,
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
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Request", requestSchema);
