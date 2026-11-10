# v6.4 Performance improvements

- Live display fetches court/session metadata at most once per minute, while fetching selected session state every four seconds. Refreshes do not overlap and pause in hidden tabs.
- Admin dashboard refreshes session detail every six seconds, while full metadata loads every 45 seconds or after a mutation. Mutations no longer wait for follow-up GETs before buttons unlock.
- Guest registration no longer downloads session detail or court data that the page does not render; the session list refreshes once a minute.
- Added MongoDB indexes for queue and match reads. New indexes will be created by the existing `indexes()` call; they are not guaranteed to exist immediately after deployment.

## Limitations
- This is polling optimization, not WebSockets. MongoDB latency and serverless cold starts can still cause delay.
- The full Next.js build must pass before deploying to production.
