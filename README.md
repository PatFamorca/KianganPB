# Kiangan Pickleball

Mobile-first Open Play management website built with Next.js 14 and MongoDB.

## Setup

1. Install dependencies: `npm install`
2. Configure environment variables using `.env.example`.
3. Start locally: `npm run dev`
4. Validate: `npm test` and `npm run build`

## Pages

- `/` — Home
- `/open-play` — Guest Open Play registration
- `/display` — Live courts and rankings
- `/admin` — Organizer dashboard (Open Play, Courts, Players)
- `/admin/login` — Admin sign-in

The admin account and logout controls appear compactly in the site footer on admin pages.

## Installable Android PWA

Deploy to an HTTPS domain (Vercel is suitable). On Android, open the website in Chrome, choose the three-dot menu, then **Install app** or **Add to Home screen**. The installed app opens in standalone mode. No Play Store or APK is required.

The service worker caches only app icons, offline fallback, poster, and versioned Next.js static assets. It **does not cache API requests, login/admin pages, or live court data**. Internet connectivity is required for registration, scoring, and live courts.

For updates, deploy the website normally; service worker cache is versioned in `public/sw.js`. To invalidate static cache explicitly, increment `VERSION`.

Run `npm test` and `npm run build` before production deployment.
