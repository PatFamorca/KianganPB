# Kiangan Pickleball v5 — mobile admin update

- Open Play and Tournaments are separate tabs in the admin dashboard; tournament creation lives with tournament management.
- Open Play court tiles show match completion and score inputs immediately above the corresponding court visualization.
- Assign Next Four now automatically chooses the first enabled, unoccupied court belonging to the selected session, checking all currently playing matches (including tournaments). If no eligible court is free, the API responds with `No court available`.
- A unique partial MongoDB index on active court assignments prevents two concurrent active matches from claiming the same court once the index is created. The index is created by the existing `indexes()` initialization when adding a court.
- Footer contains the only public Admin navigation link.

## Verification
- `npm test`: 5 tests passed.
- All source TS/TSX files parsed successfully using the TypeScript compiler parser.
- Full `npm run build` **not run**: dependencies cannot be installed because registry.npmjs.org is inaccessible in this environment. This release is not production-build-verified.

Deploy to Vercel Preview first. Check existing database for multiple playing matches assigned to the same court before adding a court, as this would prevent the new unique index from being created.
