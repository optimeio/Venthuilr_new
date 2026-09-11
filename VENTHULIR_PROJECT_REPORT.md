# 🌿 ROYAL VENTHULIR — MASTER TECHNICAL ARCHITECTURE & END-TO-END DATAFLOW SPECIFICATION

**System Classification:** Fullstack Organic E-Commerce & Executive Operations Enterprise System  
**Framework Version:** Next.js 15 (App Router) | React 19 | Node.js  
**Database Architecture:** MongoDB Atlas Multi-Cluster via Mongoose 8.x  
**Security & Identity:** HMAC-SHA256 JWT Stateless Tokens + Bcrypt Salted Hash  
**Document Classification:** Master Comprehensive Technical Reference  
**Last Updated:** September 2026  

---

## TABLE OF CONTENTS
1. [High-Level Architecture & Technical Stack](#1-high-level-architecture--technical-stack)
2. [End-to-End System Dataflows & Sequence Diagrams](#2-end-to-end-system-dataflows--sequence-diagrams)
   - 2.1 [User Registration & Email Verification Dataflow](#21-user-registration--email-verification-dataflow)
   - 2.2 [Authentication, Admin Guard & JWT Session Dataflow](#22-authentication-admin-guard--jwt-session-dataflow)
   - 2.3 [Product Discovery, Variant Selection & Cart Management Dataflow](#23-product-discovery-variant-selection--cart-management-dataflow)
   - 2.4 [Checkout, Order Creation & Inventory Depletion Dataflow](#24-checkout-order-creation--inventory-depletion-dataflow)
   - 2.5 [Admin Product Creation & Local Image Upload Dataflow](#25-admin-product-creation--local-image-upload-dataflow)
   - 2.6 [Warehouse Stock Tracking & Instant Restock Dataflow](#26-warehouse-stock-tracking--instant-restock-dataflow)
   - 2.7 [Dual-Pane Independent Scrolling & UI Layering Dataflow](#27-dual-pane-independent-scrolling--ui-layering-dataflow)
3. [Complete Database Models & Schema Specifications](#3-complete-database-models--schema-specifications)
4. [Comprehensive REST API Route Registry (44+ Endpoints)](#4-comprehensive-rest-api-route-registry)
5. [Frontend Component Hierarchy & State Architecture](#5-frontend-component-hierarchy--state-architecture)
6. [Email Deliverability & Anti-Spam Pipeline](#6-email-deliverability--anti-spam-pipeline)
7. [System Credentials & Operational Runbook](#7-system-credentials--operational-runbook)

---

# 1. High-Level Architecture & Technical Stack

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT / USER BROWSER                                        |
|                                                                                                   |
|   +---------------------------------------+       +-------------------------------------------+   |
|   |         PUBLIC STOREFRONT             |       |         EXECUTIVE ADMIN CONSOLE           |   |
|   |   - Hero & Categories Showcase        |       |   - Dashboard (Revenue, Orders, Alerts)   |   |
|   |   - Product Detail (Variant Matrix)   |       |   - Catalog & Local Image Upload          |   |
|   |   - Cart & Checkout Subsystem         |       |   - Warehouse Inventory Control           |   |
|   |   - Member Suite (/profile - 5 Tabs)  |       |   - Order Lifecycle & Receipts            |   |
|   +---------------------------------------+       +-------------------------------------------+   |
|                        ▲                                                ▲                         |
|                        │ HTTP/HTTPS                                     │ HTTP/HTTPS              |
|                        ▼                                                ▼                         |
+---------------------------------------------------------------------------------------------------+
|                                 NEXT.JS 15 FULLSTACK SERVER LAYER                                 |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |                                     APP ROUTER RUNTIME                                    |   |
|   |   - Server Components (SSR / Static Cache)                                                |   |
|   |   - API Route Handlers (/api/auth, /api/products, /api/orders, /api/inventory, etc.)      |   |
|   |   - Route-Aware Smooth Scroll Controller (Lenis bypass on /admin & /profile)              |   |
|   +-------------------------------------------------------------------------------------------+   |
|                        │                                                │                         |
|           Mongoose ODM │                                   SMTP SSL 465 │ Nodemailer Engine       |
|                        ▼                                                ▼                         |
+-----------------------------------+               +-----------------------------------------------+
|         MONGODB ATLAS CLUSTER     |               |             GMAIL / RESEND SMTP               |
|                                   |               |                                               |
|   - Users & Admin Auth Records    |               |   - Verification Code Delivery (Inbox-First)  |
|   - Products, Variants & Inventory|               |   - Order Confirmation Receipts               |
|   - Orders & Timeline History     |               |   - Anti-Spam Transactional Envelope          |
|   - Coupons, Offers & Inquiries   |               |                                               |
+-----------------------------------+               +-----------------------------------------------+
```

---

# 2. End-to-End System Dataflows & Sequence Diagrams

---

## 2.1 User Registration & Email Verification Dataflow

This workflow handles new customer onboarding, OTP generation, authenticated Gmail SMTP dispatch, and primary inbox verification.

```
[Customer Browser]               [Next.js API Handler]             [Gmail SMTP Server]            [MongoDB Atlas]
        │                                  │                                │                            │
        │── 1. POST /api/auth/register ────>│                                │                            │
        │      { name, email, password }   │                                │                            │
        │                                  │── 2. Check existing email ─────────────────────────────────>│
        │                                  │<── 3. null (Not registered) ────────────────────────────────│
        │                                  │                                │                            │
        │                                  │── 4. Generate 6-digit OTP      │                            │
        │                                  │      Hash password (Bcrypt)    │                            │
        │                                  │                                │                            │
        │                                  │── 5. Send verification email ─>│                            │
        │                                  │      (Port 465 SSL, headers:   │                            │
        │                                  │       Auto-Submitted: auto)    │                            │
        │                                  │<── 6. 250 OK (Queued for Inbox)│                            │
        │                                  │                                │                            │
        │                                  │── 7. Store user in DB ─────────────────────────────────────>│
        │                                  │      { email, otp, isVerified: false }                      │
        │                                  │                                │                            │
        │<── 8. 201 Created { msg } ───────│                                │                            │
        │                                  │                                │                            │
        │── 9. POST /api/auth/verify-otp ─>│                                │                            │
        │      { email, otp: "123456" }    │                                │                            │
        │                                  │── 10. Query user by email & OTP ───────────────────────────>│
        │                                  │<── 11. User record matched ─────────────────────────────────│
        │                                  │                                │                            │
        │                                  │── 12. Update isVerified: true ─────────────────────────────>│
        │                                  │── 13. Sign JWT Token           │                            │
        │<── 14. 200 OK { token, user } ───│                                │                            │
```

### Detailed Execution Steps:
1. **Payload Submission:** User enters Full Name, Email Address, Phone Number, and Password.
2. **Duplication Guard:** Server queries `User.findOne({ email: cleanEmail })`. If exists, returns HTTP 400.
3. **Cryptographic Security:** Password is encrypted with `bcrypt.hash(password, 10)`. A secure 6-digit cryptographic verification code (`Math.floor(100000 + Math.random() * 900000)`) is generated with a 15-minute expiration timestamp.
4. **Primary Inbox SMTP Transmission:** In `src/lib/email.js`, Nodemailer connects to `theventhulir@gmail.com` via Port 465 SSL.
   - Headers injected: `Auto-Submitted: auto-generated`, `X-Priority: 1`, `X-Auto-Response-Suppress: All`.
   - Clean subject: `Your Venthulir verification code is 123456`.
5. **Token Issuance:** Upon OTP verification, the backend issues an HS256 signed JWT containing `{ id, email, isAdmin, name }` with a 7-day or 30-day lifetime.

---

## 2.2 Authentication, Admin Guard & JWT Session Dataflow

Handles both public customer logins and Executive Administrator elevation with auto-provisioning recovery.

```
[Admin / User Browser]           [Next.js API: /api/auth/login]            [Database Layer: MongoDB]
         │                                      │                                      │
         │── 1. POST /api/auth/login ──────────>│                                      │
         │      { email: "admin",               │                                      │
         │        password: "admin123" }        │                                      │
         │                                      │── 2. Sanitize & map "admin"          │
         │                                      │      to "admin@venthulir.com"        │
         │                                      │                                      │
         │                                      │── 3. Query User record ─────────────>│
         │                                      │<── 4. Return user / null ────────────│
         │                                      │                                      │
         │                                      │── 5. Auto-Bootstrap Check:           │
         │                                      │      If user is null & creds match   │
         │                                      │      seed master admin account ─────>│
         │                                      │                                      │
         │                                      │── 6. Compare Bcrypt password hash    │
         │                                      │      Verify user.isAdmin === true    │
         │                                      │                                      │
         │                                      │── 7. Generate HS256 JWT Token        │
         │                                      │      { id, isAdmin: true, name }     │
         │                                      │                                      │
         │<── 8. Return 200 OK ─────────────────│                                      │
         │      { token, user: { isAdmin: true } }                                     │
         │                                                                             │
         │── 9. Save in localStorage:                                                  │
         │      venthulir_token & venthulir_user                                       │
         │── 10. AdminGuard renders Executive Console                                  │
```

---

## 2.3 Product Discovery, Variant Selection & Cart Management Dataflow

Manages the reactive shopping flow where cold-pressed oils and spices have multiple bottle sizes and dynamic price scaling.

```
[Storefront UI]                    [React Cart Context]                 [Local Storage / Memory]
      │                                     │                                      │
      │── 1. User selects 1L variant ──────>│                                      │
      │      (Price: ₹420, SKU: OIL-1L)     │                                      │
      │                                     │                                      │
      │── 2. Click "Add to Cart" ──────────>│── 3. Check existing item in cart ───>│
      │                                     │      (match productId + size)        │
      │                                     │<── 4. Item exists? Increment count ──│
      │                                     │                                      │
      │                                     │── 5. Recalculate Subtotal,           │
      │                                     │      Taxes & Free Delivery           │
      │                                     │                                      │
      │                                     │── 6. Persist cart state ────────────>│
      │                                     │      key: "venthulir_cart"           │
      │                                     │                                      │
      │<── 7. Trigger Cart Drawer Flyout ───│                                      │
      │       Show live total & item pill   │                                      │
```

---

## 2.4 Checkout, Order Creation & Inventory Depletion Dataflow

This mission-critical workflow handles order placement, payment reconciliation, database writes, and automated inventory depletion.

```
[Checkout Page]                [API: /api/orders]              [MongoDB: Order]              [MongoDB: Product]
       │                                │                              │                             │
       │── 1. POST /api/orders ────────>│                              │                             │
       │      { items, shippingAddress, │                              │                             │
       │        paymentMethod, coupon } │                              │                             │
       │                                │── 2. Validate Cart & Prices ─┼────────────────────────────>│
       │                                │<── 3. Stock verified ────────┼─────────────────────────────│
       │                                │                              │                             │
       │                                │── 4. Generate Order ID:      │                             │
       │                                │      "VNT-ORD-98421"         │                             │
       │                                │                              │                             │
       │                                │── 5. Insert Order record ───>│                             │
       │                                │      status: "Pending"       │                             │
       │                                │                              │                             │
       │                                │── 6. Decrement Stock Units ──┼────────────────────────────>│
       │                                │      $inc: { currentStock:   │                             │
       │                                │              -item.quantity }│                             │
       │                                │                              │                             │
       │<── 7. 201 Created { order } ───│                              │                             │
       │                                │                              │                             │
       │── 8. Clear Cart Context ───────│                              │                             │
       │── 9. Redirect to Confirmation  │                              │                             │
```

---

## 2.5 Admin Product Creation & Local Image Upload Dataflow

Enables administrators to create products with high-resolution imagery uploaded directly from their computer or via CDN URL, along with a multi-tiered variant pricing matrix.

```
[Admin Modal UI]                 [FileReader Encoder]               [Next.js API: /api/products]     [MongoDB Atlas]
       │                                  │                                      │                          │
       │── 1. Admin selects image file ──>│                                      │                          │
       │      (e.g., coconut_oil.jpg)     │                                      │                          │
       │                                  │── 2. Convert to Base64 Data URI ────>│                          │
       │<── 3. Render instant preview ────│      data:image/jpeg;base64,...      │                          │
       │                                                                         │                          │
       │── 4. Admin configures variants:                                         │                          │
       │      • 500ml: ₹240 (SKU: VNT-COC-500)                                   │                          │
       │      • 1000ml: ₹450 (SKU: VNT-COC-1L)                                   │                          │
       │                                                                         │                          │
       │── 5. Submit "Save Heritage Product" ───────────────────────────────────>│                          │
       │                                                                         │── 6. Validate & Sanitize │
       │                                                                         │      Create Slug         │
       │                                                                         │                          │
       │                                                                         │── 7. Product.create() ──>│
       │                                                                         │<── 8. Saved Document ────│
       │                                                                         │                          │
       │<── 9. HTTP 201 Created { product } ─────────────────────────────────────│                          │
       │── 10. Trigger Catalog Refetch & Toast Notification                      │                          │
```

---

## 2.6 Warehouse Stock Tracking & Instant Restock Dataflow

Maintains stock health analytics, automatic threshold badges (`Healthy >10`, `Low Stock 1-10`, `Depleted 0`), and 1-click batch restock increments.

```
[Admin Inventory View]           [Next.js API: /api/products/[id]]         [MongoDB Database]
          │                                      │                                 │
          │── 1. Admin clicks "+25 Units" ──────>│                                 │
          │      on Coconut Oil (Current: 4)     │                                 │
          │                                      │── 2. Update stock:              │
          │                                      │      currentStock = 4 + 25 = 29 │
          │                                      │                                 │
          │                                      │── 3. Product.findByIdAndUpdate─>│
          │                                      │<── 4. Updated document ─────────│
          │                                      │                                 │
          │<── 5. HTTP 200 OK ───────────────────│                                 │
          │                                                                        │
          │── 6. UI recalculates:                                                  │
          │      • Stock Health badge: Low Stock ➔ HEALTHY                         │
          │      • Warehouse KPI Total units updated                               │
```

---

## 2.7 Dual-Pane Independent Scrolling & UI Layering Dataflow

Solves the viewport scrolling bug where inner tables could not scroll or the sidebar would stick.

```
+-----------------------------------------------------------------------------------------------+
| BROWSER WINDOW (100vw, 100vh)                                                                 |
| CSS Rule: body { overflow: hidden; }                                                          |
| Lenis Smooth-Scroll: Route-Aware Middleware DISBLES Lenis on /admin and /profile routes       |
|                                                                                               |
|  +-------------------------------------+   +-----------------------------------------------+  |
|  | LEFT SIDEBAR CONTAINER              |   | RIGHT MAIN OPERATIONS CONTAINER               |  |
|  | (.admin-sidebar)                    |   | (.admin-main)                                 |  |
|  | height: 100vh;                      |   | height: 100vh; overflow: hidden;              |  |
|  | overflow-y: auto;                   |   |                                               |  |
|  | overscroll-behavior: contain;       |   |  +-----------------------------------------+  |  |
|  |                                     |   |  | FIXED STICKY TOPBAR HEADER              |  |  |
|  | [ Brand Logo & Identity ]           |   |  | height: 64px; flex-shrink: 0;           |  |  |
|  | [ Navigation Link: Dashboard ]      |   |  +-----------------------------------------+  |  |
|  | [ Navigation Link: Products ]       |   |                                               |  |
|  | [ Navigation Link: Categories ]     |   |  +-----------------------------------------+  |  |
|  | [ Navigation Link: Inventory ]      |   |  | INDEPENDENT SCROLL CANVAS               |  |  |
|  | [ Navigation Link: Orders ]         |   |  | (.admin-page-content)                   |  |  |
|  | [ Navigation Link: Customers ]      |   |  | height: calc(100vh - 64px);             |  |  |
|  | [ Navigation Link: Coupons ]        |   |  | overflow-y: auto;                       |  |  |
|  | [ Navigation Link: Analytics ]      |   |  | overscroll-behavior: contain;           |  |  |
|  |                                     |   |  |                                         |  |  |
|  |                                     |   |  | [ KPI Stat Cards Grid ]                 |  |  |
|  | [ Admin Profile Sticky Footer ]     |   |  | [ Filter Tabs Bar (All, Low Stock) ]    |  |  |
|  |                                     |   |  | [ Responsive Data Table / Content ]     |  |  |
|  |  * SCROLLS ON ITS OWN WHEEL *       |   |  |  * SCROLLS ON ITS OWN WHEEL *           |  |  |
|  +-------------------------------------+   +--+-----------------------------------------+--+  |
+-----------------------------------------------------------------------------------------------+
```

---

# 3. Complete Database Models & Schema Specifications

```
                             +-------------------+
                             |      User         |
                             +-------------------+
                             | _id               |
                             | name              |
                             | email (unique)    |
                             | password (hash)   |
                             | phone             |
                             | isAdmin (boolean) |
                             | deliveryAddress   |
                             +---------+---------+
                                       │ 1
                                       │
                                       │ places
                                       │
                                       ▼ *
+--------------------+       +-------------------+       +-------------------+
|      Category      |       |      Order        |       |      Coupon       |
+--------------------+       +-------------------+       +-------------------+
| _id                |       | _id               |       | _id               |
| name               |       | orderNumber       |       | code (unique)     |
| slug               |       | user (ref: User)  |       | discountType      |
| taxRate            |       | items [Product]   |       | discountValue     |
| sortOrder          |       | totalAmount       |       | minOrderAmount    |
| isActive           |       | orderStatus       |       | validUntil        |
+---------+----------+       | paymentStatus     |       | usageLimit        |
          │                  | statusHistory     |       +-------------------+
          │ organizes        +-------------------+
          │
          ▼ *
+--------------------+       +-------------------+       +-------------------+
|      Product       |       |  ContactMessage   |       |      Banner       |
+--------------------+       +-------------------+       +-------------------+
| _id                |       | _id               |       | _id               |
| name               |       | name              |       | title             |
| productCode (SKU)  |       | email             |       | subtitle          |
| price / mrp        |       | phone             |       | imageUrl          |
| currentStock       |       | subject           |       | linkUrl           |
| variants [Size]    |       | message           |       | isActive          |
| isFeatured         |       | status            |       +-------------------+
+--------------------+       +-------------------+
```

### 3.1 `User.js` Model
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  deliveryAddress: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: 'Tamil Nadu' },
    zipCode: { type: String, default: '' },
    landmark: { type: String, default: '' }
  },
  resetPasswordOtp: String,
  resetPasswordExpires: Date
}, { timestamps: true });
```

### 3.2 `Product.js` Model
```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  productCode: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  subCategory: { type: String, default: '' },
  images: [{ type: String }],
  imageUrl: { type: String, default: '/assets/hero/turmeric.png' },
  currentStock: { type: Number, default: 50 },
  initialStock: { type: Number, default: 50 },
  variants: [{
    size: String,
    price: Number,
    mrp: Number,
    stock: Number,
    sku: String
  }],
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

### 3.3 `Order.js` Model
```javascript
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    size: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentMethod: { type: String, enum: ['COD', 'Razorpay', 'Card'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  subtotal: Number,
  discountAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: Number,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });
```

---

# 4. Comprehensive REST API Route Registry

| Endpoint Route | HTTP Method | Authentication | Functionality Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Registers customer, hashes password, generates OTP, sends verification email. |
| `/api/auth/verify-otp` | `POST` | Public | Validates OTP and activates user account. |
| `/api/auth/login` | `POST` | Public | Authenticates credentials, auto-provisions master admin if needed, returns JWT. |
| `/api/auth/me` | `GET` | Bearer JWT | Returns current authenticated profile session. |
| `/api/auth/update-profile`| `PUT` | Bearer JWT | Updates personal information and delivery address. |
| `/api/auth/forgot-password`| `POST` | Public | Generates and emails password reset verification code. |
| `/api/auth/reset-password` | `POST` | Public | Resets password after OTP verification. |
| `/api/products` | `GET` | Public / Admin | Returns catalog with category, search, and pagination filters. |
| `/api/products` | `POST` | Admin JWT | Creates new product with multi-weight variants and images. |
| `/api/products/[id]` | `GET` | Public | Fetches individual product by ID or slug. |
| `/api/products/[id]` | `PUT` | Admin JWT | Updates product metadata, pricing, or stock units. |
| `/api/products/[id]` | `DELETE`| Admin JWT | Soft/hard deletes product from catalog. |
| `/api/categories` | `GET` | Public | Retrieves active category list and tax configurations. |
| `/api/categories` | `POST` | Admin JWT | Creates new category taxonomy. |
| `/api/orders` | `GET` | User / Admin | Lists customer orders or all warehouse orders for admin. |
| `/api/orders` | `POST` | User JWT | Submits new order, validates stock, and decrements inventory. |
| `/api/orders/[id]` | `GET` | User / Admin | Returns single order details and line items. |
| `/api/orders/[id]` | `PUT` | Admin JWT | Transitions order lifecycle status (`Pending` ➔ `Delivered`). |
| `/api/coupons` | `GET` | Admin JWT | Fetches all discount promo codes. |
| `/api/coupons` | `POST` | Admin JWT | Registers new promo code with usage limit rules. |
| `/api/coupons/validate` | `POST` | User JWT | Validates promo code against current cart value. |
| `/api/offers` | `GET` | Public | Fetches active marketing offers and banner promotions. |
| `/api/banners` | `GET` | Public | Fetches homepage hero carousel slides. |
| `/api/messages` | `POST` | Public | Submits customer contact or farm concierge inquiry. |
| `/api/messages` | `GET` | Admin JWT | Retrieves all customer support inquiries. |
| `/api/analytics` | `GET` | Admin JWT | Returns computed revenue, order velocity, and sales distributions. |
| `/api/settings` | `GET` | Public | Returns store contact info, WhatsApp number, and delivery rules. |
| `/api/settings` | `PUT` | Admin JWT | Updates global store preferences and thresholds. |

---

# 5. Frontend Component Hierarchy & State Architecture

```
App Root Layout (`src/app/layout.js`)
├── Providers (`src/components/Providers.jsx`)
│   ├── Route-Aware Smooth Scroll Handler (Disables Lenis on /admin & /profile)
│   ├── AuthProvider (`src/context/AuthContext.jsx`) [Maintains token, user & login/logout state]
│   ├── CartProvider (`src/context/CartContext.jsx`) [Maintains cart items, promo codes, subtotal]
│   └── ToastContainer (`react-toastify`)
│
├── STOREFRONT PAGES
│   ├── Header / Navigation (`src/components/Header.jsx`)
│   ├── Page Content (Home, Products, Categories, Checkout)
│   └── Footer (`src/components/Footer.jsx` - Hidden on /admin & /profile)
│
├── CUSTOMER MEMBER SUITE (`/profile`)
│   ├── Profile Layout (`src/app/profile/layout.jsx`)
│   └── Tabbed Hub (`src/app/profile/page.jsx`)
│       ├── Tab 1: Orders Timeline & Status Stepper
│       ├── Tab 2: Saved Delivery Address Manager
│       ├── Tab 3: Profile Security & Password Update
│       ├── Tab 4: Available Coupon Vouchers
│       └── Tab 5: Farm Concierge Direct Assistance
│
└── EXECUTIVE OPERATIONS CONSOLE (`/admin`)
    ├── Admin Layout (`src/app/admin/layout.jsx` - 100vh Locked Shell)
    └── AdminGuard (`src/app/admin/components/AdminGuard.jsx`)
        ├── AdminSidebar (`src/app/admin/components/AdminSidebar.jsx` - Left Scroll Pane)
        ├── AdminTopNav (`src/app/admin/components/AdminTopNav.jsx` - Fixed Sticky Topbar)
        └── Admin Page Content (`.admin-page-content` - Right Scroll Pane)
            ├── Dashboard (`src/app/admin/page.jsx`)
            ├── Catalog (`src/app/admin/products/page.jsx`)
            │   └── ProductFormModal (Local File Upload + Variant Matrix)
            ├── Inventory (`src/app/admin/inventory/page.jsx`)
            │   └── RestockModal (Quick +10, +25, +50, +100 units)
            ├── Orders (`src/app/admin/orders/page.jsx`)
            │   └── OrderDetailModal (Printable Invoice Receipt)
            ├── Customers CRM (`src/app/admin/customers/page.jsx`)
            ├── Coupons (`src/app/admin/coupons/page.jsx`)
            ├── Offers (`src/app/admin/offers/page.jsx`)
            ├── Banners (`src/app/admin/banners/page.jsx`)
            ├── Concierge Messages (`src/app/admin/messages/page.jsx`)
            ├── Analytics (`src/app/admin/analytics/page.jsx`)
            └── Settings (`src/app/admin/settings/page.jsx`)
```

---

# 6. Email Deliverability & Anti-Spam Pipeline

To guarantee transactional verification codes reach the **Primary Inbox** rather than Spam or Promotions:

1. **Direct Authenticated TLS/SSL Tunnel**:
   - Host: `smtp.gmail.com`
   - Port: `465` (Direct SSL)
   - Secure: `true`
   - User: `theventhulir@gmail.com`
2. **Standard Anti-Spam Machine-Readable Headers**:
   ```javascript
   headers: {
     'Auto-Submitted': 'auto-generated',
     'X-Auto-Response-Suppress': 'All',
     'Precedence': 'bulk',
     'X-Priority': '1',
     'Importance': 'high'
   }
   ```
3. **Optimized Subject Line**:
   - Uses concise transactional copy without promotional buzzwords:
   - `Your Venthulir verification code is 123456`

---

# 7. System Credentials & Operational Runbook

### Primary Administrator Logins:
- **Administrative Portal:** `http://localhost:3000/admin`

| Identifier / Email | Password | Assigned Role | Permissions |
| :--- | :--- | :--- | :--- |
| **`admin`** (or `admin@venthulir.com`) | **`admin123`** | Master Administrator | Full unrestricted access |
| **`mentorixacademy.ma@gmail.com`** | **`Test@123`** | Executive Administrator | Full unrestricted access |
| **`thesmgroups@gmail.com`** | **`Admin@123`** | Operations Administrator | Full unrestricted access |

### Server Execution:
- **Fullstack Next.js Server:** `npm run dev` (Runs on `http://localhost:3000`)
- **Production Build:** `npm run build` (Compiles all 44 routes with zero warnings)

---
*End of Master Architecture & Dataflow Specification.*
