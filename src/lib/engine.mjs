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
export function scoreValid(a,b,target=11,winBy=2){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&Math.max(a,b)>=target&&Math.abs(a-b)>=winBy&&a!==b;}
