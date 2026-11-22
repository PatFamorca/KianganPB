import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/components/Organizer.tsx',import.meta.url),'utf8');
test('swap controls precede court visualization',()=>{assert.ok(source.indexOf('className="self-swap-controls"')<source.indexOf('className="self-court self-selectable-court"'))});
test('normal winner mode uses whole team button and swap mode uses player buttons',()=>{assert.match(source,/swapMode===match\.id\?<div key=\{teamIndex\}/);assert.match(source,/self-team-winner-button/);assert.match(source,/className=\{'self-swap-player'/)});
