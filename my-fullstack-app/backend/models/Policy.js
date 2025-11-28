const mongoose = require("mongoose");

const policySchema = mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["pharmacy", "blood_bank", "hospital", "ngo"],
            required: true,
        },
        sectionTitle: {
            type: String,
            required: true,
            trim: true,
        },
        sectionNumber: {
            type: Number,
            required: true,
        },
        policyItems: [
            {
                type: String,
                trim: true,
            }
        ],
        version: {
            type: Number,
            default: 1,
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
policySchema.index({ role: 1, isActive: 1 });
policySchema.index({ role: 1, sectionNumber: 1 });

module.exports = mongoose.model("Policy", policySchema);
