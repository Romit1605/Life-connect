// Test script for backend API endpoints
const BASE_URL = "http://localhost:5000";

let authToken = "";
let userId = "";

// Test 1: Register a new user
async function testRegister() {
    console.log("\n=== Testing User Registration ===");
    try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                full_name: "Test User",
                email: `test${Date.now()}@example.com`,
                password: "password123",
                role: "donor",
                blood_type: "A+",
            }),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);

        if (response.ok) {
            authToken = data.token;
            userId = data._id;
            console.log("✓ Registration successful");
            return true;
        } else {
            console.log("✗ Registration failed:", data.message);
            return false;
        }
    } catch (error) {
        console.error("✗ Error:", error.message);
        return false;
    }
}

// Test 2: Login
async function testLogin() {
    console.log("\n=== Testing User Login ===");
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "test@example.com",
                password: "password123",
            }),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);

        if (response.ok) {
            authToken = data.token;
            console.log("✓ Login successful");
            return true;
        } else {
            console.log("✗ Login failed:", data.message);
            return false;
        }
    } catch (error) {
        console.error("✗ Error:", error.message);
        return false;
    }
}

// Test 3: Get user profile
async function testGetMe() {
    console.log("\n=== Testing Get User Profile ===");
    try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);

        if (response.ok) {
            console.log("✓ Get profile successful");
            return true;
        } else {
            console.log("✗ Get profile failed:", data.message);
            return false;
        }
    } catch (error) {
        console.error("✗ Error:", error.message);
        return false;
    }
}

// Test 4: Create donation
async function testCreateDonation() {
    console.log("\n=== Testing Create Donation ===");
    try {
        const response = await fetch(`${BASE_URL}/api/donations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                blood_type: "A+",
                units: 1,
                location: "City Hospital",
                donation_date: new Date(),
            }),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);

        if (response.ok) {
            console.log("✓ Create donation successful");
            return true;
        } else {
            console.log("✗ Create donation failed:", data.message);
            return false;
        }
    } catch (error) {
        console.error("✗ Error:", error.message);
        return false;
    }
}

// Test 5: Get donations
async function testGetDonations() {
    console.log("\n=== Testing Get Donations ===");
    try {
        const response = await fetch(`${BASE_URL}/api/donations`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);

        if (response.ok) {
            console.log("✓ Get donations successful");
            return true;
        } else {
            console.log("✗ Get donations failed:", data.message);
            return false;
        }
    } catch (error) {
        console.error("✗ Error:", error.message);
        return false;
    }
}

// Test 6: Get camps
async function testGetCamps() {
    console.log("\n=== Testing Get Camps ===");
    try {
        const response = await fetch(`${BASE_URL}/api/camps`);

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);

        if (response.ok) {
            console.log("✓ Get camps successful");
            return true;
        } else {
            console.log("✗ Get camps failed:", data.message);
            return false;
        }
    } catch (error) {
        console.error("✗ Error:", error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log("Starting API Tests...");
    console.log("Make sure the backend server is running on http://localhost:5000");

    const registerSuccess = await testRegister();

    if (registerSuccess) {
        await testGetMe();
        await testCreateDonation();
        await testGetDonations();
    }

    await testGetCamps();

    console.log("\n=== Test Summary ===");
    console.log("All tests completed. Check results above.");
}

runTests();
