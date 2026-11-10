# Kiangan Pickleball v6.6 — Mobile-first responsiveness update

Based on v6.5 Open Play-only.

- Mobile-first dashboard layout, sticky 3-tab navigation, larger touch controls, readable bulk player management.
- Admin dashboard displays sync state and offers manual refresh; background refresh every 10 seconds when focused, skipping while mutations are in progress.
- Live court board polls every 6 seconds while focused, aborts obsolete fetches when switching sessions or leaving the page, and prevents overlapping fetches.
- Reduced unnecessary offscreen rendering in courts, queues and rankings using CSS `content-visibility`.
- No changes to the database schema or API contracts. Open Play, vertical court nets, bulk deletion and weekly reset retained.

## Validation
- `npm test`: 4/4 passed.
- Dashboard and LiveDisplay TSX parsed successfully using TypeScript parser.
- `npm run build` **not verified**: required npm packages are not available in the local cache; dependency installation is blocked.

## Deployment
Deploy to a Vercel Preview first. Verify login, switching tabs/sessions, assigning and completing matches, bulk player deletion, and live view on a mobile device. Live data still relies on polling and server/database response time.
