const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        full_name: {
            type: String,
            required: [true, "Please add a name"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: ["donor", "hospital", "ngo", "pharmacy", "blood_bank", "volunteer", "government"],
            default: "donor",
        },
        organization_name: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[\d\s\-\+\(\)]+$/, "Please provide a valid phone number"],
        },
        blood_type: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        location: {
            type: String,
            trim: true,
        },
        age: {
            type: Number,
            min: [1, "Age must be at least 1"],
            max: [150, "Age must be less than 150"],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ blood_type: 1 });
userSchema.index({ location: 1 });

module.exports = mongoose.model("User", userSchema);
