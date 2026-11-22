import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
test('organizer can finish games without scores',()=>{const api=read('src/app/api/self/[[...path]]/route.ts');const ui=read('src/components/Organizer.tsx');assert.match(api,/finish-no-score/);assert.match(ui,/finish-no-score/)});
test('shared results page highlights MVP and awards',()=>{const ui=read('src/components/SessionResults.tsx');for(const word of ['self-mvp','Best win rate','Most games played','Longest win streak','Player statistics'])assert.ok(ui.includes(word))});
test('streaks use completed scored matches, with unscored games ignored',()=>{const ui=read('src/components/SessionResults.tsx');assert.match(ui,/m\.status==='finished'/);assert.match(ui,/!m\.score/);assert.match(ui,/st\.current=winning\.includes\(id\)/)});
