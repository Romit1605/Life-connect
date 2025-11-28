const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const checkHospitalUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        // Find all hospital users
        const hospitalUsers = await User.find({ role: "hospital" }).select("full_name email role organization_name");

        console.log("\n=== HOSPITAL USERS ===");
        console.log(`Found ${hospitalUsers.length} hospital user(s):\n`);

        hospitalUsers.forEach((user, index) => {
            console.log(`${index + 1}. Name: ${user.full_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: "${user.role}" (type: ${typeof user.role})`);
            console.log(`   Organization: ${user.organization_name || "N/A"}`);
            console.log(`   ID: ${user._id}`);
            console.log("");
        });

        // Also check for any users with similar role names
        const allUsers = await User.find({}).select("full_name email role");
        console.log("\n=== ALL USER ROLES ===");
        const roleCount = {};
        allUsers.forEach(user => {
            roleCount[user.role] = (roleCount[user.role] || 0) + 1;
        });
        console.log(roleCount);

        await mongoose.connection.close();
        console.log("\nDatabase connection closed");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkHospitalUsers();
