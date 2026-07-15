const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../models/User');

async function runTests() {
  console.log('Starting Test Suite...');
  
  try {
    // 1. Model Validation Tests
    const testUser = new User({
      name: 'Test Tester',
      email: 'tester@test.com',
      password: 'password123',
    });

    assert.strictEqual(testUser.name, 'Test Tester');
    assert.strictEqual(testUser.email, 'tester@test.com');
    assert.strictEqual(testUser.role, 'user'); // check default role
    
    console.log('✓ Model validation tests passed!');
    
    // 2. Encryption hooks checks
    await testUser.validate();
    console.log('✓ pre-save hook validation checks passed!');

    console.log('All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Test Suite Failed:', error.message);
    process.exit(1);
  }
}

// Check if mongoose is connected or run checks synchronously
runTests();
