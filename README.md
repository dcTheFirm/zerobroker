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

## MongoDB Atlas

All backend services read `MONGODB_URI` and `MONGODB_DB_NAME`. Put these values in the root `.env` file, or in each service's own `.env` file if you prefer to run services independently.

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/zero_broker?retryWrites=true&w=majority
MONGODB_DB_NAME=zero_broker
```

When `MONGODB_URI` is present, the services use Atlas collections:

- `properties` for home, rent, buy, search, and the original backend
- `users` for auth
- `property_requests` for contact and visit requests

Without `MONGODB_URI`, the services fall back to the existing sample data so local tests and first-time setup still work.

Seed the Atlas `properties` collection from the sample listings:

```bash
cd backend
npm run seed:atlas
```

By default the frontend uses environment variables to connect each section independently:

- `VITE_HOME_BASE_URL` for home data
- `VITE_RENT_BASE_URL` for rent listings
- `VITE_BUY_BASE_URL` for buy listings
- `VITE_SEARCH_BASE_URL` for search
- `VITE_AUTH_BASE_URL` for auth

This setup keeps each major service independent: if one service is unavailable, the others can still respond locally or continue to work.

The frontend also supports offline-ready fallback behavior so the UI stays responsive if one backend service is unavailable.
