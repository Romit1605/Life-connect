const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Camp = require("../models/Camp");
const VolunteerApplication = require("../models/VolunteerApplication");

dotenv.config();

const seedCertificateScenario = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // 1. Create Volunteer 'Dhruv'
        const volunteerEmail = "dhruv4@gmail.com";
        let volunteer = await User.findOne({ email: volunteerEmail });

        if (!volunteer) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("password123", salt);

            volunteer = await User.create({
                full_name: "DHruv",
                email: volunteerEmail,
                password: hashedPassword,
                role: "volunteer",
                phone: "1234567890",
                location: "New York",
                blood_type: "O+"
            });
            console.log("Created Volunteer: DHruv");
        } else {
            console.log("Volunteer DHruv already exists");
        }

        // 2. Create Demo NGO
        const ngoEmail = "ngo_demo@example.com";
        let ngo = await User.findOne({ email: ngoEmail });

        if (!ngo) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("password123", salt);

            ngo = await User.create({
                full_name: "Demo NGO Organizer",
                organization_name: "Demo NGO",
                email: ngoEmail,
                password: hashedPassword,
                role: "ngo",
                phone: "0987654321",
                location: "New York"
            });
            console.log("Created Demo NGO");
        } else {
            console.log("Demo NGO already exists");
        }

        // 3. Create Past Camp (Fully Approved)
        const campName = "Health Camp for Certificate Demo";
        let camp = await Camp.findOne({ name: campName });

        if (!camp) {
            // Set date to 5 days ago
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 5);

            camp = await Camp.create({
                name: campName,
                organizer: ngo._id,
                date: pastDate,
                location: "Central Park, NY",
                description: "A camp specifically created to test certificate generation workflow.",
                contact_phone: "555-0123",
                status: "completed", // Mark as completed
                approvalStatus: "approved",
                hospitalApproval: {
                    status: "approved",
                    approvedAt: new Date()
                },
                governmentApproval: {
                    status: "approved",
                    approvedAt: new Date()
                },
                volunteersNeeded: 10,
                coordinates: {
                    lat: 40.785091,
                    lng: -73.968285
                }
            });
            console.log("Created Past Camp: " + campName);
        } else {
            console.log("Camp already exists");
        }

        // 4. Create Volunteer Application
        let application = await VolunteerApplication.findOne({
            volunteer: volunteer._id,
            camp: camp._id
        });

        if (!application) {
            application = await VolunteerApplication.create({
                volunteer: volunteer._id,
                camp: camp._id,
                status: "approved",
                applicationMessage: "I would love to help!",
                skills: "First Aid",
                availability: "All day",
                hoursWorked: 0,
                attendanceMarked: false // Important: User needs to mark this
            });
            console.log("Created Application for Dhruv");
        } else {
            console.log("Application already exists");
        }

        console.log("\n=== SETUP COMPLETE ===");
        console.log("1. Login as NGO: " + ngoEmail + " / password123");
        console.log("2. Go to 'Manage Volunteers'");
        console.log("3. Find 'DHruv' in the 'Approved' tab");
        console.log("4. You should see the 'Update Hours' button enabled");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedCertificateScenario();
