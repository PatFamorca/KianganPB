# Kiangan Pickleball v6.1 — Poster Home

- Homepage displays the supplied Open Play poster at its full aspect ratio, without cropping, and adds mobile-friendly links to Open Play, Live Courts, and Tournaments.
- Carries forward v6 player editing, returning-player preference confirmation, session Reset/Clear (archives completed matches, resets current leaderboard and queue), and tournament-free /display.
- Changes winner ranking label to **Current session** to reflect Reset/Clear behavior.
- No MongoDB migration or new environment variable required.

## Deployment / validation
Run `npm install`, `npm test`, `npm run build` with Node 20+ and existing Vercel environment variables. Preview-test reset and returning-player updates against a non-production database before release.
