import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const api=readFileSync('src/app/api/self/[[...path]]/route.ts','utf8');const ui=readFileSync('src/components/Organizer.tsx','utf8');
test('bulk registration is a single atomic session update',()=>{assert.match(api,/verb==='add-players'/);assert.match(api,/return update\(\{players:\[\.\.\.s\.players,\.\.\.additions\]\}\)/)});
test('bulk input validates duplicates and session capacity',()=>{assert.match(api,/new Set\(lower\)\.size/);assert.match(api,/existing\.has\(n\)/);assert.match(api,/s\.players\.length\+cleaned\.length>250/)});
test('organizer has single and multiline entry modes',()=>{assert.match(ui,/Multiple players/);assert.match(ui,/textarea rows=\{6\}/);assert.match(ui,/action\('add-players'/)});
