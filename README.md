# School Payments Frontend

React + Vite dashboard that consumes the backend API.

## Setup & Installation
1. Copy `.env.example` to `.env`
```
VITE_API_BASE=http://localhost:4000
```
2. Install dependencies
```
npm install
```
3. Run locally
```
npm run dev
```
Open http://localhost:5173

## Setup

1. Copy `.env.example` to `.env`
```
VITE_API_BASE=http://localhost:4000
```

2. Install and run
```
npm install
npm run dev
```

Open http://localhost:5173

## Pages
- Transactions list with filters/sorting/pagination
- Transactions by school
- Status check and demo create-payment

Login with the user you registered on the backend.

## Environment Variables
- `VITE_API_BASE` – backend base URL (e.g., `http://localhost:4000` for local, or your Render URL in production)

Auth token handling:
- After login, the JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>` via `src/api.js` axios interceptor.

## Filters and Actions
- Status filter supports multi-select (Success, Pending, Failed).
- School filter supports multi-select from the backend `/transactions/schools` list.
- Date range filters (From/To) apply to `payment_time`.
- Each row has an Action to “Check” status (admin only) which calls `/payments/check/:collect_request_id`.

## Environment variables
- `VITE_API_BASE` – backend base URL (e.g., `http://localhost:4000` or Render URL)

## Build
```
npm run build
```
Outputs to `dist/`.

## Deploy (Netlify)
1. Add site from this `frontend/` folder.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment var: `VITE_API_BASE` set to your backend public URL
5. Optional: `netlify.toml` contains SPA fallback and a sample `/api/*` proxy. Update `to` to point to your backend if you want to proxy.

