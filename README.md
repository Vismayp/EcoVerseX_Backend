# EcoVerseX Backend

## Overview

Node.js backend for EcoVerseX, hosted on Railway.app. Handles user authentication, activity verification, EcoCoin transactions, and data storage.

## Tech Stack

- Node.js + Express
- PostgreSQL (Railway managed)
- Prisma ORM
- Firebase Auth
- Cloudinary for images

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- Railway CLI
- PostgreSQL client

### Installation

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd EcoVerseX_Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env` file:

   ```
   DATABASE_URL=<Railway PostgreSQL URL>
   FIREBASE_PROJECT_ID=<Your Firebase Project ID>
   CLOUDINARY_CLOUD_NAME=<Cloudinary Name>
   CLOUDINARY_API_KEY=<API Key>
   CLOUDINARY_API_SECRET=<API Secret>
   ```

4. Run Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Documentation (Swagger)

- Swagger UI: `http://localhost:<PORT>/api/docs`
- OpenAPI JSON: `http://localhost:<PORT>/api/docs.json`

### API Endpoints (high level)

- Health: `GET /api/health`
- User: `POST /api/user/sync`, `GET /api/user/profile`, `GET /api/user/leaderboard`
- Activities: `GET/POST /api/activities`, `GET /api/activities/pending`, `PATCH /api/activities/:id/verify`
- Missions: `GET /api/missions`, `POST /api/missions/:id/join`
- Shop: `GET /api/shop/items`, `POST /api/shop/orders`
- Tours: `GET /api/tours`, `POST /api/tours/book`
- Carbon: `POST /api/carbon/calculate`, `GET /api/carbon/my-credits`
- Community: `GET /api/circles`, `POST /api/circles/:id/join`
- Admin: `GET /api/admin/stats`

### Database Schema

See `prisma/schema.prisma` for full schema.

## Deployment

Deploy to Railway.app:

```bash
railway login
railway link
railway up
```

## Development Notes

- Use Prisma for type-safe queries.
- All image uploads go through Cloudinary.
- Implement rate limiting for API calls.

## Contributing

Use ESLint and Prettier. Write tests for new endpoints.
