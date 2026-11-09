import test from 'node:test';import assert from 'node:assert/strict';import {teamsForFour,roundRobin,singleElimination,doubleElimination,nextDoubleRound,scoreValid} from '../src/lib/engine.mjs';
test('round robin count',()=>assert.equal(roundRobin(['a','b','c','d']).length,6));
test('single elimination handles byes',()=>{const r=singleElimination(['a','b','c']);assert.equal(r.length,2);assert.equal(r[0].length,2)});
test('double elimination initializes',()=>{const s=doubleElimination(['a','b','c','d']);assert.equal(nextDoubleRound(s).length,2)});
test('balanced pairing',()=>{const t=teamsForFour([{_id:'a',rating:5},{_id:'b',rating:1},{_id:'c',rating:4},{_id:'d',rating:2}],'balanced');assert.deepEqual(t,[['a','b'],['c','d']])});
test('scoring',()=>{assert.equal(scoreValid(11,9),true);assert.equal(scoreValid(11,10),false);assert.equal(scoreValid(12,10),true)});
