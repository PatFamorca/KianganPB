import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const root=new URL('../',import.meta.url);const read=p=>fs.readFileSync(new URL(p,root),'utf8');
test('homepage and saved sessions are distinct routes',()=>{assert.match(read('src/app/page.tsx'),/href="\/sessions"/);assert.doesNotMatch(read('src/app/page.tsx'),/<MySessions\s*\/>/);assert.match(read('src/app/sessions/page.tsx'),/<MySessions\s*\/>/)});
test('score label and live replacement UI exist',()=>{const src=read('src/components/Organizer.tsx');assert.match(src,/>Score<\/h3>/);assert.match(src,/replace-player/);assert.match(src,/plan-next/);assert.match(src,/clear-next/)});
test('server validates player replacement and planned lineups',()=>{const src=read('src/app/api/self/[[...path]]/route.ts');assert.match(src,/verb==='replace-player'/);assert.match(src,/verb==='plan-next'/);assert.match(src,/new Set\(ids\)\.size!==4/);assert.match(src,/nextMatches:/)});
