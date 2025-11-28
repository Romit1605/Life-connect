const mongoose = require("mongoose");

const certificateSchema = mongoose.Schema(
    {
        volunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        camp: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Camp",
            required: true,
        },
        ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        certificateId: {
            type: String,
            required: true,
            unique: true,
        },
        volunteerName: {
            type: String,
            required: true,
        },
        campName: {
            type: String,
            required: true,
        },
        campType: {
            type: String,
            enum: ["blood", "pharmacy", "both"],
            required: true,
        },
        hoursWorked: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        issuedDate: {
            type: Date,
            default: Date.now,
        },
        programDirector: {
            type: String,
            default: "Program Director",
        },
        medicalCoordinator: {
            type: String,
            default: "Medical Coordinator",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
certificateSchema.index({ volunteer: 1 });
certificateSchema.index({ camp: 1 });
certificateSchema.index({ ngo: 1 });
certificateSchema.index({ certificateId: 1 });

module.exports = mongoose.model("Certificate", certificateSchema);
