# v6 changes
- Reset/Clear archives completed matches and resets visible win/game rankings (history retained). Weekly reset uses the same archivedAt mechanism.
- Players management is its own admin tab, with edit name/skill/style.
- Guest join reuses existing player names, asks before preference changes. Note: name-based identification is not identity verification; consider PIN/OTP for public use.
- Display hides tournaments.

## Verification
Run npm install, npm run build, npm test before production deployment. Requires MongoDB transaction-capable cluster.
