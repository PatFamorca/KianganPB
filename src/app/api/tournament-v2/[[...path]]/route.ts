import {NextRequest,NextResponse} from 'next/server';
import {ObjectId} from 'mongodb';
import {db} from '@/lib/db';
import {identity,isAdmin} from '@/lib/auth';
import {validateRoster,roundPairs,seedPairs,standings,scoreOk,matchGames,winsNeeded} from '@/lib/tournament-engine.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>NextResponse.json(v,{status});
const fail=(s:string,status=400)=>json({error:s},status);
const oid=(s:string)=>{if(!ObjectId.isValid(s))throw Error('Invalid ID');return new ObjectId(s)};
const txt=(v:unknown,max=80)=>String(v||'').trim().slice(0,max);
const categories=['singles','doubles','mixed','team'];const formats=['round','single','double'];
function createTie(tournamentId:ObjectId,a:string,b:string,round:number,position:number,category:string,bracket='main'){
 return {tournamentId,a:oid(a),b:oid(b),round,position,bracket,status:'pending',winsA:0,winsB:0,games:matchGames(category).map(g=>({...g,status:'pending'})),createdAt:new Date()};
}
export async function GET(req:NextRequest,{params}:{params:{path?:string[]}}){try{
 const path=params.path||[];const d=await db();if(!path.length)return json(await d.collection('tournamentV2').find({deletedAt:{$exists:false}}).sort({createdAt:-1}).toArray());
 const id=oid(path[0]);const t=await d.collection('tournamentV2').findOne({_id:id,deletedAt:{$exists:false}});if(!t)return fail('Tournament not found',404);
 const [entries,ties]=await Promise.all([d.collection('tournamentEntriesV2').find({tournamentId:id}).sort({createdAt:1}).toArray(),d.collection('tournamentTiesV2').find({tournamentId:id}).sort({round:1,position:1}).toArray()]);
 return json({tournament:t,entries,ties,standings:standings(entries.filter(e=>e.status==='approved'),ties)});
 }catch(e:any){return fail(e.message||'Unable to load',400)}}
export async function POST(req:NextRequest,{params}:{params:{path?:string[]}}){try{
 const path=params.path||[],body=await req.json().catch(()=>({})),d=await db(),user=await identity(),admin=isAdmin(user);
 if(!path.length){if(!admin)return fail('Admin required',401);const name=txt(body.name);if(name.length<3)return fail('Tournament name must be at least 3 characters');if(!categories.includes(body.category)||!formats.includes(body.format))return fail('Choose a valid category and format');const category=body.category as string;const r=await d.collection('tournamentV2').insertOne({name,category,format:body.format,status:'registration',bestOf:category==='team'?5:1,createdAt:new Date()});return json({id:String(r.insertedId)},201)}
 const tournamentId=oid(path[0]),action=path[1];const t=await d.collection('tournamentV2').findOne({_id:tournamentId,deletedAt:{$exists:false}});if(!t)return fail('Tournament not found',404);
 if(action==='register'){
  if(t.status!=='registration')return fail('Registration is closed',409);
  const names=Array.isArray(body.playerNames)?body.playerNames.map((n:unknown)=>txt(n,70)):[];
  if(!validateRoster(t.category,names))return fail(`Enter ${t.category==='team'?'five':t.category==='singles'?'one':'two'} distinct player names`);
  const teamName=t.category==='singles'?names[0]:txt(body.teamName,60);
  if(!teamName)return fail('Team name required');
  if(t.category==='mixed'){const genders=Array.isArray(body.genders)?body.genders:[];if(genders.length!==2||!genders.includes('female')||!genders.includes('male'))return fail('Mixed doubles requires one female and one male participant')}
  const normalized=names.map((n:string)=>n.toLocaleLowerCase('en')).sort();
  const all=await d.collection('tournamentEntriesV2').find({tournamentId,status:{$ne:'rejected'}}).toArray();
  if(all.some((e:any)=>e.playerNames.some((n:string)=>normalized.includes(n.toLocaleLowerCase('en')))))return fail('A player is already registered in this tournament',409);
  const r=await d.collection('tournamentEntriesV2').insertOne({tournamentId,teamName,playerNames:names,genders:t.category==='mixed'?body.genders:[],contact:txt(body.contact,100),status:'pending',createdAt:new Date()});return json({id:String(r.insertedId),status:'pending'},201);
 }
 if(!admin)return fail('Admin required',401);
 if(action==='approve'||action==='reject'){
  if(t.status!=='registration')return fail('Registration is closed',409);
  const entryId=oid(body.entryId);const status=action==='approve'?'approved':'rejected';const r=await d.collection('tournamentEntriesV2').updateOne({_id:entryId,tournamentId,status:'pending'},{$set:{status,reviewedAt:new Date()}});if(!r.modifiedCount)return fail('Registration not pending',409);return json({ok:true});
 }
 if(action==='generate'){
  if(t.status!=='registration')return fail('Tournament already started',409);
  const entries=await d.collection('tournamentEntriesV2').find({tournamentId,status:'approved'}).sort({createdAt:1}).toArray();if(entries.length<2)return fail('Approve at least two entries',409);
  const ids=entries.map((e:any)=>String(e._id));const pairs=t.format==='round'?roundPairs(ids):seedPairs(ids);
  const ties=pairs.filter(p=>p[0]&&p[1]).map((p,i)=>createTie(tournamentId,p[0]!,p[1]!,1,i,t.category));
  const byes=pairs.filter(p=>!p[0]||!p[1]).map(p=>p[0]||p[1]);
  // Claim generation before inserting matches; rollback the claim if insert fails.
  const claim=await d.collection('tournamentV2').updateOne({_id:tournamentId,status:'registration'},{$set:{status:'active',round:1,byes,startedAt:new Date()}});if(!claim.modifiedCount)return fail('Already started',409);
  try{if(ties.length)await d.collection('tournamentTiesV2').insertMany(ties)}catch(e){await d.collection('tournamentV2').updateOne({_id:tournamentId},{$set:{status:'registration'},$unset:{round:'',byes:'',startedAt:''}});throw e}
  return json({ok:true,ties:ties.length,byes:byes.length});
 }
 if(action==='start'){
  const tieId=oid(body.tieId),courtId=oid(body.courtId);const court=await d.collection('courts').findOne({_id:courtId,enabled:true,deletedAt:{$exists:false}});if(!court)return fail('Court not available',409);
  const occupied=await d.collection('tournamentTiesV2').findOne({courtId,status:'playing'});const openOccupied=await d.collection('matches').findOne({courtId,status:'playing'});if(occupied||openOccupied)return fail('Court is busy',409);
  const result=await d.collection('tournamentTiesV2').updateOne({_id:tieId,tournamentId,status:'pending'},{$set:{status:'playing',courtId,startedAt:new Date()}});if(!result.modifiedCount)return fail('Match already started',409);return json({ok:true});
 }
 if(action==='score'){
  const tieId=oid(body.tieId),index=Number(body.gameIndex),a=Number(body.scoreA),b=Number(body.scoreB);
  const tie=await d.collection('tournamentTiesV2').findOne({_id:tieId,tournamentId,status:'playing'});if(!tie)return fail('Active match not found',404);
  if(!Number.isInteger(index)||index<0||index>=tie.games.length||tie.games[index].status==='completed')return fail('Game not available',409);
  if(!scoreOk(a,b,t.target||11))return fail('Final score must reach 11 and win by 2');
  const winsA=tie.winsA+(a>b?1:0),winsB=tie.winsB+(b>a?1:0),done=Math.max(winsA,winsB)>=winsNeeded(t.category);
  const update:any={$set:{[`games.${index}.status`]:'completed',[`games.${index}.scoreA`]:a,[`games.${index}.scoreB`]:b,winsA,winsB}};
  if(done)Object.assign(update.$set,{status:'completed',winner:winsA>winsB?0:1,completedAt:new Date()});
  const result=await d.collection('tournamentTiesV2').updateOne({_id:tieId,status:'playing',[`games.${index}.status`]:'pending'},update);
  if(!result.modifiedCount)return fail('Score already recorded',409);
  if(done)await advance(d,tournamentId);
  return json({ok:true,completed:done});
 }
 return fail('Unknown tournament action',404);
 }catch(e:any){return fail(e.message||'Tournament operation failed',400)}}
async function advance(d:Awaited<ReturnType<typeof db>>,id:ObjectId){
 const t=await d.collection('tournamentV2').findOne({_id:id});if(!t||t.status!=='active')return;
 const round=t.round||1;const current=await d.collection('tournamentTiesV2').find({tournamentId:id,round}).toArray();if(current.some(x=>x.status!=='completed'))return;
 if(t.format==='round'){
  const entries=await d.collection('tournamentEntriesV2').find({tournamentId:id,status:'approved'}).toArray();const ranking=standings(entries,current);const champion=ranking[0];if(champion)await d.collection('tournamentV2').updateOne({_id:id,status:'active'},{$set:{status:'completed',championId:oid(champion.id),championName:champion.name,completedAt:new Date()}});return;
 }
 const winners=[...(t.byes||[]),...current.map((x:any)=>x.winner===0?String(x.a):String(x.b))];
 if(winners.length===1){const entry=await d.collection('tournamentEntriesV2').findOne({_id:oid(winners[0])});await d.collection('tournamentV2').updateOne({_id:id,status:'active'},{$set:{status:'completed',championId:oid(winners[0]),championName:entry?.teamName,completedAt:new Date()}});return;}
 // Single-elimination advances winners. Double-elimination requires a separate loser bracket
 // and is deliberately not advanced as single elimination.
 if(t.format==='double')return;
 const pairs=seedPairs(winners);const next=pairs.filter((x:any)=>x[0]&&x[1]).map((p,i)=>createTie(id,p[0]!,p[1]!,round+1,i,t.category));
 const claimed=await d.collection('tournamentV2').updateOne({_id:id,round},{$set:{round:round+1,byes:pairs.filter((x:any)=>!x[0]||!x[1]).map((x:any)=>x[0]||x[1])}});
 if(claimed.modifiedCount&&next.length)await d.collection('tournamentTiesV2').insertMany(next);
}
