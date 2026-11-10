# Kiangan Pickleball v4 patch

- Player Delete now removes active waiting/resting queue memberships before soft-deleting the player. Players in an active match cannot be deleted until that match finishes.
- Open Play Reset / Clear removes active queue entries, clears guest name claims so guests can rejoin, and archives past session matches (not player profiles or historical match data). Active matches must finish first.
- Public header and homepage no longer link to admin. `/admin/login` and `/admin` still exist and remain protected; obscuring a link is not a security boundary.
- Requires MongoDB transactions (replica set, as provided by Atlas).
- No production build run; deploy and verify on Vercel.
