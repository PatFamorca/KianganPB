import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const player=readFileSync('src/components/PlayerSession.tsx','utf8');
test('player session heading mirrors organizer metadata',()=>{
 assert.match(player,/className="self-heading self-player-heading"/);
 assert.match(player,/\{s\.players\.length\} players · \{s\.courts\} courts · \{s\.rotation\} rotation/);
});
test('waiting players reuse organizer chips and game count ordering',()=>{
 assert.match(player,/Waiting players \(\{waiting\.length\}\)/);
 assert.match(player,/className="self-chips"/);
 assert.match(player,/\[\.\.\.waiting\]\.sort\(\(a,b\)=>a\.plays-b\.plays\)/);
});
