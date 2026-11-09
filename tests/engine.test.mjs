import test from 'node:test';
import assert from 'node:assert/strict';
import {teamsForFour,scoreValid} from '../src/lib/engine.mjs';
test('balanced pairing',()=>{const t=teamsForFour([{_id:'a',rating:5},{_id:'b',rating:1},{_id:'c',rating:4},{_id:'d',rating:2}],'balanced');assert.deepEqual(t,[['a','b'],['c','d']])});
test('fixed pairing',()=>{const t=teamsForFour([{_id:'a'},{_id:'b'},{_id:'c'},{_id:'d'}],'fixed');assert.deepEqual(t,[['a','b'],['c','d']])});
test('reject duplicate players',()=>assert.throws(()=>teamsForFour([{_id:'a'},{_id:'a'},{_id:'c'},{_id:'d'}])));
test('scoring',()=>{assert.equal(scoreValid(11,9),true);assert.equal(scoreValid(11,10),false);assert.equal(scoreValid(12,10),true)});
