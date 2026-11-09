# Kiangan Pickleball v5

## Weekly reset

- Cron: daily at **16:00 UTC**, corresponding to **00:00 Asia/Manila** the next day. Only resets when a new Manila Monday week is due. Running daily also retries sessions that were busy during Monday reset.
- Set **CRON_SECRET** (random 32+ character secret) in Vercel Environment Variables. Vercel supplies it as a bearer token to cron requests.
- Sessions created this week are left intact until the following Monday. Existing sessions reset on the first scheduled run in a newer week.
- Every session defaults to `weeklyResetEnabled: true`; setting it to false in MongoDB opts that session out.
- Active matches prevent reset for that session; the daily cron retries after matches finish. Match history is archived, not deleted. Player profiles are retained.
- MongoDB transaction and `lastResetWeek` guard prevent duplicate weekly resets. MongoDB Atlas replica set/transaction support is required.
- For reliable exact-midnight execution on Vercel Hobby, note that cron delivery may be delayed; the job is idempotent.

## Open Play queue

- Guests choose beginner/intermediate/advanced and chill/challenge.
- FIFO + preferences **never skips the oldest player**. It seeks 3 compatible players (same style and skill, then adjacent skill), falling back to earliest arrivals so the pool does not stall.
- Team balancing uses the guest's selected skill level.
- Court tiles and pool show live status and players.

## Deploy

Replace repository contents with this ZIP's contents, set `CRON_SECRET` in Vercel, and redeploy. No migration needed for existing sessions. Test on a non-production session first.
