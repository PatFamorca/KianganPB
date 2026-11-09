# Kiangan Pickleball

**Play! Connect! Stay Active!**

A Next.js 14 / MongoDB Atlas pickleball Open Play and tournament app designed for GitHub + Vercel. Only the organizer has a website account. Guests register for Open Play without a login.

## First deployment

1. Upload **the contents of this folder** to the GitHub repository root (including `src`, `package.json`, etc.).
2. In Vercel → Project → Settings → Environment Variables, configure `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET` (32+ random characters), and `ADMIN_SETUP_SECRET` (24+ random characters). Do not commit real secrets to GitHub.
3. Deploy the project. Open `/api/v1/health` to verify API routing.
4. Open `/setup` and create the first admin account using `ADMIN_SETUP_SECRET`. Once created, the setup form closes.
5. Sign in at `/admin/login`, create courts, and create an Open Play session.
6. Share `/open-play` with guests; they select the active session and enter their names.
7. Manage courts, queues and tournaments at `/admin`.

## Routes

- `/` — Kiangan Pickleball homepage
- `/open-play` — public guest Open Play registration
- `/tournaments` — public tournament listing
- `/display` — public court display
- `/setup` — one-time admin account creation
- `/admin/login` — admin login
- `/admin` — organizer dashboard

## Important

The legacy public website account registration is disabled and redirects to Open Play. Public guest registration is available only for active Open Play sessions. Admin setup requires a private environment secret; keep the Vercel project protected until you complete setup.

Existing MongoDB data from the previous version is **not automatically migrated**. If you already have a user with role `admin`, setup is closed; use that admin login or intentionally migrate/reset the existing user data. Do not delete production data without a backup.

For Vercel, the app uses polling rather than persistent Socket.IO. MongoDB Atlas must be accessible from Vercel. Local MongoDB may be used for local development.

This is a starter MVP, not a fully hardened production service: add abuse prevention/rate limits, robust guest identity verification, audit logs, and stronger concurrency handling before large public events. Tournament double elimination is experimental.
