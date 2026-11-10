import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);const read=p=>readFileSync(new URL(p,root),'utf8');
test('new isolated collection and device secret verification',()=>{const src=read('src/app/api/self/[[...path]]/route.ts');assert.match(src,/selfOpenPlaySessions/);assert.match(src,/ownerHash:hash\(secret\)/);assert.match(src,/x-device-key/)});
test('core organizer operations present',()=>{const src=read('src/app/api/self/[[...path]]/route.ts');for(const op of ['create','add-player','remove-player','assign','finish','reset','delete','settings'])assert.ok(src.includes("'"+op+"'"),op)});
test('mobile install assets preserved',()=>{for(const f of ['public/sw.js','public/manifest.webmanifest','public/icon-192.png','public/icon-512.png'])assert.ok(existsSync(new URL(f,root)),f)});
test('legacy admin and tournament routes removed',()=>{for(const f of ['src/app/admin','src/app/tournaments','src/app/api/v1'])assert.equal(existsSync(new URL(f,root)),false,f)});
