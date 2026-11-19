import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src/components/PlayerSession.tsx',import.meta.url),'utf8');
test('player court visualization uses organizer court grid and vertical net',()=>{
  for(const cls of ['self-court-grid','self-court','self-team','self-net','self-court-player']) assert.ok(src.includes(`className="${cls}"`),`Missing ${cls}`);
  assert.ok(src.includes('match.teams[0].map'));
  assert.ok(src.includes('match.teams[1].map'));
  assert.ok(src.includes('p.skill} · {p.style'));
  assert.ok(!src.includes('self-player-teams'));
});
