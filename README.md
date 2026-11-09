# Pickleball Hub

A GitHub/Vercel-ready Next.js application for doubles Open Play queues and tournament administration. MongoDB Atlas is the persistent database.

## Quick start

1. Create a MongoDB Atlas cluster, database user and network access rule. Use the Atlas SRV connection string.
2. Copy `.env.example` to `.env.local`, set `MONGODB_URI`, `MONGODB_DB`, and a random `AUTH_SECRET` of at least 32 characters.
3. Run `npm install`, `npm run test`, then `npm run dev`.
4. Open http://localhost:3000/register. **The first registered user becomes admin**. Do this immediately before sharing the URL.
5. Create courts, add players, create an Open Play session, then check players in.

## GitHub + Vercel

1. Extract this ZIP and upload its **contents** to a new GitHub repository. Do not upload `.env.local`.
2. In Vercel, choose Add New Project > Import Git Repository.
3. Add `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET` under Project Settings > Environment Variables.
4. Deploy. The default Next.js build command is `npm run build`.
5. Visit `/register` and create the first admin immediately. Consider restricting initial public access until the admin exists.

MongoDB Atlas must allow network access from the Vercel runtime. Allowing all IP addresses is easy for a prototype but increases exposure; use strong database credentials and narrow access where practical. No mandatory paid realtime service is required; dashboards poll every 5 seconds.

## Supported prototype workflows

- Email/password account creation and login, first-user admin bootstrap, guest player creation.
- Create courts and Open Play sessions, join/rest/return/leave queues, manual assignment of four players to a court, enter scores, return players to queue.
- FIFO, four-player, basic winner-stays policy; random and rating-balanced teams.
- Create Round Robin, Single Elimination and experimental Double Elimination tournaments; register doubles teams, generate matches, assign courts and enter results.
- Read-only public court display shell, basic player/admin dashboards.

## Known limitations — read before live events

**This is a runnable prototype, NOT a production-complete competition system.**

- Persistent fixed partnerships are **not implemented**; the 'fixed' team setting currently pairs players by queue order and must not be relied on for fixed doubles.
- Single elimination byes and later-round advancement are incomplete for non-power-of-two team counts. Use powers of two only for initial testing; bracket propagation is not production-ready.
- Double elimination is **experimental**: losers-bracket byes, round sequencing and grand-final resets are not fully correct. Do not use it for official tournaments.
- Winner-stays uses an early queue timestamp for winners, without a maximum-win cap or strict fairness logic.
- No match cancellation, undo/correction, detailed audit trail, multi-game scoring, player invitations, or robust tournament standings/tiebreakers.
- No persistent partner invitations, skill verification, push notifications, QR check-in, dedicated live court TV rendering, or PWA offline support.
- No admin transfer/recovery flow, password reset, rate limiting, CSRF token mechanism, or production security audit. Treat the first-user admin bootstrap as a setup risk.
- API uses basic authentication and validation; several advanced policies and ownership constraints still need hardening.
- Real-time updates use polling rather than WebSockets. Vercel hosting requires internet access.
- Transactions require MongoDB Atlas replica set support (standard Atlas clusters provide this).
- Automated tests currently cover pure pairing/bracket/scoring helpers only; no integration or browser E2E tests.

## Routes

- `/` landing page
- `/register`, `/login` account access
- `/admin` organizer controls
- `/player` player controls
- `/display` public display shell
- `/api/v1/health` health endpoint
- `/api/v1/{auth,courts,players,sessions,matches,tournaments,display}` REST routes

## License

MIT — see LICENSE.
