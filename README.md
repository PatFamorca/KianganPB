# Kiangan Pickleball — self-service Open Play PWA

Mobile-first Next.js 14 app for creating private, device-owned Open Play sessions.

## Setup

1. `npm ci`
2. Set `MONGODB_URI` and optionally `MONGODB_DB` in `.env.local`.
3. `npm run build` then `npm start` (or `npm run dev`).
4. Deploy to Vercel with the same environment variables and HTTPS.

## Data and ownership

New sessions use the **selfOpenPlaySessions** MongoDB collection. Existing collections are left untouched. Each new session gets a random organizer key stored in the creating browser's localStorage; only its SHA-256 hash is stored in MongoDB. Requests require that key. Clearing browser storage, changing browsers/devices, or losing the device loses access to the session; there is no account recovery. Anyone who obtains a device key can control that session. Export/backup and multi-device sync are not included.

## Features

Create/resume/reset/delete sessions; court count; player names/skill/style; fair, balanced, random, or fixed rotation; automatic/manual assignments; 11-point win-by-two scoring; rankings; PWA installation. No admin dashboard. Match history is session-scoped and reset deletes it. Live data requires internet.

## Important

Device-based ownership is convenient but not suitable for shared/public organizer devices. Existing MongoDB records are preserved but the old admin/public routes are removed. Production build and browser smoke tests should be performed before deployment.
