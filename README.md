# ReScrapIt

A B2B marketplace connecting businesses that sell industrial waste/scrap with
businesses that can use it as raw material. See `MASTER_PROMPT.md` (project brief)
for the full product vision and roadmap.

This repository currently implements **Phase 0 — Foundation Fixes**: a working
end-to-end slice (signup → auto-login → protected dashboard → real listings,
search, and real-time chat).

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
| `SEMANTIC_SEARCH_URL` | no | Base URL of the optional external semantic-search service |

### Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

The frontend reads the API base URL from `import.meta.env.VITE_API_URL`.

## What works (Phase 0)

- **Auth:** signup returns a JWT and auto-logs the user in; login returns a JWT +
  the full user object; `/auth/profile` is protected.
- **Protected routes:** `/dashboard` requires authentication (`ProtectedRoute` +
  `AuthContext`); a centralized Axios client attaches the `Authorization` header.
- **Listings:** create a listing (`POST /api/scrap/add`) with images uploaded via
  `POST /api/upload/image`.
- **Search:** `GET /api/scrap/search?query=` runs a MongoDB text search and returns
  listings with populated seller info.
- **Chat:** real-time 1:1 messaging over Socket.IO, backed by REST history.

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | – | Register + return `{ token, user }` |
| POST | `/auth/login` | – | Login + return `{ token, user }` |
| GET | `/auth/profile` | ✓ | Current user |
| POST | `/api/scrap/add` | ✓ | Create listing |
| DELETE | `/api/scrap/delete/:id` | ✓ | Delete own listing |
| GET | `/api/scrap/search?query=` | – | Text search (MongoDB) |
| GET | `/api/scrap/semantic-search?query=` | – | Proxy to external AI search |
| POST | `/api/upload/image` | ✓ | Upload image(s) (Cloudinary or base64 fallback) |
| POST | `/api/chat/createchat` | ✓ | Create/get a 1:1 chat |
| GET | `/api/chat/getchat` | ✓ | List the user's chats |
| POST | `/api/message/send` | ✓ | Send a message |
| GET | `/api/message/get/:chatId` | ✓ | Get a chat's messages |
