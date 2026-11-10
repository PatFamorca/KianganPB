'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import OpenPlayLive from './OpenPlayLive';
type Item={_id:string;name:string;status?:string};
const getId=(x:any)=>String(x?._id||x||'');
async function get(path:string,signal?:AbortSignal){const response=await fetch('/api/v1/'+path,{cache:'no-store',signal});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to load live data');return result;}
export default function LiveDisplay(){
 const [sessions,setSessions]=useState<Item[]>([]),[selected,setSelected]=useState(''),[courts,setCourts]=useState<any[]>([]),[detail,setDetail]=useState<any>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[updating,setUpdating]=useState(false);
 const refreshAgain=useRef<()=>void>(()=>{});
 const selectedRef=useRef('');const pending=useRef(false);const inFlight=useRef(false);const requestController=useRef<AbortController|null>(null);const lastMeta=useRef(0);const alive=useRef(true);
 const refresh=useCallback(async(forceMeta=false)=>{
  if(!alive.current||document.hidden)return;
  if(inFlight.current){pending.current=true;return;}
  inFlight.current=true;setUpdating(true);const controller=new AbortController();requestController.current=controller;
  try{
   let current=selectedRef.current;
   if(forceMeta||!lastMeta.current||Date.now()-lastMeta.current>60000){
    const [list,courtList]=await Promise.all([get('sessions',controller.signal),get('courts',controller.signal)]);
    if(!alive.current)return;
    const available=(list as Item[]).filter(s=>s.status==='active');
    setSessions(available);setCourts(courtList);lastMeta.current=Date.now();
    if(!available.some(s=>getId(s)===current))current=getId(available[0]||'');
    selectedRef.current=current;setSelected(current);
   }
   if(current){const result=await get('sessions/'+current,controller.signal);if(alive.current&&selectedRef.current===current){setDetail(result);setError('')}}
   else if(alive.current){setDetail(null);setError('')}
  }catch(e:any){if(alive.current&&e?.name!=='AbortError')setError(e.message||'Unable to load live courts')}
  finally{if(requestController.current===controller)requestController.current=null;inFlight.current=false;if(alive.current){setLoading(false);setUpdating(false);if(pending.current){pending.current=false;setTimeout(()=>refreshAgain.current(),0)}}}
 },[]);
 refreshAgain.current=()=>{void refresh()};
 useEffect(()=>{alive.current=true;void refresh(true);const timer=setInterval(()=>{if(document.hasFocus())void refresh()},6000);const onFocus=()=>void refresh();document.addEventListener('visibilitychange',onFocus);window.addEventListener('focus',onFocus);return()=>{alive.current=false;requestController.current?.abort();clearInterval(timer);document.removeEventListener('visibilitychange',onFocus);window.removeEventListener('focus',onFocus)}},[refresh]);
 const choose=(value:string)=>{requestController.current?.abort();selectedRef.current=value;setSelected(value);setDetail(null);setLoading(true);void refresh()};
 return <main className="admin-page live-display-page"><header className="live-display-header"><div><h1>Live Open Play Courts</h1><p>Live matches, waiting queue, and winner rankings {updating?'· Updating…':''}</p></div><label>Open Play session<select aria-label="Open Play session" value={selected} onChange={e=>choose(e.target.value)}>{sessions.map(s=><option key={getId(s)} value={getId(s)}>{s.name}</option>)}</select></label></header>
 {error&&<p className="error" role="alert">{error} <button type="button" className="secondary" onClick={()=>void refresh(true)}>Retry</button></p>}
 {loading&&!detail&&<p>Loading live courts…</p>}
 {!loading&&!error&&!sessions.length&&<section className="card"><h2>No active Open Play sessions</h2><p>Live courts will appear here when an Open Play session is enabled.</p></section>}
 {detail&&<OpenPlayLive detail={detail} courts={courts}/>}</main>;
}
