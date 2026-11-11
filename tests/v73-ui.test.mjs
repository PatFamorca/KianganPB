import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('rotation guidance appears in both forms',()=>{assert.match(read('src/components/CreateSession.tsx'),/Fair: players with fewer games/);assert.match(read('src/components/Organizer.tsx'),/Fair: fewest games first/)});
test('manual assignment remains and future planning removed',()=>{const t=read('src/components/Organizer.tsx');assert.match(t,/Manual assignment/);assert.doesNotMatch(t,/plan-next|clear-next|nextSelections/)});
