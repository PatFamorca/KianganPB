import test from 'node:test';import assert from 'node:assert/strict';import {validateRoster,roundPairs,seedPairs,scoreOk,matchGames,winsNeeded,standings} from '../src/lib/tournament-engine.mjs';
test('doubles roster requires two distinct names',()=>{assert.equal(validateRoster('doubles',['A','B']),true);assert.equal(validateRoster('doubles',['A','a']),false)});
test('five player roster validation',()=>{assert.equal(validateRoster('team',['A','B','C','D','E']),true);assert.equal(validateRoster('team',['A','B']),false)});
test('round robin produces every pairing',()=>assert.equal(roundPairs(['a','b','c','d']).length,6));
test('bracket handles byes',()=>{const pairs=seedPairs(['a','b','c']);assert.equal(pairs.length,2);assert.equal(pairs.flat().filter(Boolean).length,3)});
test('win by two',()=>{assert.equal(scoreOk(11,9),true);assert.equal(scoreOk(11,10),false);assert.equal(scoreOk(13,11),true)});
test('team tie needs three wins',()=>{assert.equal(matchGames('team').length,5);assert.equal(winsNeeded('team'),3)});
test('standings count completed games',()=>{const entries=[{_id:'a',teamName:'A'},{_id:'b',teamName:'B'}];const ties=[{a:'a',b:'b',status:'completed',winner:0,games:[{status:'completed',scoreA:11,scoreB:7}]}];const rows=standings(entries,ties);assert.equal(rows[0].name,'A');assert.equal(rows[0].wins,1);assert.equal(rows[0].pointsFor,11)});
