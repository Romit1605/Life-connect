#!/usr/bin/env node

/**
 * Comprehensive Test Script for Medine App
 * Tests all backend endpoints and verifies functionality
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

let testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

let authToken = '';
let testUserId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        data: body ? JSON.parse(body) : null
                    };
                    resolve(response);
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Test function wrapper
async function test(name, fn) {
    try {
        console.log(`\n🧪 Testing: ${name}`);
        await fn();
        console.log(`✅ PASSED: ${name}`);
        testResults.passed++;
        testResults.tests.push({ name, status: 'PASSED' });
    } catch (error) {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${error.message}`);
        testResults.failed++;
        testResults.tests.push({ name, status: 'FAILED', error: error.message });
    }
}

// Assertion helpers
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function assertTrue(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// Tests
async function runTests() {
    console.log('='.repeat(60));
    console.log('🚀 Starting Comprehensive Backend Tests');
    console.log('='.repeat(60));

    // Test 1: Server Health Check
    await test('Server Health Check', async () => {
        const res = await makeRequest('GET', '/');
        assertEqual(res.statusCode, 200, 'Status code should be 200');
        assertTrue(res.data.message, 'Should return a message');
    });

    // Test 2: User Registration
    await test('User Registration', async () => {
        const userData = {
            full_name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'donor',
            blood_type: 'A+'
        };

        const res = await makeRequest('POST', '/api/auth/register', userData);
        assertEqual(res.statusCode, 201, 'Status code should be 201');
        assertTrue(res.data.token, 'Should return a token');
        assertTrue(res.data._id, 'Should return user ID');
        assertTrue(res.data.blood_type === 'A+', 'Should return blood type');

        authToken = res.data.token;
        testUserId = res.data._id;
    });

    // Test 3: User Login
    await test('User Login', async () => {
        // First register a user
        const email = `login${Date.now()}@example.com`;
        await makeRequest('POST', '/api/auth/register', {
            full_name: 'Login Test',
            email: email,
            password: 'password123',
            role: 'donor'
        });

        // Then login
        const res = await makeRequest('POST', '/api/auth/login', {
            email: email,
            password: 'password123'
        });

        assertEqual(res.statusCode, 200, 'Status code should be 200');
        assertTrue(res.data.token, 'Should return a token');
        assertTrue(res.data.role === 'donor', 'Should return correct role');
    });

    // Test 4: Invalid Login
    await test('Invalid Login Credentials', async () => {
        const res = await makeRequest('POST', '/api/auth/login', {
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
        });

        assertEqual(res.statusCode, 400, 'Status code should be 400');
    });

    // Test 5: Get User Profile (Protected Route)
    await test('Get User Profile', async () => {
        const res = await makeRequest('GET', '/api/auth/me', null, {
            'Authorization': `Bearer ${authToken}`
        });

        assertEqual(res.statusCode, 200, 'Status code should be 200');
        assertTrue(res.data._id, 'Should return user data');
    });

    // Test 6: Get User Profile Without Token
    await test('Get User Profile Without Token', async () => {
        const res = await makeRequest('GET', '/api/auth/me');
        assertEqual(res.statusCode, 401, 'Status code should be 401');
    });

    // Test 7: Create Donation
    await test('Create Donation', async () => {
        const res = await makeRequest('POST', '/api/donations', {
            blood_type: 'A+',
            units: 1,
            location: 'City Hospital',
            donation_date: new Date().toISOString()
        }, {
            'Authorization': `Bearer ${authToken}`
        });

        assertEqual(res.statusCode, 201, 'Status code should be 201');
        assertTrue(res.data.blood_type === 'A+', 'Should return correct blood type');
    });

    // Test 8: Get Donations
    await test('Get User Donations', async () => {
        const res = await makeRequest('GET', '/api/donations', null, {
            'Authorization': `Bearer ${authToken}`
        });

        assertEqual(res.statusCode, 200, 'Status code should be 200');
        assertTrue(Array.isArray(res.data), 'Should return an array');
    });

    // Test 9: Get Camps
    await test('Get All Camps', async () => {
        const res = await makeRequest('GET', '/api/camps');
        assertEqual(res.statusCode, 200, 'Status code should be 200');
        assertTrue(Array.isArray(res.data), 'Should return an array');
    });

    // Test 10: Create Camp (Protected)
    await test('Create Camp', async () => {
        const res = await makeRequest('POST', '/api/camps', {
            name: 'Test Blood Camp',
            date: new Date(Date.now() + 86400000).toISOString(),
            location: 'Downtown Center',
            description: 'Test camp for blood donation'
        }, {
            'Authorization': `Bearer ${authToken}`
        });

        assertEqual(res.statusCode, 201, 'Status code should be 201');
        assertTrue(res.data.name === 'Test Blood Camp', 'Should return correct camp name');
    });

    // Test 11: Get Requests
    await test('Get All Requests', async () => {
        const res = await makeRequest('GET', '/api/requests');
        assertEqual(res.statusCode, 200, 'Status code should be 200');
        assertTrue(Array.isArray(res.data), 'Should return an array');
    });

    // Test 12: Create Request
    await test('Create Request', async () => {
        const res = await makeRequest('POST', '/api/requests', {
            type: 'blood',
            item_name: 'A+',
            quantity: 2,
            urgency: 'high',
            location: 'Emergency Hospital'
        }, {
            'Authorization': `Bearer ${authToken}`
        });

        assertEqual(res.statusCode, 201, 'Status code should be 201');
        assertTrue(res.data.urgency === 'high', 'Should return correct urgency');
    });

    // Print Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📝 Total:  ${testResults.passed + testResults.failed}`);
    console.log('='.repeat(60));

    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed! Backend is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
}

// Run tests
console.log('⏳ Waiting for server to be ready...\n');
setTimeout(runTests, 1000);
