import React from 'react';

type Player={id:string,name:string,plays:number,wins:number};
type Match={id:string,status:string,teams:[string[],string[]],score?:[number,number],winnerTeam?:0|1,createdAt?:number};
type Props={players:Player[],matches:Match[],onReopen?:()=>void,busy?:boolean};

/** Match history is authoritative for streaks. Unscored games count as games, but not wins or losses. */
export function calculateSessionStats(players:Player[],matches:Match[]){
 const finished=matches.filter(m=>m.status==='finished');
 const streaks=new Map<string,{current:number,best:number}>();
 for(const p of players)streaks.set(p.id,{current:0,best:0});
 for(const m of [...finished].sort((a,b)=>(a.createdAt??0)-(b.createdAt??0))){
  if(m.winnerTeam!==0&&m.winnerTeam!==1&&(!m.score||m.score[0]===m.score[1]))continue;
  const winning=m.teams[m.winnerTeam===0||m.winnerTeam===1?m.winnerTeam:m.score![0]>m.score![1]?0:1];
  for(const id of m.teams.flat()){
   const st=streaks.get(id);if(!st)continue;
   st.current=winning.includes(id)?st.current+1:0;
   st.best=Math.max(st.best,st.current);
  }
 }
 const uniquePartnerships=new Set(finished.flatMap(m=>m.teams.filter(t=>t.length===2).map(t=>[...t].sort().join("::")))).size;
 const participants=players.filter(p=>p.plays>0);
 const rate=(p:Player)=>p.plays?p.wins/p.plays:0;
 // Head-to-head counts only completed games with a winner, where the two players opposed each other.
 const headToHead=(a:Player,b:Player)=>{
  let aw=0,bw=0;
  for(const m of finished){
   const ai=m.teams.findIndex(t=>t.includes(a.id));
   const bi=m.teams.findIndex(t=>t.includes(b.id));
   if(ai<0||bi<0||ai===bi)continue;
   const winner=m.winnerTeam===0||m.winnerTeam===1?m.winnerTeam:m.score&&m.score[0]!==m.score[1]?(m.score[0]>m.score[1]?0:1):null;
   if(winner===null)continue;
   if(winner===ai)aw++;else bw++;
  }
  return aw-bw;
 };
 // For more than two tied leaders, compare their head-to-head win/loss differential
 // against all other tied leaders; this avoids a non-transitive pairwise sort.
 const headToHeadDifferential=(p:Player,peers:Player[])=>peers.reduce((n,q)=>n+(q.id===p.id?0:headToHead(p,q)),0);
 const ranked=[...participants].sort((a,b)=>b.wins-a.wins||rate(b)-rate(a)||b.plays-a.plays||a.name.localeCompare(b.name));
 const mostWins=Math.max(0,...participants.map(p=>p.wins));
 const leaders=participants.filter(p=>p.wins===mostWins);
 const h2hScores=new Map(leaders.map(p=>[p.id,headToHeadDifferential(p,leaders)]));
 const mvpCandidates=[...leaders].sort((a,b)=>(h2hScores.get(b.id)??0)-(h2hScores.get(a.id)??0)||(streaks.get(b.id)?.best??0)-(streaks.get(a.id)?.best??0)||rate(b)-rate(a));
 const best=mvpCandidates[0];
 const mvps=best?mvpCandidates.filter(p=>(h2hScores.get(p.id)??0)===(h2hScores.get(best.id)??0)&&(streaks.get(p.id)?.best??0)===(streaks.get(best.id)?.best??0)&&Math.abs(rate(p)-rate(best))<1e-10):[];
 const mvpIds=new Set(mvps.map(p=>p.id));
 const finalRanked=[...mvpCandidates,...participants.filter(p=>p.wins!==mostWins).sort((a,b)=>b.wins-a.wins||rate(b)-rate(a)-rate(b)||a.name.localeCompare(b.name))];
 const byRate=[...participants].sort((a,b)=>rate(b)-rate(a)||b.wins-a.wins||a.name.localeCompare(b.name));
 const byGames=[...participants].sort((a,b)=>b.plays-a.plays||b.wins-a.wins||a.name.localeCompare(b.name));
 const byStreak=[...participants].sort((a,b)=>(streaks.get(b.id)?.best??0)-(streaks.get(a.id)?.best??0)||b.wins-a.wins||a.name.localeCompare(b.name));
 return {finished,uniquePartnerships,participants,ranked:finalRanked,mvp:mvps[0],mvps,mvpIds,headToHead,bestRate:byRate[0],mostGames:byGames[0],longestStreak:byStreak[0],streaks,rate};
}
export default function SessionResults({players,matches,onReopen,busy}:Props){
 const s=calculateSessionStats(players,matches);const pct=(p:Player)=>Math.round(s.rate(p)*100);
 return <section className="self-panel self-results" aria-label="Final session results">
  <div className="self-results-heading"><span className="self-results-eyebrow">🏁 Open Play complete</span><h2>Session Results</h2><p className="self-muted">Final standings and highlights</p></div>
  <div className="self-results-overview"><div><strong>{s.finished.length}</strong><span>Games completed</span></div><div><strong>{s.participants.length}</strong><span>Players played</span></div><div><strong>{s.uniquePartnerships}</strong><span>Unique partnerships</span></div></div>
  {s.mvp?<><div className="self-mvp"><span className="self-mvp-crown">🏆</span><span className="self-mvp-label">MOST VALUABLE PLAYER</span><h3>{s.mvps.map(p=>p.name).join(" & ")}</h3>{s.mvps.length>1&&<span className="self-mvp-label">CO-MVPs</span>}<div className="self-mvp-stats"><span><strong>{s.mvp.wins}</strong> Wins</span><span><strong>{s.mvp.plays}</strong> Games</span><span><strong>{pct(s.mvp)}%</strong> Win rate</span><span><strong>{s.streaks.get(s.mvp.id)?.best??0}</strong> Best streak</span></div></div>
  <div className="self-results-awards"><div><span>🎯 Best win rate</span><strong>{s.bestRate?.name}</strong><small>{pct(s.bestRate!)}% · {s.bestRate?.wins} wins / {s.bestRate?.plays} games</small></div><div><span>🏓 Most games played</span><strong>{s.mostGames?.name}</strong><small>{s.mostGames?.plays} games</small></div><div><span>🔥 Longest win streak</span><strong>{s.longestStreak?.name}</strong><small>{s.streaks.get(s.longestStreak!.id)?.best??0} consecutive wins</small></div></div>
  <div className="self-results-table-heading"><h3>Player statistics</h3><span>{s.ranked.length} players</span></div>
  <div className="self-results-table-wrap"><table className="self-results-table"><thead><tr><th>#</th><th>Player</th><th>Wins</th><th>Games</th><th>Win %</th><th>Streak</th></tr></thead><tbody>{s.ranked.map((p,i)=><tr key={p.id}><td>{i+1}</td><td><strong>{p.name}</strong>{s.mvpIds.has(p.id)&&<span className="self-mvp-mini"> MVP</span>}</td><td>{p.wins}</td><td>{p.plays}</td><td>{pct(p)}%</td><td>{s.streaks.get(p.id)?.best??0}</td></tr>)}</tbody></table></div></>:<p className="self-muted">No games were played in this session.</p>}
  <p className="self-results-note">Win rate uses all games played, including games ended without scores. Unscored games do not award wins or change win streaks. MVP: most wins, then head-to-head differential against tied leaders, longest win streak, then win rate. Exact ties share Co-MVP honors.</p>
  {onReopen&&<button className="self-outline" disabled={busy} onClick={onReopen}>Reopen session</button>}
 </section>;
}
