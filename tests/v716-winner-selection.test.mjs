import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const ui=readFileSync('src/components/Organizer.tsx','utf8');const api=readFileSync('src/app/api/self/[[...path]]/route.ts','utf8');const results=readFileSync('src/components/SessionResults.tsx','utf8');
test('court teams themselves select winner with accessible pressed state',()=>{assert.match(ui,/self-team-choice/);assert.match(ui,/aria-pressed=/);assert.match(ui,/setWinners/);assert.match(ui,/Finish match/);assert.doesNotMatch(ui,/Final Scores|Finish match with scores/)});
test('finish requires winning team and awards wins to the chosen team',()=>{assert.match(api,/winnerTeam!==0&&winnerTeam!==1/);assert.match(api,/match.teams\[winnerTeam\]/);assert.match(api,/wins:p.wins\+1/)});
test('session results use winnerTeam while supporting historical scores',()=>{assert.match(results,/m.winnerTeam===0\|\|m.winnerTeam===1/);assert.match(results,/m.score/)});
