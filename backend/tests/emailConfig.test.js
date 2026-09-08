/**
 * ============================================================
 *  EMAIL CONFIGURATION TESTS
 *  TC-EMAIL-01 to TC-EMAIL-08
 *  Tests for:
 *   1. EMAIL_USER env var set to theventhulir@gmail.com
 *   2. OWNER_EMAIL env var is set
 *   3. DELIVERY_PHONE env var is set to 8778476414
 *   4. Nodemailer transporter is configured with correct credentials
 *   5. Order controller uses correct LOGO_URL
 *   6. Admin controller uses correct LOGO_URL
 *   7. DELIVERY_PHONE appears in coupon controller constants
 *   8. OWNER_EMAIL is used when sending owner notifications
 * ============================================================
 * NOTE: These are unit/config tests — they do NOT actually send emails.
 *       They verify the configuration, constants, and logic wiring.
 * ============================================================
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const path = require('path');
const fs = require('fs');

const EXPECTED_EMAIL = 'theventhulir@gmail.com';
const EXPECTED_PHONE = '8778476414';
const EXPECTED_LOGO = 'https://i.ibb.co/rGZwVGYP/organic.png';

// ─── SUITE 1: Environment Variables ──────────────────────────────────────────
describe('Environment Variables – Email & Contact Config', () => {
    test('TC-EMAIL-01: EMAIL_USER is set to theventhulir@gmail.com', () => {
        expect(process.env.EMAIL_USER).toBe(EXPECTED_EMAIL);
    });

    test('TC-EMAIL-02: EMAIL_PASS is set (app password present)', () => {
        expect(process.env.EMAIL_PASS).toBeDefined();
        expect(process.env.EMAIL_PASS.trim().length).toBeGreaterThan(0);
    });

    test('TC-EMAIL-03: OWNER_EMAIL env var is configured', () => {
        expect(process.env.OWNER_EMAIL).toBeDefined();
        expect(process.env.OWNER_EMAIL).toBe(EXPECTED_EMAIL);
    });

    test('TC-EMAIL-04: DELIVERY_PHONE env var is set to 8778476414', () => {
        expect(process.env.DELIVERY_PHONE).toBe(EXPECTED_PHONE);
    });
});

// ─── SUITE 2: Source Code Constants Validation ────────────────────────────────
describe('Source Code – Logo URL & Contact Constants', () => {
    const couponControllerPath = path.join(__dirname, '../controllers/couponController.js');
    const adminControllerPath = path.join(__dirname, '../controllers/adminController.js');
    let couponSrc, adminSrc;

    beforeAll(() => {
        couponSrc = fs.readFileSync(couponControllerPath, 'utf8');
        adminSrc = fs.readFileSync(adminControllerPath, 'utf8');
    });

    test('TC-EMAIL-05: couponController uses the correct imgbb logo URL', () => {
        expect(couponSrc).toContain(EXPECTED_LOGO);
    });

    test('TC-EMAIL-06: adminController uses the correct imgbb logo URL', () => {
        expect(adminSrc).toContain(EXPECTED_LOGO);
    });

    test('TC-EMAIL-07: couponController defines DELIVERY_PHONE constant', () => {
        expect(couponSrc).toContain('DELIVERY_PHONE');
        expect(couponSrc).toContain(EXPECTED_PHONE);
    });

    test('TC-EMAIL-08: adminController defines DELIVERY_PHONE constant', () => {
        expect(adminSrc).toContain('DELIVERY_PHONE');
        expect(adminSrc).toContain(EXPECTED_PHONE);
    });

    test('TC-EMAIL-09: couponController uses OWNER_EMAIL for owner notification', () => {
        expect(couponSrc).toContain('OWNER_EMAIL');
        expect(couponSrc).toContain('to: OWNER_EMAIL');
    });

    test('TC-EMAIL-10: Order confirmation email includes Order ID in the HTML body', () => {
        // The email template should reference newOrder._id
        expect(couponSrc).toContain('newOrder._id');
    });

    test('TC-EMAIL-11: Order confirmation email includes delivery phone number', () => {
        expect(couponSrc).toContain('${DELIVERY_PHONE}');
    });

    test('TC-EMAIL-12: Support reply email uses "Venthulir Team" (not old "Optime Team")', () => {
        expect(adminSrc).toContain('Venthulir Team');
        expect(adminSrc).not.toContain('Optime Team');
    });

    test('TC-EMAIL-13: Support reply email logo uses correct imgbb URL', () => {
        // Check that the correct logo URL appears in reply email template
        expect(adminSrc).toContain(EXPECTED_LOGO);
    });
});

// ─── SUITE 3: Owner Notification Logic ───────────────────────────────────────
describe('Owner Notification Email Logic', () => {
    test('TC-EMAIL-14: couponController sends TWO emails (customer + owner)', () => {
        const couponSrc = fs.readFileSync(
            path.join(__dirname, '../controllers/couponController.js'), 'utf8'
        );
        // Count sendMail calls — should be at least 2 (customer + owner)
        const sendMailCount = (couponSrc.match(/sendMail\(/g) || []).length;
        expect(sendMailCount).toBeGreaterThanOrEqual(2);
    });

    test('TC-EMAIL-15: Owner email subject contains order amount and customer name', () => {
        const couponSrc = fs.readFileSync(
            path.join(__dirname, '../controllers/couponController.js'), 'utf8'
        );
        expect(couponSrc).toContain('finalAmount');
        expect(couponSrc).toContain('customerName');
        // Owner subject template references both
        expect(couponSrc).toContain('NEW ORDER');
    });
});
