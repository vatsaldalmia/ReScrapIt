# ReScrapIt

A B2B marketplace connecting businesses that sell industrial waste/scrap with
businesses that can use it as raw material. See `MASTER_PROMPT.md` (project brief)
for the full product vision and roadmap.

This repository implements **Phases 0–2** of the roadmap: foundation fixes, the
core marketplace (listings, browse, seller storefronts), and orders & trust
(offers, order lifecycle, reviews & ratings) — a working end-to-end B2B flow
from listing to review.

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
| `SEMANTIC_SEARCH_URL` | no | Base URL of the optional external semantic-search service |

### Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

The frontend reads the API base URL from `import.meta.env.VITE_API_URL`.

## What works (Phase 0 + 1 + 2)

- **Auth:** signup returns a JWT and auto-logs the user in; login returns a JWT +
  the full user object; `/auth/profile` is protected.
- **Protected routes:** private pages require authentication (`ProtectedRoute` +
  `AuthContext`); a centralized Axios client attaches the `Authorization` header.
- **Listings:** full CRUD with price, unit, category, location, status, MOQ,
  specifications and images (Cloudinary or base64 fallback).
- **Browse & discovery:** paginated browse with category/city/price filters and
  sorting; listing detail; seller storefronts.
- **Chat:** real-time 1:1 messaging over Socket.IO, backed by REST history.
- **Offers:** buyers send offers; sellers accept / reject / counter; buyers
  confirm to create an order.
- **Orders:** full lifecycle (payment → pickup → in transit → delivered →
  completed) with a status timeline, delivery-proof upload and a payment step
  (Razorpay when configured, simulated otherwise).
- **Reviews & ratings:** buyers review completed orders; sellers respond;
  aggregate star ratings are cached on the seller and shown on cards/profiles.

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
