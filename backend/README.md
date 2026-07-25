# ZeroBroker Backend

A production-ready Express + TypeScript backend for the ZeroBroker property marketplace.

## Features
- Health endpoint
- Property listing and search API
- Featured listings API
- City list endpoint
- Property detail endpoint
- Input validation with zod
- Structured service layer for maintainability
- Vitest test coverage

## Scripts
- npm install
- npm run dev
- npm run build
- npm run test

## API Overview
- GET /health
- GET /api/properties
- GET /api/properties/featured
- GET /api/properties/cities
- GET /api/properties/:id
- GET /api/search

## Example requests
- http://localhost:4000/api/properties?city=Mumbai&type=rent
- http://localhost:4000/api/properties/featured
- http://localhost:4000/api/properties/1
