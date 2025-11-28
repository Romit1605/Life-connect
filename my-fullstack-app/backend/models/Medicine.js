const mongoose = require("mongoose");

const medicineSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add medicine name"],
            trim: true,
        },
        batchNumber: {
            type: String,
            required: [true, "Please add batch number"],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, "Please add quantity"],
            min: [0, "Quantity cannot be negative"],
        },
        expiryDate: {
            type: Date,
            required: [true, "Please add expiry date"],
        },
        manufactureDate: {
            type: Date,
        },
        manufacturer: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        pharmacy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["Normal", "Warning", "Critical"],
            default: "Normal",
        },
    },
    {
        timestamps: true,
    }
);

// Calculate status before saving
medicineSchema.pre("save", function () {
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = Math.abs(expiry - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (expiry < today) {
        this.status = "Critical"; // Expired
    } else if (diffDays <= 30) {
        this.status = "Critical";
    } else if (diffDays <= 90) {
        this.status = "Warning";
    } else {
        this.status = "Normal";
    }
});

module.exports = mongoose.model("Medicine", medicineSchema);
