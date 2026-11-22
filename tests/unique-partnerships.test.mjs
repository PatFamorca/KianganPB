import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/components/SessionResults.tsx',import.meta.url),'utf8');
test('session overview displays unique partnerships instead of games with winners',()=>{
 assert.match(source,/Unique partnerships/);
 assert.doesNotMatch(source,/Games with winners/);
 assert.match(source,/new Set\(finished\.flatMap/);
 assert.match(source,/\[\.\.\.t\]\.sort\(\)/);
});
