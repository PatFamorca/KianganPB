import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const api=readFileSync('src/app/api/self/[[...path]]/route.ts','utf8');
const ui=readFileSync('src/components/Organizer.tsx','utf8');
test('swap action requires players from opposing teams and active match',()=>{
 assert.match(api,/verb==='swap-teammates'/);
 assert.match(api,/m\.status==='playing'/);
 assert.match(api,/firstTeam===secondTeam/);
 assert.match(api,/return update\(\{matches:/);
});
test('organizer UI swaps teammates without adding a start match step',()=>{
 assert.match(ui,/Switch teammates/);
 assert.match(ui,/action\('swap-teammates'/);
 assert.match(ui,/swapFirst\.team===teamIndex/);
 assert.match(ui,/Finish match/);
 assert.doesNotMatch(ui,/>Start Match</);
});
