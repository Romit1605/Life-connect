const mongoose = require("mongoose");

const campSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a camp name"],
            trim: true,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: [true, "Please add a date"],
            validate: {
                validator: function (value) {
                    // Allow past dates for completed camps
                    return true;
                },
                message: "Please provide a valid date"
            }
        },
        location: {
            type: String,
            required: [true, "Please add a location"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        contact_phone: {
            type: String,
            trim: true,
            match: [/^[\d\s\-\+\(\)]+$/, "Please provide a valid phone number"],
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

// Indexes for faster queries
campSchema.index({ date: 1 });
campSchema.index({ location: 1 });
campSchema.index({ status: 1 });
campSchema.index({ organizer: 1 });

module.exports = mongoose.model("Camp", campSchema);
