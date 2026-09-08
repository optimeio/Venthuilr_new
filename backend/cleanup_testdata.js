/**
 * VENTHULIR — DATABASE CLEANUP SCRIPT
 * Removes ALL test/dummy data while keeping:
 *   ✅ Real admin account (thesmgroups@gmail.com)
 *   ✅ Real products (non-test-named)
 * Removes:
 *   🗑  All Orders
 *   🗑  All Coupons
 *   🗑  All Messages/Grievances
 *   🗑  All Activity Logs
 *   🗑  Test users (not admin)
 *   🗑  Test products (name starts with SKU_TEST / INV_TEST / CHECKOUT_TEST / etc.)
 */
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

const ADMIN_EMAIL = 'thesmgroups@gmail.com';

// Test product name prefixes created by Jest test suites
const TEST_PREFIXES = [
    'SKU_TEST', 'INV_TEST', 'INV_TEST2', 'RESTORE_TEST', 'MIN_TEST',
    'DASH_NORMAL', 'DASH_LOW', 'DASH_OUT',
    'ORDER_TEST_PROD', 'CHECKOUT_TEST', 'PROD_STOCK_TEST',
    'PROD_NO_STOCK', 'SCHEMA_TEST', 'SCHEMA_TEST2',
    'VISIBILITY',
];

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        console.log('\n🌿 Connected to Venthulir Database\n');

        // 1. Delete ALL Orders
        const ordersResult = await db.collection('orders').deleteMany({});
        console.log(`🗑  Orders deleted: ${ordersResult.deletedCount}`);

        // 2. Delete ALL Coupons
        const couponsResult = await db.collection('coupons').deleteMany({});
        console.log(`🗑  Coupons deleted: ${couponsResult.deletedCount}`);

        // 3. Delete ALL Messages / Grievances
        const messagesResult = await db.collection('messages').deleteMany({});
        console.log(`🗑  Messages deleted: ${messagesResult.deletedCount}`);

        // 4. Delete ALL Activity Logs
        const logsResult = await db.collection('activitylogs').deleteMany({});
        console.log(`🗑  Activity Logs deleted: ${logsResult.deletedCount}`);

        // 5. Delete test users (keep admin)
        const usersResult = await db.collection('users').deleteMany({
            email: { $ne: ADMIN_EMAIL }
        });
        console.log(`🗑  Test users deleted: ${usersResult.deletedCount}`);

        // 6. Delete test products (by name prefix)
        const testNameRegex = new RegExp('^(' + TEST_PREFIXES.join('|') + ')', 'i');
        const productsResult = await db.collection('productdetails').deleteMany({
            name: { $regex: testNameRegex }
        });
        console.log(`🗑  Test products deleted: ${productsResult.deletedCount}`);

        // 7. Summary
        const remaining = {
            products: await db.collection('productdetails').countDocuments(),
            users: await db.collection('users').countDocuments(),
            orders: await db.collection('orders').countDocuments(),
            coupons: await db.collection('coupons').countDocuments(),
        };

        console.log('\n✅ CLEANUP COMPLETE');
        console.log('📊 Remaining in DB:');
        console.log(`   Products : ${remaining.products}`);
        console.log(`   Users    : ${remaining.users}  (admin only)`);
        console.log(`   Orders   : ${remaining.orders}`);
        console.log(`   Coupons  : ${remaining.coupons}`);
        console.log('\n🚀 Database is clean. Ready for fresh testing!\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Cleanup Error:', err.message);
        process.exit(1);
    }
}

cleanup();
