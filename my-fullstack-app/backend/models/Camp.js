const mongoose = require("mongoose");

const campSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a camp name"],
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: [true, "Please add a date"],
        },
        location: {
            type: String,
            required: [true, "Please add a location"],
        },
        description: {
            type: String,
        },
        contact_phone: {
            type: String,
        },
        status: {
            type: String,
            enum: ["upcoming", "completed", "cancelled"],
            default: "upcoming",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Camp", campSchema);
