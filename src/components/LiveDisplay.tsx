'use client';
import {useCallback,useEffect,useState} from 'react';
import OpenPlayLive from './OpenPlayLive';

type Item={_id:string;name:string;status?:string};
const getId=(x:any)=>String(x?._id||x||'');
async function get(path:string){const response=await fetch('/api/v1/'+path,{cache:'no-store'});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to load live data');return result;}
export default function LiveDisplay(){
 const [sessions,setSessions]=useState<Item[]>([]);
 const [selected,setSelected]=useState('');
 const [courts,setCourts]=useState<any[]>([]);
 const [detail,setDetail]=useState<any>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{
  try{
   const [list,courtList]=await Promise.all([get('sessions'),get('courts')]);
   const available=(list as Item[]).filter(s=>s.status==='active');
   setSessions(available);setCourts(courtList);
   const current=available.find(s=>getId(s)===selected)||available[0];
   if(!current){setDetail(null);setSelected('');setError('');return;}
   if(getId(current)!==selected)setSelected(getId(current));
   setDetail(await get('sessions/'+getId(current)));
   setError('');
  }catch(e:any){setError(e.message||'Unable to load live courts');}
  finally{setLoading(false);}
 },[selected]);
 useEffect(()=>{void refresh();const timer=setInterval(()=>{if(!document.hidden)void refresh()},5000);return()=>clearInterval(timer)},[refresh]);
 return <main className="admin-page live-display-page">
  <header className="live-display-header"><div><h1>Live Open Play Courts</h1><p>Live matches, waiting queue, and winner rankings</p></div>
   <label>Open Play session<select aria-label="Open Play session" value={selected} onChange={e=>{setSelected(e.target.value);setDetail(null)}}>{sessions.map(s=><option key={getId(s)} value={getId(s)}>{s.name}</option>)}</select></label>
  </header>
  {error&&<p className="error" role="alert">{error} <button type="button" className="secondary" onClick={()=>void refresh()}>Retry</button></p>}
  {loading&&!detail&&<p>Loading live courts…</p>}
  {!loading&&!error&&!sessions.length&&<section className="card"><h2>No active Open Play sessions</h2><p>Live courts will appear here when an Open Play session is enabled.</p></section>}
  {detail&&<OpenPlayLive detail={detail} courts={courts}/>}
 </main>;
}
