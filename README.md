# Kiangan Pickleball — Open Play Only

This release is based on the supplied v6.2 collapsible manual-assignment project. Tournament pages, navigation, admin controls, tournament API routes, and tournament engine functions have been removed.

## Features retained
- Public Open Play registration, guest skill levels and play styles
- Admin court and player management, editing, session resets
- FIFO queue and manual/automatic court assignments
- Live courts at `/display`, weekly resets, match completion and rankings
- Admin login and setup

## Deployment
Use the existing Vercel and MongoDB environment variables. No database migration is performed. Historical tournament collections are left untouched, to avoid destructive data loss. The `/tournaments` page now returns 404 and tournament API endpoints return 404.

Run `npm install`, `npm test`, and `npm run build` before deploying. Confirm the deployment on a Vercel Preview URL first.
