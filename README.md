# ZeroBroker Workspace

This repository contains a microservices-style split between the frontend and backend services.

- `front-end/` contains the React Vite frontend application.
- `backend/` contains the property listing backend service.
- `backend-auth/` contains the auth backend service with signup and signin endpoints.

To work with the frontend project:

```bash
cd front-end
npm install
npm run dev
```

To run the property backend:

```bash
cd backend
npm install
npm run dev
```

To run the auth backend:

```bash
cd backend-auth
npm install
npm run dev
```

By default the frontend uses `VITE_API_BASE_URL` to reach the property backend and `VITE_AUTH_BASE_URL` to reach the auth backend.

The frontend also supports offline-ready fallback behavior so the UI stays responsive if one backend service is unavailable.
