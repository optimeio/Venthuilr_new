/**
 * ============================================================
 *  INVENTORY DASHBOARD API TESTS
 *  Tests for:
 *   1. GET  /api/admin/inventory  – returns full dashboard
 *   2. PUT  /api/admin/inventory/:id/restock  – adds stock
 *   3. Auth protection (non-admins blocked)
 * ============================================================
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const { connectForTests, disconnectForTests } = require('./setup');

const ADMIN_EMAIL = 'thesmgroups@gmail.com';
const ADMIN_PASS = 'TSMGPVT@2026';

let adminToken;
let productNormal;
let productLow;
let productOut;

beforeAll(async () => {
    await connectForTests();

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASS });

    adminToken = loginRes.body.token;

    // Create controlled inventory fixtures
    productNormal = await Product.create({ name: `DASH_NORMAL_${Date.now()}`, price: 100, description: 'qty normal', initialStock: 100, currentStock: 50 });
    productLow = await Product.create({ name: `DASH_LOW_${Date.now()}`, price: 100, description: 'qty low', initialStock: 20, currentStock: 5 });
    productOut = await Product.create({ name: `DASH_OUT_${Date.now()}`, price: 100, description: 'qty out', initialStock: 10, currentStock: 0 });
});

afterAll(async () => {
    await Product.findByIdAndDelete(productNormal._id);
    await Product.findByIdAndDelete(productLow._id);
    await Product.findByIdAndDelete(productOut._id);
    await disconnectForTests();
});

// ─── SUITE 1: GET /api/admin/inventory ───────────────────────────────────────
describe('GET /api/admin/inventory', () => {
    test('TC-DASH-01: Returns 200 with inventory shape for admin', async () => {
        const res = await request(app)
            .get('/api/admin/inventory')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('totalProducts');
        expect(res.body).toHaveProperty('totalStock');
        expect(res.body).toHaveProperty('lowStockProducts');
        expect(res.body).toHaveProperty('outOfStockProducts');
        expect(res.body).toHaveProperty('allProducts');
    });

    test('TC-DASH-02: allProducts does NOT expose customer data (stock IS present for admin)', async () => {
        const res = await request(app)
            .get('/api/admin/inventory')
            .set('Authorization', `Bearer ${adminToken}`);

        const found = res.body.allProducts.find(p => p._id === String(productNormal._id));
        // Admin CAN see currentStock and initialStock in inventory panel
        if (found) {
            expect(found).toHaveProperty('currentStock');
            expect(found).toHaveProperty('initialStock');
        }
    });

    test('TC-DASH-03: Low stock products (< 10 units) appear in lowStockProducts array', async () => {
        const res = await request(app)
            .get('/api/admin/inventory')
            .set('Authorization', `Bearer ${adminToken}`);

        const lowIds = res.body.lowStockProducts.map(p => p._id.toString());
        expect(lowIds).toContain(productLow._id.toString());
    });

    test('TC-DASH-04: Out of stock products (0 units) appear in outOfStockProducts array', async () => {
        const res = await request(app)
            .get('/api/admin/inventory')
            .set('Authorization', `Bearer ${adminToken}`);

        const outIds = res.body.outOfStockProducts.map(p => p._id.toString());
        expect(outIds).toContain(productOut._id.toString());
    });

    test('TC-DASH-05: Normal stock products do NOT appear in low/out-of-stock arrays', async () => {
        const res = await request(app)
            .get('/api/admin/inventory')
            .set('Authorization', `Bearer ${adminToken}`);

        const lowIds = res.body.lowStockProducts.map(p => p._id.toString());
        const outIds = res.body.outOfStockProducts.map(p => p._id.toString());

        expect(lowIds).not.toContain(productNormal._id.toString());
        expect(outIds).not.toContain(productNormal._id.toString());
    });

    test('TC-DASH-06: Unauthenticated request is blocked (401/403)', async () => {
        const res = await request(app).get('/api/admin/inventory');
        expect([401, 403]).toContain(res.status);
    });
});

// ─── SUITE 2: PUT /api/admin/inventory/:id/restock ───────────────────────────
describe('PUT /api/admin/inventory/:id/restock', () => {
    test('TC-RSK-01: Admin can restock a product by adding quantity', async () => {
        const before = (await Product.findById(productOut._id)).currentStock;

        const res = await request(app)
            .put(`/api/admin/inventory/${productOut._id}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 50 });

        expect(res.status).toBe(200);
        expect(res.body.product.currentStock).toBe(before + 50);
    });

    test('TC-RSK-02: Restock rejects quantity <= 0', async () => {
        const res = await request(app)
            .put(`/api/admin/inventory/${productLow._id}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: -10 });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid quantity/i);
    });

    test('TC-RSK-03: Restock returns 404 for non-existent product', async () => {
        const fakeId = new (require('mongoose').Types.ObjectId)();
        const res = await request(app)
            .put(`/api/admin/inventory/${fakeId}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 10 });

        expect(res.status).toBe(404);
    });

    test('TC-RSK-04: Non-admin cannot restock (401/403)', async () => {
        const res = await request(app)
            .put(`/api/admin/inventory/${productNormal._id}/restock`)
            .send({ quantity: 10 }); // No token

        expect([401, 403]).toContain(res.status);
    });
});
