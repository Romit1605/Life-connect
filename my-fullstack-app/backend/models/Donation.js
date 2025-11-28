const mongoose = require("mongoose");

const donationSchema = mongoose.Schema(
    {
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        camp: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Camp",
        },
        blood_type: {
            type: String,
            required: [true, "Please add blood type"],
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        units: {
            type: Number,
            default: 1,
            min: [1, "Units must be at least 1"],
            max: [10, "Units cannot exceed 10"],
        },
        status: {
            type: String,
            enum: ["pending", "completed", "rejected"],
            default: "completed",
        },
        donation_date: {
            type: Date,
            default: Date.now,
        },
        location: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
donationSchema.index({ donor: 1 });
donationSchema.index({ blood_type: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ donation_date: -1 });
donationSchema.index({ camp: 1 });

module.exports = mongoose.model("Donation", donationSchema);
