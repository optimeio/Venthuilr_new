/**
 * ============================================================
 *  ORDER STATUS + INVENTORY INTEGRATION TESTS
 *  Tests for:
 *   1. Order status update via API  (PUT /api/admin/orders/:id/status)
 *   2. Cancelled → Stock is restored
 *   3. Returned  → Stock is restored
 *   4. Delivered → Stock stays reduced
 *   5. Invalid status → blocked
 * ============================================================
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { connectForTests, disconnectForTests } = require('./setup');

// Admin credentials (seeded in server.js)
const ADMIN_EMAIL = 'thesmgroups@gmail.com';
const ADMIN_PASS = 'TSMGPVT@2026';

let adminToken;
let testProduct;
let testOrder;

beforeAll(async () => {
    await connectForTests();

    // Login as admin to get token
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASS });

    adminToken = loginRes.body.token;
    expect(adminToken).toBeDefined();

    // Create a test product with stock
    testProduct = await Product.create({
        name: `ORDER_TEST_PROD_${Date.now()}`,
        price: 200,
        description: 'Order test product',
        initialStock: 100,
        currentStock: 100,
    });
});

afterAll(async () => {
    // Cleanup test data
    if (testProduct) await Product.findByIdAndDelete(testProduct._id);
    if (testOrder) await Order.findByIdAndDelete(testOrder._id);
    await disconnectForTests();
});

// ─── SUITE 1: Order Status Update API ────────────────────────────────────────
describe('PUT /api/admin/orders/:id/status', () => {
    beforeEach(async () => {
        // Place a test order (reduce stock from 100 → 90)
        await Product.findByIdAndUpdate(testProduct._id, { currentStock: 100 });
        testOrder = await Order.create({
            customerName: 'Test User',
            customerEmail: 'testuser@venthulir.com',
            phone: '9999999999',
            deliveryAddress: { address: '123 Street', city: 'Chennai', state: 'TN', zipCode: '600001' },
            items: [{ product: testProduct._id, name: testProduct.name, quantity: 10, price: 200 }],
            originalAmount: 2000,
            totalAmount: 2000,
            status: 'Processing',
        });
        // Manually reduce stock (what checkout normally does)
        await Product.findByIdAndUpdate(testProduct._id, { $inc: { currentStock: -10 } });
    });

    afterEach(async () => {
        if (testOrder) await Order.findByIdAndDelete(testOrder._id);
        testOrder = null;
    });

    test('TC-ORD-01: Admin can update order status to Shipped', async () => {
        const res = await request(app)
            .put(`/api/admin/orders/${testOrder._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Shipped' });

        expect(res.status).toBe(200);
        expect(res.body.order.status).toBe('Shipped');

        // Stock should remain unchanged (90)
        const p = await Product.findById(testProduct._id);
        expect(p.currentStock).toBe(90);
    });

    test('TC-ORD-02: Cancelling an order restores stock', async () => {
        const stockBefore = (await Product.findById(testProduct._id)).currentStock;
        expect(stockBefore).toBe(90);

        const res = await request(app)
            .put(`/api/admin/orders/${testOrder._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Cancelled' });

        expect(res.status).toBe(200);
        expect(res.body.order.status).toBe('Cancelled');

        const stockAfter = (await Product.findById(testProduct._id)).currentStock;
        expect(stockAfter).toBe(100); // Restored: 90 + 10
    });

    test('TC-ORD-03: Returning an order restores stock', async () => {
        const res = await request(app)
            .put(`/api/admin/orders/${testOrder._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Returned' });

        expect(res.status).toBe(200);
        expect(res.body.order.status).toBe('Returned');

        const stockAfter = (await Product.findById(testProduct._id)).currentStock;
        expect(stockAfter).toBe(100); // Stock restored
    });

    test('TC-ORD-04: Delivering an order does NOT restore stock', async () => {
        const stockBefore = (await Product.findById(testProduct._id)).currentStock;

        const res = await request(app)
            .put(`/api/admin/orders/${testOrder._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Delivered' });

        expect(res.status).toBe(200);
        expect(res.body.order.status).toBe('Delivered');

        const stockAfter = (await Product.findById(testProduct._id)).currentStock;
        expect(stockAfter).toBe(stockBefore); // Stock stays reduced
    });

    test('TC-ORD-05: Cannot cancel an already-cancelled order twice (stock not double-restored)', async () => {
        // First cancellation
        await request(app)
            .put(`/api/admin/orders/${testOrder._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Cancelled' });

        const stockAfterFirstCancel = (await Product.findById(testProduct._id)).currentStock;
        expect(stockAfterFirstCancel).toBe(100);

        // Second cancellation attempt on same order (already Cancelled)
        await request(app)
            .put(`/api/admin/orders/${testOrder._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Cancelled' });

        const stockAfterSecondCancel = (await Product.findById(testProduct._id)).currentStock;
        expect(stockAfterSecondCancel).toBe(100); // Must NOT add 10 again → no double restore
    });

    test('TC-ORD-06: Invalid status is rejected with 400', async () => {
        const res = await request(app)
            .put(`/api/admin/orders/${testOrder._id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'RandomStatus' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid status/i);
    });

    test('TC-ORD-07: Non-admin cannot update order status (401/403)', async () => {
        const res = await request(app)
            .put(`/api/admin/orders/${testOrder._id}/status`)
            .send({ status: 'Delivered' }); // No token

        expect([401, 403]).toContain(res.status);
    });
});
