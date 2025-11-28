require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Connection String:', process.env.MONGO_URI ? 'Found ✅' : 'Missing ❌');
console.log('JWT Secret:', process.env.JWT_SECRET ? 'Found ✅' : 'Missing ❌');
console.log('\nAttempting to connect to MongoDB...\n');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medine_db', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => {
        console.log('✅ SUCCESS! MongoDB Connected Successfully!');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('\n🎉 Your backend is ready to run!');
        console.log('\nNext step: Run "npm run dev" to start the backend server\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ MongoDB Connection Failed!');
        console.error('\nError:', error.message);
        console.error('\n📝 Troubleshooting:');
        console.error('1. Check your MONGO_URI in the .env file');
        console.error('2. Make sure you replaced <password> with your actual password');
        console.error('3. Verify your IP is whitelisted in MongoDB Atlas Network Access');
        console.error('4. Check your internet connection\n');
        process.exit(1);
    });
