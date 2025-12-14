# EcoVerseX Backend Implementation Plan

## 1. Database Schema Updates (Prisma)

- [ ] **AgriTour Booking:** Create `AgriTourBooking` model to track user bookings.
- [ ] **Community:** Create `EcoCircle` and `UserEcoCircle` models for local sustainability groups.
- [ ] **Run Migration:** Execute `npx prisma migrate dev --name add_tours_and_circles` to update the database.

## 2. Project Structure Setup

- [ ] Create directory structure:
  - `src/controllers`
  - `src/routes`
  - `src/middleware`
  - `src/services`
  - `src/utils`
- [ ] Move `server.js` logic to `src/app.js` and keep `server.js` as entry point (optional but recommended for testing).

## 3. Authentication & User Management

- [ ] **Middleware:** Refine `authMiddleware` to attach full user object from DB to `req.user`.
- [ ] **Sync Endpoint:** Create `POST /api/auth/sync` to create/update user in PostgreSQL after Firebase login.
- [ ] **Profile:** Create `GET /api/user/profile` to fetch stats (EcoCoins, Streak, Tier).
- [ ] **Leaderboard:** Create `GET /api/user/leaderboard` to fetch top users.

## 4. Core Features - Activities (The Core Loop)

- [ ] **Upload Service:** Implement `cloudinary` service for handling image uploads.
- [ ] **Log Activity:** `POST /api/activities`
  - Handle image upload.
  - Create `Activity` record with status `PENDING`.
- [ ] **User History:** `GET /api/activities/my-history`.
- [ ] **Admin Verification:**
  - `GET /api/admin/activities/pending` (List pending).
  - `PATCH /api/admin/activities/:id/verify` (Approve/Reject).
  - **Gamification Hook:** On approval, trigger `GamificationService` to update Wallet & Streak.

## 5. Core Features - Missions

- [ ] **List Missions:** `GET /api/missions` (Filter by active).
- [ ] **Join Mission:** `POST /api/missions/:id/join`.
- [ ] **Update Progress:** `PATCH /api/missions/:id/progress` (Manual or auto-update logic).

## 6. Core Features - EcoShop

- [ ] **List Items:** `GET /api/shop/items`.
- [ ] **Place Order:** `POST /api/shop/orders`.
  - Validate EcoCoin balance.
  - Deduct coins transactionally.
  - Create `ShopOrder`.

## 7. Core Features - AgriTours

- [ ] **List Tours:** `GET /api/tours`.
- [ ] **Book Tour:** `POST /api/tours/book`.

## 8. Core Features - Carbon Credits

- [ ] **Calculate:** `POST /api/carbon/calculate` (Save calculation result).
- [ ] **My Credits:** `GET /api/carbon/my-credits`.

## 9. Core Features - Community (EcoCircles)

- [ ] **List Circles:** `GET /api/circles`.
- [ ] **Join Circle:** `POST /api/circles/:id/join`.

## 10. Services & Utils

- [ ] **GamificationService:**
  - Logic to calculate Streak (rolling 7-day window).
  - Logic to update Tier (Bronze -> Silver, etc.).
  - Logic to award EcoCoins.
- [ ] **CloudinaryService:** Helper for image upload/delete.

## 11. Admin Routes

- [ ] **Dashboard Stats:** `GET /api/admin/stats` (Total users, CO2 saved, etc.).

## 12. Final Polish

- [ ] **Rate Limiting:** Ensure sensitive routes are protected.
- [ ] **Validation:** Add input validation (e.g., using `joi` or `zod`).
- [ ] **Error Handling:** Global error handler middleware.
