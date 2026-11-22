import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const organizer=readFileSync('src/components/Organizer.tsx','utf8');
const player=readFileSync('src/components/PlayerSession.tsx','utf8');
const results=readFileSync('src/components/SessionResults.tsx','utf8');
test('organizer ended-session branch precedes normal dashboard',()=>{
 assert.ok(organizer.indexOf('if(s.endedAt)return')<organizer.indexOf('return <div className="self-organizer"><div className="self-heading"'));
 assert.match(organizer,/onDelete=\{\(\)=>\{if\(confirm/);
});
test('player live sections hidden after ending',()=>assert.match(player,/\{!s\.endedAt&&<>\s*<section className="self-panel"><div className="self-player-section-heading"><h2>Live courts/));
test('delete directly follows reopen in results',()=>{
 assert.ok(results.indexOf('{onReopen&&')<results.indexOf('{onDelete&&'));
});
