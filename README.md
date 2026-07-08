# ReScrapIt

A B2B marketplace connecting businesses that sell industrial waste/scrap with
businesses that can use it as raw material. See `MASTER_PROMPT.md` (project brief)
for the full product vision and roadmap.

This repository implements the **complete roadmap (Phases 0–4)**: foundation
fixes, the core marketplace, orders & trust, B2B polish, and the full feature
set — payments/escrow/refunds, invoices, KYC & verification (email/OTP/password
reset), cart/wishlist, saved searches, featured/trending, reviews with photos
and moderation, reports, and a full admin panel. External-only services
(Razorpay, SMTP email, SMS) have real integration code with safe local
fallbacks, so every flow works end-to-end without credentials.

## Monorepo layout

```
ReScrapIt/
├── backend/    # Express + MongoDB + Socket.IO API (port 4000)
└── frontend/   # React (Vite) SPA
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (defaults to `mongodb://127.0.0.1:27017`)

## Setup

### Backend

```bash
cd backend
cp .env.example .env      # then edit values
npm install
npm run dev               # or: npm start
```

Backend environment variables (`backend/.env`):

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | yes | Mongo connection string (DB name `rescrapit` is appended automatically) |
| `PORT` | no | API port (default `4000`) |
| `JWT_SECRET_KEY` | yes | Secret used to sign JWTs |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no | If set, listing images are uploaded to Cloudinary; otherwise base64 is stored (dev fallback) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | no | If set, payments use Razorpay; otherwise the payment step is simulated (dev fallback) |
| `PLATFORM_FEE_PERCENT` | no | Commission % taken from each paid order (default 2) |
| `SMTP_*` | no | SMTP credentials for transactional email; without them emails are logged |
| `SMS_PROVIDER` / `SMS_API_KEY` | no | SMS provider for phone OTP; without them the OTP is logged/returned in dev |
| `FRONTEND_URL` | no | Public frontend URL used in email links |
| `ADMIN_EMAILS` | no | Comma-separated admin emails (bootstraps platform admins) |
| `SEMANTIC_SEARCH_URL` | no | Base URL of the optional external semantic-search service |

### Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

The frontend reads the API base URL from `import.meta.env.VITE_API_URL`.

## What works (Phase 0 + 1 + 2 + 3)

- **Auth & roles:** signup auto-login; JWT login; buyer/seller/dual/admin roles;
  banned accounts are blocked at the middleware.
- **Protected routes:** private pages require authentication (`ProtectedRoute` +
  `AuthContext`); admin pages require `AdminRoute`; a centralized Axios client
  attaches the `Authorization` header.
- **Company & KYC:** editable company profile (name, GST, bio); KYC document
  upload; admin approval grants a verified badge.
- **Listings:** full CRUD with price, unit, category, location, status, MOQ,
  specifications and images (Cloudinary or base64 fallback).
- **Browse & discovery:** paginated browse with category/city/price filters and
  sorting; listing detail; seller storefronts with verified badges + ratings.
- **Chat:** real-time 1:1 messaging over Socket.IO, backed by REST history.
- **Offers:** buyers send offers; sellers accept / reject / counter; buyers
  confirm to create an order.
- **Orders:** full lifecycle (payment → pickup → in transit → delivered →
  completed) with a status timeline, delivery-proof upload, disputes and a
  payment step (Razorpay when configured, simulated otherwise).
- **Reviews & ratings:** buyers review completed orders; sellers respond;
  aggregate star ratings are cached on the seller and shown on cards/profiles.
- **Notifications:** in-app notifications on offers, orders, reviews, disputes
  and KYC, with an unread badge in the navbar.
- **Admin panel:** platform analytics (GMV, users, listings, orders, disputes),
  user verification/banning, listing/order oversight, and dispute resolution.
- **Analytics:** the dashboard shows real per-user revenue, spend, active
  listings and active orders.

## API overview

### Auth & users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | – | Register + return `{ token, user }` |
| POST | `/auth/login` | – | Login + return `{ token, user }` |
| GET | `/auth/profile` | ✓ | Current user |
| GET | `/api/users/:id` | – | Public seller profile (incl. rating) |

### Listings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/scrap` | – | Browse (filters, sort, pagination) |
| GET | `/api/scrap/:id` | – | Listing detail |
| POST | `/api/scrap/add` | ✓ | Create listing |
| PUT | `/api/scrap/:id` | ✓ | Update own listing |
| DELETE | `/api/scrap/delete/:id` | ✓ | Delete own listing |
| GET | `/api/scrap/my-listings` | ✓ | Seller inventory |
| GET | `/api/scrap/seller/:sellerId` | – | A seller's active listings |
| GET | `/api/scrap/search?query=` | – | Text search |

### Offers & orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/offers` | ✓ | Buyer makes an offer |
| GET | `/api/offers` | ✓ | My offers (buyer + seller) |
| PUT | `/api/offers/:id/respond` | ✓ | Seller accept/reject/counter |
| POST | `/api/offers/:id/confirm` | ✓ | Buyer confirms → creates order |
| GET | `/api/orders/my-orders` | ✓ | Buyer orders |
| GET | `/api/orders/seller-orders` | ✓ | Seller orders |
| GET | `/api/orders/:id` | ✓ | Order detail |
| PUT | `/api/orders/:id/status` | ✓ | Advance lifecycle status |
| POST | `/api/orders/:id/pay` | ✓ | Pay (Razorpay or simulated) |
| POST | `/api/orders/:id/delivery-proof` | ✓ | Seller uploads proof |

### Reviews
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reviews` | ✓ | Review a completed order |
| GET | `/api/reviews/seller/:sellerId` | – | Reviews for a seller |
| GET | `/api/reviews/listing/:listingId` | – | Reviews for a listing |
| PUT | `/api/reviews/:id/respond` | ✓ | Seller responds |

### Profile, notifications, disputes & admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/auth/profile` | ✓ | Update profile / company fields |
| POST | `/auth/kyc` | ✓ | Upload a KYC document |
| GET | `/api/notifications` | ✓ | List notifications + unread count |
| PUT | `/api/notifications/:id/read` | ✓ | Mark one read |
| PUT | `/api/notifications/read-all` | ✓ | Mark all read |
| POST | `/api/disputes` | ✓ | Raise a dispute on an order |
| GET | `/api/disputes/mine` | ✓ | My disputes |
| GET | `/api/analytics/me` | ✓ | Personal dashboard stats |
| GET | `/api/admin/users` | admin | List users |
| PUT | `/api/admin/users/:id/verify` | admin | Approve KYC |
| PUT | `/api/admin/users/:id/ban` | admin | Ban / unban a user |
| GET | `/api/admin/listings` | admin | All listings |
| GET | `/api/admin/orders` | admin | All orders |
| GET | `/api/admin/disputes` | admin | All disputes |
| PUT | `/api/admin/disputes/:id/resolve` | admin | Resolve a dispute |
| GET | `/api/admin/analytics` | admin | Platform stats (GMV, counts) |

> **Becoming an admin:** add your email to `ADMIN_EMAILS` in `backend/.env`
> (comma-separated) or set a user's `role` to `admin` directly in MongoDB. The
> `/admin` panel then becomes available in the navbar.

### Chat & upload
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload/image` | ✓ | Upload image(s) (Cloudinary or base64) |
| POST | `/api/chat/createchat` | ✓ | Create/get a 1:1 chat |
| GET | `/api/chat/getchat` | ✓ | List the user's chats |
| POST | `/api/message/send` | ✓ | Send a message |
| GET | `/api/message/get/:chatId` | ✓ | Get a chat's messages |

> **Note:** Live Razorpay payments, transactional email and the external
> semantic-search service require credentials/services that are not bundled;
> without them the app falls back to safe local behavior (simulated payment,
> base64 images, MongoDB text search).
