import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const api=readFileSync('src/app/api/self/[[...path]]/route.ts','utf8');const ui=readFileSync('src/components/Organizer.tsx','utf8');
test('scoreless finish checks ownership through existing route and ends only active match',()=>{assert.match(api,/verb==='finish-no-score'/);assert.match(api,/m.id===body.matchId&&m.status==='playing'/);assert.match(api,/status:'finished' as const/)});
test('organizer chooses winner without entering scores',()=>{assert.match(ui,/self-team-choice/);assert.match(ui,/aria-pressed/);assert.match(ui,/winnerTeam/);assert.doesNotMatch(ui,/Finish match with scores/);assert.doesNotMatch(ui,/Final Scores/);assert.match(api,/winnerTeam!==0&&winnerTeam!==1/)});
