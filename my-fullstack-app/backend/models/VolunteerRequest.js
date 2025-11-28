const mongoose = require("mongoose");

const volunteerRequestSchema = mongoose.Schema(
    {
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
        volunteersNeeded: {
            type: Number,
            required: true,
            min: 1,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        requiredSkills: {
            type: String,
            trim: true,
        },
        responsibilities: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["open", "closed", "fulfilled"],
            default: "open",
        },
        deadline: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
volunteerRequestSchema.index({ camp: 1 });
volunteerRequestSchema.index({ ngo: 1 });
volunteerRequestSchema.index({ status: 1 });

module.exports = mongoose.model("VolunteerRequest", volunteerRequestSchema);
