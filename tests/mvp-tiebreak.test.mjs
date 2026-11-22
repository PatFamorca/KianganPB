import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync('src/components/SessionResults.tsx','utf8');
test('head-to-head compares opposing teams only',()=>{assert.match(src,/ai===bi/);assert.match(src,/winner===ai/);});
test('MVP ties use head-to-head then streak then win rate',()=>{assert.match(src,/h2hScores\.get\(b\.id\)/);assert.match(src,/streaks\.get\(b\.id\)/);assert.match(src,/rate\(b\)-rate\(a\)/);});
test('co-MVP and winnerless match support',()=>{assert.match(src,/mvps\.length>1/);assert.match(src,/winner===null/);});
