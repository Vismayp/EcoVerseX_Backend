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

### API Endpoints

- `POST /auth/login`: Firebase token verification
- `POST /activities/log`: Submit activity with image
- `GET /admin/pending`: Get pending verifications
- `POST /admin/approve`: Approve/reject activity

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
