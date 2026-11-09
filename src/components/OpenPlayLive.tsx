'use client';
import {useState} from 'react';
type Props={detail:any;courts:any[];admin?:boolean;busy?:boolean;onComplete?:(matchId:string,a:number,b:number)=>void};
const id=(value:any)=>String(value?._id||value||'');
export default function OpenPlayLive({detail,courts,admin=false,busy=false,onComplete}:Props){
 const [scores,setScores]=useState<Record<string,{a:string;b:string}>>({});
 const names=new Map<string,string>((detail?.playerNames||[]).map((p:any)=>[id(p),String(p.name)]));
 const pname=(value:any)=>names.get(id(value))||'Player '+id(value).slice(-5);
 const active=(detail?.matches||[]).filter((m:any)=>m.status==='playing');
 const waiting=(detail?.queue||[]).filter((q:any)=>q.status==='waiting');
 const rankings=(detail?.leaderboard||[]) as {playerId:string;wins:number;games:number}[];
 const relevant=courts.filter(c=>(detail?.session?.courtIds||[]).some((x:any)=>id(x)===id(c)));
 return <div className="live-section">
  <div className="live-section-heading"><h3>Live courts</h3><span className="pill">{active.length} playing · {relevant.filter(c=>c.enabled).length} enabled courts</span></div>
  <div className="court-board">{relevant.map(c=>{const match=active.find((m:any)=>id(m.courtId)===id(c));const key=match?id(match):'';const score=scores[key]||{a:'11',b:'7'};return <article className="court-tile" key={id(c)}><div className="court-tile-header"><strong>{c.name}</strong><span className="pill">{match?'Playing':c.enabled?'Available':'Closed'}</span></div>
   {match&&admin&&onComplete&&<div className="court-score-panel"><strong>Match result</strong><div className="court-score-actions"><label>Team 1<input aria-label={c.name+' team 1 score'} type="number" min="0" value={score.a} onChange={e=>setScores(prev=>({...prev,[key]:{...score,a:e.target.value}}))}/></label><label>Team 2<input aria-label={c.name+' team 2 score'} type="number" min="0" value={score.b} onChange={e=>setScores(prev=>({...prev,[key]:{...score,b:e.target.value}}))}/></label><button disabled={busy||score.a===''||score.b===''} onClick={()=>onComplete(key,Number(score.a),Number(score.b))}>Complete match</button></div></div>}
   <div className="court-surface">{match?<><div className="court-side">{(match.teams?.[0]||[]).map(pname).join(' + ')}</div><div className="court-net">NET</div><div className="court-side">{(match.teams?.[1]||[]).map(pname).join(' + ')}</div></>:<div className="court-empty">{c.enabled?'Available for next match':'Court closed'}</div>}</div></article>})}{!relevant.length&&<p>No courts assigned to this session.</p>}</div>
  <div className="live-lower-grid"><section className="live-subsection"><div className="live-section-heading"><h3>Waiting queue</h3><span className="pill">{waiting.length} players</span></div><div className="queue-list">{waiting.map((q:any,i:number)=><div className="queue-entry" key={id(q)}><span className="queue-position">{i+1}</span><div className="queue-person"><strong>{pname(q.playerId)}</strong><small>{q.gamesPlayed||0} games played</small></div><div className="queue-tags"><span>{q.skillLevel||'Beginner'}</span><span>{q.playStyle||'Chill'}</span></div></div>)}{!waiting.length&&<p className="empty-message">No players waiting. Join the queue to get started.</p>}</div></section>
  <section className="live-subsection"><div className="live-section-heading"><h3>Winner rankings</h3><span className="pill">Current session</span></div><div className="ranking-list">{rankings.map((p,i)=><div className="ranking-entry" key={p.playerId}><span className="rank-position">{i+1}</span><strong>{pname(p.playerId)}</strong><span className="rank-wins">{p.wins} wins</span><small>{p.games} games</small></div>)}{!rankings.length&&<p className="empty-message">Rankings appear after matches are completed.</p>}</div></section></div>
 </div>;
}
