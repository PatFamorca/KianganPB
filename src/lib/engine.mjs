// Pure deterministic match logic; server handles persistence and concurrency.
export function teamsForFour(players,mode='random'){
 if(players.length!==4||new Set(players.map(p=>String(p._id))).size!==4)throw Error('Exactly four unique players required');
 const p=[...players];
 if(mode==='balanced'){
  const choices=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]];
  const score=([a,b])=>Number(p[a].rating||3)+Number(p[b].rating||3);
  choices.sort((x,y)=>Math.abs(score(x[0])-score(x[1]))-Math.abs(score(y[0])-score(y[1])));
  return choices[0].map(pair=>pair.map(i=>String(p[i]._id)));
 }
 if(mode==='random')for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
 return [[String(p[0]._id),String(p[1]._id)],[String(p[2]._id),String(p[3]._id)]];
}
export function roundRobin(ids){const matches=[];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)matches.push({a:ids[i],b:ids[j],round:null});return matches;}
export function singleElimination(ids){if(ids.length<2)throw Error('At least two teams required');const size=2**Math.ceil(Math.log2(ids.length));const rounds=[];let current=Array.from({length:size},(_,i)=>ids[i]||null);while(current.length>1){const round=[];for(let i=0;i<current.length;i+=2)round.push({a:current[i],b:current[i+1],winner:null});rounds.push(round);current=Array.from({length:current.length/2},()=>null);}return rounds;}
export function doubleElimination(ids){if(ids.length<2)throw Error('At least two teams required');return {format:'double',entries:[...ids],losses:Object.fromEntries(ids.map(x=>[x,0])),round:0,history:[],champion:null,resetRequired:false};}
export function nextDoubleRound(state){if(state.champion)return [];
 const live=state.entries.filter(x=>state.losses[x]<2);
 if(live.length<=1)return [];
 const winners=live.filter(x=>state.losses[x]===0),losers=live.filter(x=>state.losses[x]===1);
 if(winners.length===1&&losers.length===1)return [{a:winners[0],b:losers[0],final:true}];
 const out=[];
 for(const group of [winners,losers])for(let i=0;i+1<group.length;i+=2)out.push({a:group[i],b:group[i+1],final:false});
 return out;
}
export function scoreValid(a,b,target=11,winBy=2){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&Math.max(a,b)>=target&&Math.abs(a-b)>=winBy&&a!==b;}
