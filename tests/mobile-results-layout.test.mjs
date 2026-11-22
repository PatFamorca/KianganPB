import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const view=readFileSync('src/components/SessionResults.tsx','utf8');
const css=readFileSync('src/app/globals.css','utf8');
test('mobile result cards expose each stat and MVP status',()=>{
 assert.match(view,/self-results-mobile-list/);
 for(const label of ['Wins','Games','Win rate','Best streak'])assert.ok(view.includes(label));
 assert.match(view,/self-results-player-mvp/);
});
test('desktop table is retained and hidden only on small screens',()=>{
 assert.match(view,/self-results-table-wrap/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/\.self-results-table-wrap\{display:none\}/);
 assert.match(css,/\.self-results-mobile-list\{display:grid/);
});
