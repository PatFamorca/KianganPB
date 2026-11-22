import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const view=readFileSync('src/components/SessionResults.tsx','utf8');
const css=readFileSync('src/app/globals.css','utf8');
test('compact mobile leaderboard supports search, sorting, expansion and MVP',()=>{
 for(const marker of ['self-results-compact','self-results-filters','Search player','Most wins','Win rate','Most games','Win streak','Show all','self-mvp-mini'])assert.ok(view.includes(marker),marker);
});
test('desktop table and responsive compact leaderboard',()=>{
 assert.match(view,/self-results-table-wrap/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/\.self-results-compact\{display:block/);
});
