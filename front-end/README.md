# ZeroBroker

Brokerage-free rental and property buying platform front-end.

## Features

- **Zero brokerage** — Every listing is owner-direct with no agent fees
- **Location-based search** — Filter by city, locality, and bedrooms
- **Rent & buy** — Separate flows for rentals and property purchases
- **Property details** — Full listing pages with specs and contact actions

## Tech Stack

- React 18 + TypeScript
- Vite 5
- React Router 6

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The frontend is configured to interact with two backend services:

- `VITE_API_BASE_URL` for property data (default: `http://localhost:4000`)
- `VITE_AUTH_BASE_URL` for auth operations (default: `http://localhost:5000`)

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/   # Reusable UI (Header, SearchBar, PropertyCard)
├── data/         # Mock property listings
├── pages/        # Route pages (Home, Rent, Buy, Detail)
├── types/        # TypeScript interfaces
└── utils/        # Search & filter helpers
```

## Next Steps

- Connect to a Node.js/Express backend API
- Add user authentication
- Integrate maps (Google Maps / Mapbox) for location search
- Add real-time chat with property owners
