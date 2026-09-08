/**
 * Test Setup: Shared DB connection helper for all test suites.
 * Uses real MongoDB Atlas (same as production) but creates/cleans isolated test data.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

let connected = false;

const connectForTests = async () => {
    if (connected) return;
    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    connected = true;
};

const disconnectForTests = async () => {
    await mongoose.disconnect();
    connected = false;
};

module.exports = { connectForTests, disconnectForTests };
