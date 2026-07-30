# ZeroBroker Workspace

This repository contains a microservices architecture with independent services for auth, home data, rent listings, buy listings, and search.

- `front-end/` contains the React Vite frontend application.
- `backend-auth/` contains auth APIs for signup and signin.
- `backend-home/` contains home section APIs for featured properties and cities.
- `backend-rent/` contains rent section APIs for rental listings and details.
- `backend-buy/` contains buy section APIs for sale listings and details.
- `backend-search/` contains global search APIs used by the search page.
- `backend/` remains available as the original property backend service.

To work with the frontend project:

```bash
cd front-end
npm install
npm run dev
```

To run the auth backend:

```bash
cd backend-auth
npm install
npm run dev
```

To run the home backend:

```bash
cd backend-home
npm install
npm run dev
```

To run the rent backend:

```bash
cd backend-rent
npm install
npm run dev
```

To run the buy backend:

```bash
cd backend-buy
npm install
npm run dev
```

To run the search backend:

```bash
cd backend-search
npm install
npm run dev
```

By default the frontend uses environment variables to connect each section independently:

- `VITE_HOME_BASE_URL` for home data
- `VITE_RENT_BASE_URL` for rent listings
- `VITE_BUY_BASE_URL` for buy listings
- `VITE_SEARCH_BASE_URL` for search
- `VITE_AUTH_BASE_URL` for auth

This setup keeps each major service independent: if one service is unavailable, the others can still respond locally or continue to work.

The frontend also supports offline-ready fallback behavior so the UI stays responsive if one backend service is unavailable.
