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

## v7.3 UI changes

- Removed the redundant future-match planning controls and endpoints; manual court assignment remains.
- Active courts show **Final Scores** and a centered **Finish match** button.
- Both session creation and settings explain each rotation option.
- Existing MongoDB session data remains preserved; legacy planned lineups are ignored and cleared on the next session update.

## Bulk player entry

In a session, open **Players → Multiple players**, paste one name per line, choose the shared skill level and play style, then select **Add players**. Duplicate names and entries exceeding the 250-player session limit are rejected before saving. The single-player form is still available.
