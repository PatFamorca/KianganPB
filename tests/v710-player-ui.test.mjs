import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/components/PlayerSession.tsx',import.meta.url),'utf8');
test('player link uses organizer court layout and net',()=>{for(const cls of ['self-organizer','self-court-grid','self-court','self-net','self-team','self-court-player'])assert.ok(source.includes(cls),cls)});
test('player registration and read-only queue and leaderboard remain',()=>{for(const s of ["'/join'",'Join Open Play','Waiting players','Leaderboard','registrationOpen'])assert.ok(source.includes(s),s);assert.ok(!source.includes("action('finish'"))});
