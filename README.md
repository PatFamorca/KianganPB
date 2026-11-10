# Kiangan Pickleball v7.1 — Mobile UI Refresh

Self-service Open Play organizer for Next.js, MongoDB Atlas and Vercel. No admin accounts. This update improves contrast on white panels, restores the original poster-based homepage with Create Open Play / My Sessions / Install App actions, and compacts mobile organizer layouts.

## Deploy

1. Upload this project's contents to a GitHub repository.
2. Import the repository as a Next.js project in Vercel.
3. Configure `MONGODB_URI` and `MONGODB_DB` in Vercel environment variables.
4. Deploy and check Create Open Play, adding players, court assignments, scoring, saved sessions and PWA install on an Android device.

Sessions use the `selfOpenPlaySessions` collection; existing database collections are not migrated or deleted. Device ownership keys are saved in browser localStorage. Browser and installed PWA storage may differ; clearing storage can lose access to sessions.

Run `npm install`, `npm test`, and `npm run build` locally before deploying. Do not upload `.env.local` or `node_modules`.
