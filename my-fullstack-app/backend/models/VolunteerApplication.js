const mongoose = require("mongoose");

const volunteerApplicationSchema = mongoose.Schema(
    {
        camp: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Camp",
            required: true,
        },
        volunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        applicationMessage: {
            type: String,
            trim: true,
        },
        skills: {
            type: String,
            trim: true,
        },
        availability: {
            type: String,
            trim: true,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewedAt: {
            type: Date,
        },
        rejectionReason: {
            type: String,
            trim: true,
        },
        hoursWorked: {
            type: Number,
            default: 0,
        },
        attendanceMarked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
volunteerApplicationSchema.index({ camp: 1 });
volunteerApplicationSchema.index({ volunteer: 1 });
volunteerApplicationSchema.index({ status: 1 });

module.exports = mongoose.model("VolunteerApplication", volunteerApplicationSchema);
