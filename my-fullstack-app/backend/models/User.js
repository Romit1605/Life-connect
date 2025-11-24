const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        full_name: {
            type: String,
            required: [true, "Please add a name"],
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
        },
        role: {
            type: String,
            enum: ["donor", "hospital", "ngo", "pharmacy", "blood_bank", "volunteer", "government"],
            default: "donor",
        },
        organization_name: {
            type: String,
        },
        phone: {
            type: String,
        },
        blood_type: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        location: {
            type: String,
        },
        age: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
