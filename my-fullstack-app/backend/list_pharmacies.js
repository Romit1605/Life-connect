const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const listPharmacies = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const pharmacies = await User.find({ role: 'pharmacy' });

        console.log('\n--- Users with role: "pharmacy" ---');
        pharmacies.forEach(user => {
            console.log(`ID: ${user._id}`);
            console.log(`Name: ${user.full_name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Organization: ${user.organization_name}`);
            console.log('-------------------');
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listPharmacies();
