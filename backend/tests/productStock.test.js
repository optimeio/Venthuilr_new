/**
 * ============================================================
 *  PRODUCT CREATION WITH STOCK TESTS
 *  Tests for:
 *   1. POST /api/admin/products  – stores initialStock & currentStock
 *   2. GET  /api/products        – does NOT expose stock to customers
 *   3. GET  /api/admin/products  – DOES expose stock to admin
 *   4. PUT  /api/admin/products/:id – stock reset on initialStock edit
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
let createdProductId;

beforeAll(async () => {
    await connectForTests();
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASS });
    adminToken = loginRes.body.token;
});

afterAll(async () => {
    if (createdProductId) await Product.findByIdAndDelete(createdProductId);
    await disconnectForTests();
});

// ─── SUITE 1: Product Creation ────────────────────────────────────────────────
describe('POST /api/admin/products (with stock)', () => {
    test('TC-PROD-01: Creating a product stores initialStock and currentStock correctly', async () => {
        const res = await request(app)
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: `PROD_STOCK_TEST_${Date.now()}`,
                price: 299,
                description: 'Stock test product',
                category: 'Spices',
                initialStock: 75,
                variants: []
            });

        expect(res.status).toBe(201);
        expect(res.body.initialStock).toBe(75);
        expect(res.body.currentStock).toBe(75); // currentStock = initialStock at creation
        createdProductId = res.body._id;
    });

    test('TC-PROD-02: Creating a product without initialStock defaults to 0', async () => {
        const res = await request(app)
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: `PROD_NO_STOCK_${Date.now()}`,
                price: 199,
                description: 'No stock test',
                variants: []
            });

        expect(res.status).toBe(201);
        expect(res.body.initialStock).toBe(0);
        expect(res.body.currentStock).toBe(0);

        await Product.findByIdAndDelete(res.body._id);
    });
});

// ─── SUITE 2: Customer API (stock must be hidden) ─────────────────────────────
describe('GET /api/products – customer API hides stock', () => {
    test('TC-PROD-03: Customer product listing does NOT include currentStock field', async () => {
        const res = await request(app).get('/api/products');

        expect(res.status).toBe(200);
        expect(res.body.products).toBeDefined();
        if (res.body.products.length > 0) {
            const product = res.body.products[0];
            expect(product).not.toHaveProperty('currentStock');
            expect(product).not.toHaveProperty('initialStock');
        }
    });

    test('TC-PROD-04: Customer product by ID does NOT include currentStock', async () => {
        if (!createdProductId) return;
        const res = await request(app).get(`/api/products/${createdProductId}`);

        expect(res.status).toBe(200);
        expect(res.body).not.toHaveProperty('currentStock');
        expect(res.body).not.toHaveProperty('initialStock');
    });
});

// ─── SUITE 3: Admin API (stock IS visible) ───────────────────────────────────
describe('GET /api/admin/products – admin API exposes stock', () => {
    test('TC-PROD-05: Admin product listing INCLUDES currentStock and initialStock', async () => {
        const res = await request(app)
            .get('/api/admin/products')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        if (res.body.length > 0) {
            const product = res.body[0];
            expect(product).toHaveProperty('currentStock');
            expect(product).toHaveProperty('initialStock');
        }
    });
});

// ─── SUITE 4: Product Update resets stock ─────────────────────────────────────
describe('PUT /api/admin/products/:id (stock reset on initialStock change)', () => {
    test('TC-PROD-06: Editing initialStock resets currentStock to new value', async () => {
        if (!createdProductId) return;

        // First simulate selling 20 units
        await Product.findByIdAndUpdate(createdProductId, { currentStock: 55 });

        // Admin sets a new initialStock
        const res = await request(app)
            .put(`/api/admin/products/${createdProductId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ initialStock: 200 });

        expect(res.status).toBe(200);
        expect(res.body.initialStock).toBe(200);
        expect(res.body.currentStock).toBe(200); // Reset to new initialStock
    });
});
