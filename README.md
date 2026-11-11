# Kiangan Pickleball — v7.2

Self-service Open Play organizer (Next.js 14, MongoDB Atlas, Vercel). No admin account required.

## Pages

- `/` — Home, features, original poster, Android PWA install
- `/sessions` — My Sessions on this device
- `/create` — Create Open Play
- `/session/[id]` — Courts, players, settings, scores and next-match planning

## Setup

1. Upload project files to a GitHub repository.
2. Import it into Vercel as a Next.js project.
3. Set `MONGODB_URI` and `MONGODB_DB` environment variables.
4. Deploy and verify create, resume, assignment, replacement, planning, finish, reset and delete flows.

Session ownership keys live in browser localStorage. Clearing storage, using a different browser, or installing the PWA as a separate storage context may make sessions inaccessible. Existing `selfOpenPlaySessions` records are preserved; the new optional `nextMatches` field is backward-compatible.

## Development

```bash
npm install
npm test
npm run build
```

## Match management

- Replace a player on an active court using an available player. The replacement receives one game played, and the replaced player has their in-progress game count reversed.
- Plan four specific players for a court's next match, in left-team/right-team order. This plan is saved to MongoDB and takes priority over automatic assignment once the court is free.
- Reset clears plans, scores and game/win counts while keeping registered players.

Production build requires npm dependencies and was not verifiable in the artifact preparation environment.
