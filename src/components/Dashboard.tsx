'use client';
import OpenPlayLive from './OpenPlayLive';import {useEffect,useState,useCallback,useRef} from 'react';
const api=async(path:string,method='GET',data?:any)=>{const r=await fetch('/api/v1/'+path,{method,headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined,cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Request failed');return j};
const id=(x:any)=>String(x?._id||x||'');
export default function Dashboard({admin=false,display=false}:{admin?:boolean;display?:boolean}){
 const [me,setMe]=useState<any>(null),[courts,setCourts]=useState<any[]>([]),[players,setPlayers]=useState<any[]>([]),[sessions,setSessions]=useState<any[]>([]),[selected,setSelected]=useState(''),[detail,setDetail]=useState<any>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [refreshing,setRefreshing]=useState(false);
 const [lastUpdated,setLastUpdated]=useState<number|null>(null);
 const [showManualAssignment,setShowManualAssignment]=useState(false);
 const [manualCourt,setManualCourt]=useState('');
 const [manualPlayers,setManualPlayers]=useState<string[]>(['','','','']);
 const [adminTab,setAdminTab]=useState<'open'|'courts'|'players'>('open');
 const [selectedPlayers,setSelectedPlayers]=useState<string[]>([]);
 const [bulkDeleting,setBulkDeleting]=useState(false);
 const [playerSearch,setPlayerSearch]=useState(''); const [editingPlayer,setEditingPlayer]=useState<any>(null); const [editName,setEditName]=useState(''),[editSkill,setEditSkill]=useState('beginner'),[editStyle,setEditStyle]=useState('chill');
 const [courtName,setCourtName]=useState(''),[sessionName,setSessionName]=useState(''),[guestName,setGuestName]=useState(''),[p1,setP1]=useState(''),[scores,setScores]=useState<Record<string,{a:string;b:string}>>({});
 const scoreFor=(matchId:string)=>scores[matchId]||{a:'11',b:'7'};
 const setMatchScore=(matchId:string,side:'a'|'b',value:string)=>setScores(prev=>({...prev,[matchId]:{...(prev[matchId]||{a:'11',b:'7'}),[side]:value}}));
 const pname=(x:any)=>players.find(p=>id(p)===id(x))?.name||detail?.playerNames?.find((p:any)=>id(p)===id(x))?.name||String(x).slice(-6);
 const refreshInFlight=useRef(false);
 const pendingRefresh=useRef(false);
 const refreshAgain=useRef<()=>void>(()=>{});
 const lastMeta=useRef(0);
 const mounted=useRef(true);
 const busyRef=useRef(false);busyRef.current=busy||bulkDeleting;
 const refreshToken=useRef(0);
 const selectedRef=useRef(selected);selectedRef.current=selected;
 const refresh=useCallback(async(full=false)=>{
  if(refreshInFlight.current){pendingRefresh.current=true;return;}
  refreshInFlight.current=true;setRefreshing(true);
  const token=++refreshToken.current;
  try{
   const current=selectedRef.current;
   const fetchMeta=full||!lastMeta.current||Date.now()-lastMeta.current>45000;
   const [metadata,sessionDetail]=await Promise.all([
    fetchMeta?Promise.all([api('auth/me'),api('courts'),api('players').catch(()=>[]),api('sessions')]):Promise.resolve(null),
    current?api('sessions/'+current):Promise.resolve(null)
   ]);
   if(!mounted.current||token!==refreshToken.current)return;
   if(metadata){const [m,c,p,s]=metadata;setMe(m.user);setCourts(c);setPlayers(p);setSessions(s);lastMeta.current=Date.now();if(current&&!s.some((x:any)=>id(x)===current))setDetail(null)}
   if(current===selectedRef.current&&sessionDetail)setDetail(sessionDetail);
   setLastUpdated(Date.now());setError('');
  }catch(e:any){if(mounted.current)setError(e.message)}finally{refreshInFlight.current=false;if(mounted.current)setRefreshing(false);if(pendingRefresh.current&&mounted.current){pendingRefresh.current=false;setTimeout(()=>refreshAgain.current(),0)}}
 },[]);
 refreshAgain.current=()=>{void refresh()};
 useEffect(()=>{mounted.current=true;void refresh(true);const timer=setInterval(()=>{if(!document.hidden&&document.hasFocus()&&!busyRef.current)void refresh()},10000);const focus=()=>{if(!document.hidden)void refresh()};window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus);return()=>{mounted.current=false;clearInterval(timer);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus)}},[refresh]);
 useEffect(()=>{if(selected)void refresh()},[selected,refresh]);
 async function act(path:string,data?:any,method='POST'){
  if(busy||bulkDeleting)return false;setBusy(true);setError('');setNotice('');
  try{
   const result=await api(path,method,data);
   setNotice('Saved successfully');
   if(result.id&&path==='sessions'){setSelected(result.id);selectedRef.current=result.id}
   // Release the button after the mutation; fetch updated data in the background.
   setBusy(false);lastMeta.current=0;void refresh(true);
   return true;
  }catch(e:any){setError(e.message);setBusy(false);return false}
 }
 async function remove(kind:'courts'|'sessions'|'players',item:any){if(!window.confirm(`Delete ${item.name}? This removes it from active lists while preserving historical records.`))return;const success=await act(kind+'/'+id(item),undefined,'DELETE');if(success){if(kind==='sessions'&&selected===id(item)){setSelected('');setDetail(null)}}}
 async function resetSession(item:any){
  if(!window.confirm(`Reset ${item.name}? This clears the queue AND resets wins/games rankings to zero. Historical matches remain archived but no longer count toward rankings. Active matches must be completed first.`))return;
  await act('sessions/'+id(item)+'/reset');
 }
 const filteredPlayers=players.filter(p=>String(p.name||'').toLowerCase().includes(playerSearch.trim().toLowerCase()));
 const visiblePlayerIds=filteredPlayers.map(id);
 const selectedVisible=visiblePlayerIds.filter(x=>selectedPlayers.includes(x));
 const togglePlayer=(playerId:string)=>setSelectedPlayers(prev=>prev.includes(playerId)?prev.filter(x=>x!==playerId):[...prev,playerId]);
 async function deleteSelectedPlayers(){
  const targets=players.filter(p=>selectedPlayers.includes(id(p)));
  if(!targets.length||!window.confirm(`Delete ${targets.length} selected player(s)? Players currently in active matches cannot be deleted.`))return;
  setBulkDeleting(true);setError('');setNotice('');
  const failed:string[]=[];let deleted=0;
  for(const player of targets){
   try{await api('players/'+id(player),'DELETE');deleted++;}
   catch(e:any){failed.push(`${player.name}: ${e.message}`)}
  }
  setSelectedPlayers(failed.length?targets.filter(p=>failed.some(f=>f.startsWith(p.name+':'))).map(id):[]);
  setBulkDeleting(false);lastMeta.current=0;void refresh(true);
  if(failed.length)setError(`${deleted} deleted; ${failed.length} failed. ${failed.join(' | ')}`);
  else setNotice(`${deleted} player(s) deleted`);
 }
 const active=detail?.matches?.filter((m:any)=>m.status==='playing')||[];
 const waiting=detail?.queue?.filter((q:any)=>q.status==='waiting')||[];
 if(!me&&admin)return <main className="admin-page"><h1>Organizer dashboard</h1><p>Admin login required. <a href="/admin/login">Sign in</a>.</p></main>;
 return <main className="admin-page"><h1>{display?'Live Open Play Courts':admin?'Organizer dashboard':'Player dashboard'}</h1>{me&&<p>Signed in as {me.name} ({me.role}) <button className="secondary" onClick={async()=>{await act('auth/logout');location.href='/login'}}>Logout</button></p>}{admin&&me?.role==='admin'&&<nav className="admin-tabs" aria-label="Admin sections"><button type="button" className={adminTab==='open'?'tab-active':'secondary'} onClick={()=>setAdminTab('open')}>Open Play</button><button type="button" className={adminTab==='courts'?'tab-active':'secondary'} onClick={()=>setAdminTab('courts')}>Courts</button><button type="button" className={adminTab==='players'?'tab-active':'secondary'} onClick={()=>setAdminTab('players')}>Players</button></nav>}<div className="dashboard-sync" role="status" aria-live="polite"><span>{refreshing?'Syncing…':lastUpdated?'Up to date':'Connecting…'}</span><button type="button" className="secondary" disabled={refreshing||busy||bulkDeleting} onClick={()=>void refresh(true)}>Refresh</button></div>{error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="success" role="status">{notice}</p>}
 {admin&&me?.role==='admin'&&<section className="admin-quick-add"><div className="quick-add-heading"><h2>Quick add</h2><span>Manage courts, sessions and guests</span></div><div className="admin-grid admin-forms">{adminTab==='courts'&&<section className="card"><h2>Add court</h2><form onSubmit={e=>{e.preventDefault();act('courts',{name:courtName});setCourtName('')}}><input value={courtName} onChange={e=>setCourtName(e.target.value)} placeholder="Court 1" required/><button>Add</button></form></section>}{adminTab==='open'&&<><section className="card"><h2>Create Open Play</h2><form onSubmit={e=>{e.preventDefault();act('sessions',{name:sessionName||'Open Play',courtIds:courts.filter(c=>c.enabled).map(id)});setSessionName('')}}><input placeholder="Session name" value={sessionName} onChange={e=>setSessionName(e.target.value)}/><button>Create using all enabled courts</button></form></section></>}{adminTab==='players'&&<section className="card"><h2>Add guest player</h2><form onSubmit={e=>{e.preventDefault();act('players',{name:guestName});setGuestName('')}}><input value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Guest name" required/><button>Add</button></form></section>}</div></section>}
 <div className="admin-grid admin-lists compact-management">{(!admin&&!display||admin&&adminTab==='courts')&&<section className="card"><h2>Courts <small>({courts.length})</small></h2>{courts.map(c=><div className="row compact-entity-row" key={id(c)}><strong>{c.name}</strong><span className="pill">{c.enabled?'Open':'Closed'}</span>{admin&&me?.role==='admin'&&<><button className="secondary" disabled={busy||bulkDeleting} onClick={()=>act('courts/'+id(c),{enabled:!c.enabled},'PATCH')}>{c.enabled?'Close':'Open'}</button><button className="danger" disabled={busy||bulkDeleting} onClick={()=>remove('courts',c)}>Delete</button></>}</div>)}</section>}{(!admin&&!display||admin&&adminTab==='open')&&<section className="card"><h2>Open Play sessions <small>({sessions.length})</small></h2>{sessions.map(s=><div key={id(s)} className="row compact-entity-row"><button className="secondary" onClick={()=>setSelected(id(s))}>{s.name}</button><small>{s.status}</small>{admin&&me?.role==='admin'&&<><button className="secondary" disabled={busy||bulkDeleting} onClick={()=>act('sessions/'+id(s),{status:s.status==='active'?'disabled':'active'},'PATCH')}>{s.status==='active'?'Disable':'Enable'}</button><button className="secondary" disabled={busy||bulkDeleting} onClick={()=>resetSession(s)}>Reset / Clear</button><button className="danger" disabled={busy||bulkDeleting} onClick={()=>remove('sessions',s)}>Delete</button></>}</div>)}</section>}{admin&&me?.role==='admin'&&adminTab==='players'&&<section className="card players-management"><div className="players-heading"><h2>Players <small>({players.length})</small></h2><input aria-label="Search players" placeholder="Search players..." value={playerSearch} onChange={e=>setPlayerSearch(e.target.value)}/></div><div className="player-bulk-toolbar"><label><input type="checkbox" aria-label="Select all visible players" checked={visiblePlayerIds.length>0&&selectedVisible.length===visiblePlayerIds.length} onChange={e=>setSelectedPlayers(prev=>e.target.checked?Array.from(new Set([...prev,...visiblePlayerIds])):prev.filter(x=>!visiblePlayerIds.includes(x)))}/> Select all visible</label><span>{selectedPlayers.length} selected</span><button type="button" className="danger" disabled={busy||bulkDeleting||selectedPlayers.length===0} onClick={()=>void deleteSelectedPlayers()}>{bulkDeleting?"Deleting...":`Delete selected (${selectedPlayers.length})`}</button></div><div className="entity-list">{filteredPlayers.map(p=><div className="entity-row" key={id(p)}><input type="checkbox" aria-label={`Select ${p.name}`} checked={selectedPlayers.includes(id(p))} onChange={()=>togglePlayer(id(p))}/><strong>{p.name}</strong><button className="secondary" disabled={busy||bulkDeleting} onClick={()=>{setEditingPlayer(p);setEditName(p.name);setEditSkill(p.skillLevel||'beginner');setEditStyle(p.playStyle||'chill')}}>Edit</button><button className="danger" disabled={busy||bulkDeleting} onClick={()=>remove('players',p)}>Delete</button></div>)}{!players.length&&<p>No players yet.</p>}</div></section>}</div>
 {admin&&me?.role==='admin'&&adminTab==='players'&&editingPlayer&&<section className="card player-edit-card"><h2>Edit player</h2><form onSubmit={async e=>{e.preventDefault();if(await act('players/'+id(editingPlayer),{name:editName,skillLevel:editSkill,playStyle:editStyle},'PATCH'))setEditingPlayer(null)}}><label>Name<input required minLength={2} value={editName} onChange={e=>setEditName(e.target.value)}/></label><label>Skill<select value={editSkill} onChange={e=>setEditSkill(e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label>Style<select value={editStyle} onChange={e=>setEditStyle(e.target.value)}><option value="chill">Chill</option><option value="challenge">Challenge</option></select></label><button disabled={busy||bulkDeleting}>Save player</button><button type="button" className="secondary" onClick={()=>setEditingPlayer(null)}>Cancel</button></form></section>}
 {detail&&(!admin||adminTab==='open')&&<section className="card session-management"><div className="session-heading"><div><h2>{detail.session.name} — Open Play</h2><p>{waiting.length} waiting · {active.length} active matches</p></div></div>
 {admin&&me?.role==='admin'&&<div className="session-controls"><div className="session-settings"><label>Queue policy<select value={detail.session.queuePolicy} onChange={e=>act('sessions/'+selected+'/settings',{queuePolicy:e.target.value},'PATCH')}><option value="fifo">FIFO + Skill / Play Style</option><option value="four">Four-player rotation</option><option value="winner">Winner stays (basic)</option></select></label><label>Team formation<select value={detail.session.teamPolicy} onChange={e=>act('sessions/'+selected+'/settings',{teamPolicy:e.target.value},'PATCH')}><option value="random">Random</option><option value="balanced">Balanced</option><option value="fixed">Fixed (experimental)</option></select></label></div><button className="assign-button" disabled={busy||waiting.length<4} onClick={()=>act('sessions/'+selected+'/assign',{})}>Assign next four</button></div>}
 {admin&&me?.role==='admin'&&<div className="manual-assignment-toggle"><button type="button" className="secondary" aria-expanded={showManualAssignment} onClick={()=>setShowManualAssignment(v=>!v)}>{showManualAssignment?'Hide manual assignment':'Manual court assignment'}</button></div>}
 {admin&&me?.role==='admin'&&showManualAssignment&&<section className="manual-assignment card"><h3>Manual court assignment</h3><p>Choose a court and four waiting players. First two form Team 1; last two form Team 2.</p><div className="manual-assignment-grid"><label>Court<select value={manualCourt} onChange={e=>setManualCourt(e.target.value)}><option value="">Select available court</option>{courts.filter(c=>c.enabled&&detail.session.courtIds.some((x:any)=>id(x)===id(c))&&!detail.matches.some((m:any)=>m.status==='playing'&&id(m.courtId)===id(c))).map(c=><option key={id(c)} value={id(c)}>{c.name}</option>)}</select></label>{manualPlayers.map((value,i)=><label key={i}>{i<2?'Team 1':'Team 2'} — Player {i%2+1}<select value={value} onChange={e=>setManualPlayers(prev=>prev.map((v,j)=>j===i?e.target.value:v))}><option value="">Select waiting player</option>{waiting.filter((q:any)=>id(q.playerId)===value||!manualPlayers.includes(id(q.playerId))).map((q:any)=><option key={id(q.playerId)} value={id(q.playerId)}>{players.find(p=>id(p)===id(q.playerId))?.name||detail.playerNames?.find((p:any)=>id(p)===id(q.playerId))?.name||id(q.playerId)}</option>)}</select></label>)}</div><button disabled={busy||!manualCourt||manualPlayers.some(v=>!v)||new Set(manualPlayers).size!==4} onClick={async()=>{const success=await act('sessions/'+selected+'/assign-manual',{courtId:manualCourt,playerIds:manualPlayers});if(success){setManualCourt('');setManualPlayers(['','','',''])}}}>Assign selected players</button></section>}
 {admin&&me?.role==='admin'&&<div className="session-checkin"><label>Check in guest<select value={p1} onChange={e=>setP1(e.target.value)}><option value="">Select player</option>{players.map(p=><option key={id(p)} value={id(p)}>{p.name}</option>)}</select></label><button disabled={!p1||busy} onClick={()=>act('sessions/'+selected+'/join',{playerId:p1})}>Add to queue</button></div>}
 <OpenPlayLive detail={detail} courts={courts} admin={admin&&me?.role==='admin'} busy={busy} onComplete={(matchId,a,b)=>{void act('matches/'+matchId+'/complete',{scoreA:a,scoreB:b})}}/>
 </section>}
 </main>
}
