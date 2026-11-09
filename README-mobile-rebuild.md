# Kiangan Pickleball v5 mobile rebuild

- Mobile-first navigation, larger tap targets, responsive admin cards, courts and player pool.
- Preserves weekly resets and queue features from v5.
- QueueEntry explicitly includes `playerId`; optional skill level is normalized before indexing.
- Dashboard background polling changed from every 3 seconds to every 12 seconds; successful actions still refresh immediately.

## Before deploying

Run `npm ci` (if lockfile exists) or `npm install`, `npm test`, and `npm run build` locally or in Vercel Preview. **A production build could not be verified in the artifact-generation environment** because npm dependency installation timed out. Do not promote to production until build passes.

Required environment variables: `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `ADMIN_SETUP_SECRET`, `CRON_SECRET`.
