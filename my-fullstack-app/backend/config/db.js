const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Debugging elements: Connection events
        mongoose.connection.on('connected', () => {
            console.log('🔌 Mongoose connected to db');
        });

        mongoose.connection.on('error', (err) => {
            console.log('❌ Mongoose connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ Mongoose connection is disconnected');
        });

        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/medine_db", {
            // These options are good for MongoDB Atlas
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log("mongdb get connect"); // Requested specific message

        // Additional debugging info
        console.log(`🔍 Connection State: ${mongoose.connection.readyState} (1=Connected)`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error("Full error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
