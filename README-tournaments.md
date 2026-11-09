# Tournament rebuild

Public `/tournaments`: guest registration (default doubles), team names, approval status, brackets, standings and champions. Admin `/admin/tournaments`: create events, approve/reject registrations, start matches and score games.

Categories: singles, doubles, mixed doubles (one male and one female as self-reported for event eligibility), and five-player teams. Team ties are five games (3 singles, 2 doubles), first to 3 game wins.

Formats: round robin, single elimination, and two-loss elimination (not a standard winners/losers double-elimination bracket). The two-loss mode pairs remaining teams each round and eliminates a team after two losses. Bracket ordering and byes are simplified; use preview and test before live events.

Tournament data uses new MongoDB collections `tournamentV2`, `tournamentEntriesV2`, `tournamentTiesV2`, keeping old tournament records intact. Old admin tournament controls remain for legacy events. Existing admin auth required for organizer.

Important: the public registration endpoint identifies participants by name only. It does not authenticate identity or securely prevent fraudulent registrations. No payment processing. Court assignment uses current court list. This release does not guarantee concurrency safety for two organizers starting matches simultaneously; test carefully.

Run `npm install`, `npm test`, `npm run build`. Set the existing MongoDB and auth environment variables.
