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
        },
        units: {
            type: Number,
            default: 1,
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
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Donation", donationSchema);
