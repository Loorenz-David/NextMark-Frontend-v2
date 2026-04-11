# Delivery App Front-end

React + TypeScript + Vite single-page app for dispatching routes, orders, and items. It talks to the Flask API that lives in `../Back_end`.

## Requirements

- Node.js 20+
- npm 10+
 
## Environment

1. Copy `.env.example` to `.env.local` (or `.env`) inside this folder.
2. Adjust the values if your backend runs on a different port:

```ini
VITE_API_BASE_URL=http://127.0.0.1:5000
VITE_USE_DUMMY_DATA=false
```

When `VITE_USE_DUMMY_DATA` is `false`, all data requests go through `VITE_API_BASE_URL` (e.g., `POST http://127.0.0.1:5000/route/query_route`).
  
## Scripts

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server on http://localhost:5173
npm run build        # production build (outputs to dist/)
npm run preview      # serve the build output locally
```

The dev server proxies directly to the Flask backend; make sure `Back_end/run.py` (or `flask run`) is running beforehand so authenticated queries succeed.

## Authentication

Sign-in flows expect the Flask API to expose `/auth/login` and `/auth/refresh_token`. Tokens are stored in `sessionStorage` and added to every request. Use the backend README for seeding credentials until a registration route is provided.

