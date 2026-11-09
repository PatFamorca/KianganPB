import {NextRequest,NextResponse} from 'next/server';
import {ObjectId,ClientSession} from 'mongodb';
import bcrypt from 'bcryptjs';
import {db,indexes,mongoClient} from '@/lib/db';
import {selectFifoGroup} from '@/lib/queue-policy';
import {identity,isAdmin,setLogin} from '@/lib/auth';
import {roundRobin,singleElimination,doubleElimination,nextDoubleRound,teamsForFour,scoreValid} from '@/lib/engine.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
const ok=(data:any,status=200)=>NextResponse.json(data,{status});
const err=(message:string,status=400)=>ok({error:message},status);
const oid=(s:string)=>{if(!ObjectId.isValid(s))throw Error('Invalid ID');return new ObjectId(s)};
const arr=(a:any)=>Array.isArray(a)?a:[];
const now=()=>new Date();
const visible={deletedAt:{$exists:false}};
const conflict=(message:string)=>err(message,409);
async function transaction<T>(fn:(s:ClientSession)=>Promise<T>){const d=await db();const client=await mongoClient();const s=client.startSession();try{return await s.withTransaction(async()=>fn(s)) as T}finally{await s.endSession()}}
async function handler(req:NextRequest,{params}:{params:{route:string[]}}){try{
 const path=params.route;const method=req.method;const body=method==='GET'?{}:await req.json().catch(()=>({}));const d=await db();
 if(path.join('/')==='health')return ok({ok:true});
 if(path[0]==='auth'){
  if(path[1]==='logout'&&method==='POST'){const res=ok({ok:true});res.cookies.delete('ph_session');return res}
  if(path[1]==='me')return ok({user:await identity()});
  if(path[1]==='setup-status'&&method==='GET'){
    return ok({configured:!!(await d.collection('users').findOne({role:'admin'}))});
  }
  if(path[1]==='setup'&&method==='POST'){
    const configured=await d.collection('users').findOne({role:'admin'});
    if(configured)return err('Administrator already configured',409);
    const secret=process.env.ADMIN_SETUP_SECRET;
    if(!secret||secret.length<24)return err('ADMIN_SETUP_SECRET is not configured (minimum 24 characters)',503);
    const provided=String(body.setupSecret||'');
    const {timingSafeEqual}=await import('crypto');
    const a=Buffer.from(provided),b=Buffer.from(secret);
    if(a.length!==b.length||!timingSafeEqual(a,b))return err('Invalid setup secret',403);
    const name=String(body.name||'').trim(),email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');
    if(name.length<2||name.length>80||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12)return err('Enter a name, valid email, and password of at least 12 characters');
    const passwordHash=await bcrypt.hash(password,12);
    // The unique singleton claim serializes simultaneous setup attempts.
    try{
      await d.collection('adminSetupClaim').insertOne({_id:'initial_admin' as any,createdAt:now()});
    }catch(e:any){if(e.code===11000)return err('Administrator setup already claimed',409);throw e}
    try{
      const result=await d.collection('users').insertOne({name,email,passwordHash,role:'admin',createdAt:now()});
      await setLogin({id:String(result.insertedId),role:'admin',name});
      return ok({ok:true,role:'admin'},201);
    }catch(e:any){await d.collection('adminSetupClaim').deleteOne({_id:'initial_admin' as any});if(e.code===11000)return err('Email already exists',409);throw e}
  }
  if(path[1]==='register')return err('Website accounts are disabled. Join an Open Play session as a guest.',403);
  if(path[1]==='login'&&method==='POST'){
   const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');
   if(!email||!password)return err('Email and password required');
   const u=await d.collection('users').findOne({email});if(!u||!await bcrypt.compare(password,u.passwordHash))return err('Invalid email or password',401);
   if(u.role!=='admin')return err('Admin access only',403);
   await setLogin({id:String(u._id),role:u.role,name:u.name});return ok({role:u.role});
  }
 }
 if(path[0]==='guest'&&path[1]==='join'&&method==='POST'){
   const sessionId=oid(String(body.sessionId||''));
   const session=await d.collection('sessions').findOne({_id:sessionId,status:'active',...visible});
   if(!session)return err('Open Play session not found or closed',404);
   const name=String(body.name||'').trim().replace(/\s+/g,' ');
   if(name.length<2||name.length>70)return err('Name must be 2–70 characters');
   const skillLevel=['beginner','intermediate','advanced'].includes(body.skillLevel)?body.skillLevel:'beginner';
   const playStyle=['chill','challenge'].includes(body.playStyle)?body.playStyle:'chill';
   const normalizedName=name.toLocaleLowerCase('en');
   await d.collection('guestClaims').createIndex({sessionId:1,normalizedName:1},{unique:true});
   try{await d.collection('guestClaims').insertOne({sessionId,normalizedName,createdAt:now()})}
   catch(e:any){if(e.code===11000)return err('This name is already registered for the session. Ask the organizer for help.',409);throw e}
   try{
     const player=await d.collection('players').insertOne({name,rating:({beginner:1,intermediate:3,advanced:5} as Record<string,number>)[skillLevel],skillLevel,playStyle,guest:true,createdAt:now()});
     await d.collection('queue').insertOne({sessionId,playerId:player.insertedId,active:true,status:'waiting',joinedAt:now(),gamesPlayed:0,skillLevel,playStyle});
     return ok({ok:true,playerId:String(player.insertedId),message:'You are in the Open Play queue'},201);
   }catch(e){await d.collection('guestClaims').deleteOne({sessionId,normalizedName});throw e}
 }
 const user=await identity();
 const publicGet=method==='GET'&&(['sessions','courts','tournaments','display','matches','players'].includes(path[0]));
 if(!user&&!publicGet)return err('Admin login required',401);
 const admin=isAdmin(user);
 const adminOnly=()=>{if(!admin)throw Error('ADMIN_ONLY')};
 if(path[0]==='courts'){
  if(method==='GET')return ok(await d.collection('courts').find(visible).sort({name:1}).toArray());
  adminOnly();if(method==='POST'){const name=String(body.name||'').trim();if(!name)return err('Court name required');await indexes();const r=await d.collection('courts').insertOne({name,enabled:true,createdAt:now()});return ok({id:String(r.insertedId)},201)}
  if(method==='PATCH'&&path[1]){const result=await d.collection('courts').updateOne({_id:oid(path[1]),...visible},{$set:{enabled:!!body.enabled}});return result.matchedCount?ok({ok:true}):err('Court not found',404)}
  if(method==='DELETE'&&path[1]){const courtId=oid(path[1]);if(await d.collection('matches').findOne({courtId,status:'playing'}))return conflict('Finish the active match before deleting this court');await d.collection('courts').updateOne({_id:courtId,...visible},{$set:{enabled:false,deletedAt:now()}});return ok({ok:true})}
 }
 if(path[0]==='players'){
  if(method==='GET')return ok(await d.collection('players').find(visible).project({name:1,rating:1,skillLevel:1,playStyle:1}).sort({name:1}).limit(500).toArray());
  adminOnly();if(method==='POST'){const name=String(body.name||'').trim();if(name.length<2)return err('Name required');const r=await d.collection('players').insertOne({name,rating:Number(body.rating)||3,createdAt:now()});return ok({id:String(r.insertedId)},201)}
  if(method==='DELETE'&&path[1]){
   const playerId=oid(path[1]);
   const player=await d.collection('players').findOne({_id:playerId,...visible});
   if(!player)return err('Player not found',404);
   const activeMatches=await d.collection('matches').find({status:'playing',context:'open'}).project({teams:1}).toArray();
   if(activeMatches.some(m=>arr(m.teams).flat().some((x:any)=>String(x)===String(playerId))))return conflict('Finish this player’s active match before deleting');
   return ok(await transaction(async tx=>{
    const rows=await d.collection('queue').find({playerId,active:true},{session:tx}).toArray();
    const sessionIds=rows.map(q=>q.sessionId);
    await d.collection('queue').updateMany({playerId,active:true,status:{$ne:'playing'}},{$set:{active:false,status:'left',leftAt:now()}},{session:tx});
    if(sessionIds.length)await d.collection('guestClaims').deleteMany({sessionId:{$in:sessionIds},normalizedName:String(player.name).trim().replace(/\s+/g,' ').toLocaleLowerCase('en')},{session:tx});
    await d.collection('players').updateOne({_id:playerId,...visible},{$set:{deletedAt:now()}},{session:tx});
    return {ok:true};
   }));
  }
 }
 if(path[0]==='sessions'){
  if(method==='GET'&&path.length===1)return ok(await d.collection('sessions').find(visible).sort({createdAt:-1}).limit(100).toArray());
  if(method==='POST'&&path.length===1){adminOnly();const courtIds=arr(body.courtIds).map((x:string)=>oid(x));if(!courtIds.length)return err('Select at least one court');const r=await d.collection('sessions').insertOne({name:String(body.name||'Open Play'),courtIds,queuePolicy:body.queuePolicy||'fifo',teamPolicy:body.teamPolicy||'random',status:'active',weeklyResetEnabled:true,target:11,winBy:2,createdAt:now()});return ok({id:String(r.insertedId)},201)}
  if(!path[1])return err('Session ID required');const sessionId=oid(path[1]);const session=await d.collection('sessions').findOne({_id:sessionId,...visible});if(!session)return err('Session not found',404);
  if(method==='GET'&&path.length===2){const [queue,matches]=await Promise.all([d.collection('queue').find({sessionId,active:true}).sort({joinedAt:1}).toArray(),d.collection('matches').find({sessionId,archivedAt:{$exists:false}}).sort({createdAt:-1}).limit(100).toArray()]);const playerIds=queue.map(q=>q.playerId);const playerNames=await d.collection('players').find({_id:{$in:playerIds}}).project({name:1,skillLevel:1,playStyle:1}).toArray();return ok({session,queue,matches,playerNames})}
  if(path.length===2&&method==='PATCH'){adminOnly();if(!['active','disabled'].includes(body.status))return err('Invalid session status');if(body.status==='active'&&session.status==='completed')return conflict('Completed sessions cannot be reopened');await d.collection('sessions').updateOne({_id:sessionId},{$set:{status:body.status}});return ok({ok:true})}
  if(path.length===2&&method==='DELETE'){adminOnly();if(await d.collection('matches').findOne({sessionId,status:'playing'}))return conflict('Complete active matches before deleting the session');await d.collection('sessions').updateOne({_id:sessionId},{$set:{status:'disabled',deletedAt:now()}});await d.collection('queue').updateMany({sessionId,active:true},{$set:{active:false,status:'left'}});return ok({ok:true})}
  if(path[2]==='reset'&&method==='POST'){
   adminOnly();
   if(await d.collection('matches').findOne({sessionId,status:'playing'}))return conflict('Complete active matches before resetting the session');
   return ok(await transaction(async tx=>{
    const resetAt=now();
    await d.collection('queue').updateMany({sessionId,active:true},{$set:{active:false,status:'cleared',clearedAt:resetAt}},{session:tx});
    await d.collection('matches').updateMany({sessionId,archivedAt:{$exists:false}},{$set:{archivedAt:resetAt}},{session:tx});
    await d.collection('guestClaims').deleteMany({sessionId},{session:tx});
    await d.collection('sessions').updateOne({_id:sessionId},{$set:{lastResetAt:resetAt},$inc:{resetCount:1}},{session:tx});
    return {ok:true,message:'Session cleared. Existing player profiles and match history are retained.'};
   }));
  }
  if(path[2]==='settings'&&method==='PATCH'){adminOnly();const policy=['fifo','four','winner'].includes(body.queuePolicy)?body.queuePolicy:session.queuePolicy;const team=['random','balanced','fixed'].includes(body.teamPolicy)?body.teamPolicy:session.teamPolicy;await d.collection('sessions').updateOne({_id:sessionId},{$set:{queuePolicy:policy,teamPolicy:team}});return ok({ok:true})}
  if(path[2]==='join'&&method==='POST'){adminOnly();
   const playerId=body.playerId?oid(body.playerId):user? (await d.collection('players').findOne({userId:oid(user.id)}))?._id:null;
   if(!playerId)return err('Player not found');if(!admin&&String((await d.collection('players').findOne({_id:playerId}))?.userId)!==user?.id)return err('Not your player',403);
   if(session.status!=='active')return err('Session not active');
   try{await d.collection('queue').insertOne({sessionId,playerId,active:true,status:'waiting',joinedAt:now(),gamesPlayed:0,skillLevel:['beginner','intermediate','advanced'].includes(body.skillLevel)?body.skillLevel:'beginner',playStyle:['chill','challenge'].includes(body.playStyle)?body.playStyle:'chill'});return ok({ok:true},201)}catch(e:any){if(e.code===11000)return err('Already in queue',409);throw e}
  }
  if(path[2]==='leave'&&method==='POST'){adminOnly();
   const playerId=admin&&body.playerId?oid(body.playerId):(await d.collection('players').findOne({userId:oid(user!.id)}))?._id;
   if(!playerId)return err('Player not found');await d.collection('queue').updateOne({sessionId,playerId,status:{$in:['waiting','resting']}},{$set:{active:false,status:'left'}});return ok({ok:true})
  }
  if(path[2]==='rest'&&method==='POST'){adminOnly();const playerId=(await d.collection('players').findOne({userId:oid(user!.id)}))?._id;if(!playerId)return err('Player not found');await d.collection('queue').updateOne({sessionId,playerId,status:'waiting'},{$set:{status:'resting'}});return ok({ok:true})}
  if(path[2]==='return'&&method==='POST'){adminOnly();const playerId=(await d.collection('players').findOne({userId:oid(user!.id)}))?._id;if(!playerId)return err('Player not found');await d.collection('queue').updateOne({sessionId,playerId,status:'resting'},{$set:{status:'waiting',joinedAt:now()}});return ok({ok:true})}
  if(path[2]==='assign'&&method==='POST'){
   adminOnly();if(session.status!=='active')return conflict('Enable this Open Play session before assigning matches');const courtId=oid(body.courtId);if(!session.courtIds.some((x:ObjectId)=>x.equals(courtId)))return err('Court not in session');
   return ok(await transaction(async tx=>{
    const busy=await d.collection('matches').findOne({courtId,status:'playing'},{session:tx});if(busy)throw Error('Court is busy');
    const waiting=await d.collection('queue').find({sessionId,active:true,status:'waiting'},{session:tx}).sort({joinedAt:1}).limit(100).toArray();if(waiting.length<4)throw Error('Need four waiting players');
    const chosen=session.queuePolicy==='fifo'?selectFifoGroup(waiting):waiting.slice(0,4);const players=await d.collection('players').find({_id:{$in:chosen.map(x=>x.playerId)}},{session:tx}).toArray();const byId=new Map(players.map(x=>[String(x._id),x]));const ordered=chosen.map(x=>({...byId.get(String(x.playerId))!,rating:({beginner:1,intermediate:3,advanced:5} as Record<string,number>)[x.skillLevel]||byId.get(String(x.playerId))?.rating||3}));
    const teams=teamsForFour(ordered,session.teamPolicy==='balanced'?'balanced':session.teamPolicy==='random'?'random':'fixed');
    const r=await d.collection('matches').insertOne({context:'open',sessionId,courtId,teams:teams.map(x=>x.map(oid)),status:'playing',createdAt:now(),startedAt:now(),target:11,winBy:2},{session:tx});
    const upd=await d.collection('queue').updateMany({_id:{$in:chosen.map(x=>x._id)},status:'waiting'},{$set:{status:'playing',matchId:r.insertedId}},{session:tx});if(upd.modifiedCount!==4)throw Error('Queue changed, retry');return {matchId:String(r.insertedId),teams};
   }));
  }
 }
 if(path[0]==='matches'&&path[1]){
  const matchId=oid(path[1]);const match=await d.collection('matches').findOne({_id:matchId});if(!match)return err('Match not found',404);
  if(method==='GET')return ok(match);
  if(path[2]==='complete'&&method==='POST'){
   adminOnly();const a=Number(body.scoreA),b=Number(body.scoreB);if(!scoreValid(a,b,match.target||11,match.winBy||2))return err('Invalid final score');
   return ok(await transaction(async tx=>{
    const changed=await d.collection('matches').updateOne({_id:matchId,status:'playing'},{$set:{status:'completed',scoreA:a,scoreB:b,winner:a>b?0:1,completedAt:now()}},{session:tx});if(!changed.modifiedCount)throw Error('Match already completed');
    if(match.context==='open'){
     const ids=match.teams.flat();await d.collection('queue').updateMany({sessionId:match.sessionId,playerId:{$in:ids},status:'playing'},{$set:{status:'waiting',joinedAt:now()},$inc:{gamesPlayed:1}},{session:tx});
     const s=await d.collection('sessions').findOne({_id:match.sessionId},{session:tx});
     if(s?.queuePolicy==='winner'){
      const winIds=match.teams[a>b?0:1];await d.collection('queue').updateMany({sessionId:match.sessionId,playerId:{$in:winIds}},{$set:{joinedAt:new Date(0)}},{session:tx});
     }
    }
    if(match.context==='tournament')await applyTournamentResult(d,match,a>b?0:1,tx);
    return {ok:true};
   }));
  }
 }
 if(path[0]==='tournaments'){
  if(method==='GET'&&path.length===1)return ok(await d.collection('tournaments').find(visible).sort({createdAt:-1}).toArray());
  if(method==='POST'&&path.length===1){adminOnly();const format=String(body.format||'round');if(!['round','single','double'].includes(format))return err('Invalid format');const r=await d.collection('tournaments').insertOne({name:String(body.name||'Tournament'),format,status:'registration',target:11,winBy:2,createdAt:now()});return ok({id:String(r.insertedId)},201)}
  if(!path[1])return err('Tournament ID required');const tournamentId=oid(path[1]);const t=await d.collection('tournaments').findOne({_id:tournamentId,...visible});if(!t)return err('Tournament not found',404);
  if(method==='GET'&&path.length===2){const [entries,matches]=await Promise.all([d.collection('entries').find({tournamentId}).toArray(),d.collection('matches').find({tournamentId}).sort({round:1,createdAt:1}).toArray()]);return ok({tournament:t,entries,matches})}
  if(path.length===2&&method==='DELETE'){adminOnly();if(await d.collection('matches').findOne({tournamentId,status:'playing'}))return conflict('Finish active tournament matches before deleting');await d.collection('tournaments').updateOne({_id:tournamentId},{$set:{status:'cancelled',deletedAt:now()}});return ok({ok:true})}
  if(path[2]==='register'&&method==='POST'){adminOnly();
   if(t.status!=='registration')return err('Registration closed');const playerIds=arr(body.playerIds).map(oid);if(playerIds.length!==2||playerIds[0].equals(playerIds[1]))return err('Two distinct players required');
   if(!admin){const mine=await d.collection('players').findOne({userId:oid(user!.id)});if(!mine||!playerIds.some((x:ObjectId)=>x.equals(mine._id)))return err('You must be on the team',403)}
   const exists=await d.collection('entries').findOne({tournamentId,playerIds:{$in:playerIds}});if(exists)return err('Player already registered',409);
   const r=await d.collection('entries').insertOne({tournamentId,playerIds,createdAt:now()});return ok({id:String(r.insertedId)},201)
  }
  if(path[2]==='generate'&&method==='POST'){
   adminOnly();if(t.status!=='registration')return err('Already generated');const entries=await d.collection('entries').find({tournamentId}).toArray();if(entries.length<2)return err('At least two teams required');
   const ids=entries.map(x=>String(x._id));let matches:any[]=[];let bracket:any=null;
   if(t.format==='round')matches=roundRobin(ids).map((x,i)=>({...x,round:1,position:i,status:'pending'}));
   if(t.format==='single'){bracket=singleElimination(ids);matches=bracket[0].filter((x:any)=>x.a&&x.b).map((x:any,i:number)=>({...x,round:1,position:i,status:'pending'}));}
   if(t.format==='double'){bracket=doubleElimination(ids);matches=nextDoubleRound(bracket).map((x,i)=>({...x,round:1,position:i,status:'pending'}));}
   await transaction(async tx=>{const update=await d.collection('tournaments').updateOne({_id:tournamentId,status:'registration'},{$set:{status:'active',bracket,round:1}},{session:tx});if(!update.modifiedCount)throw Error('Tournament already generated');if(matches.length)await d.collection('matches').insertMany(matches.map(x=>({...x,context:'tournament',tournamentId,teams:[oid(x.a),oid(x.b)],status:'pending',target:11,winBy:2,createdAt:now()})),{session:tx});});return ok({ok:true,matches:matches.length});
  }
  if(path[2]==='schedule'&&method==='POST'){
   adminOnly();const courtId=oid(body.courtId);return ok(await transaction(async tx=>{if(await d.collection('matches').findOne({courtId,status:'playing'},{session:tx}))throw Error('Court busy');const m=await d.collection('matches').findOneAndUpdate({tournamentId,status:'pending'},{$set:{courtId,status:'playing',startedAt:now()}},{session:tx,returnDocument:'after',sort:{round:1,position:1}});if(!m)throw Error('No pending matches');return {matchId:String(m._id)};}));
  }
 }
 if(path[0]==='display'&&method==='GET'){const [courts,matches]=await Promise.all([d.collection('courts').find().toArray(),d.collection('matches').find({status:'playing'}).toArray()]);return ok({courts,matches})}
 return err('Route not found',404);
 }catch(e:any){console.error('API error',e);if(e.message==='ADMIN_ONLY')return err('Admin access required',403);if(e.code===11000)return err('Duplicate record',409);return err(e.message||'Server error',500)}}
async function applyTournamentResult(d:any,match:any,winner:number,tx:ClientSession){
 const t=await d.collection('tournaments').findOne({_id:match.tournamentId},{session:tx});if(!t)return;
 const roundMatches=await d.collection('matches').find({tournamentId:match.tournamentId,round:match.round},{session:tx}).toArray();if(roundMatches.some((x:any)=>x.status!=='completed'))return;
 if(t.format==='round'){await d.collection('tournaments').updateOne({_id:t._id},{$set:{status:'completed'}},{session:tx});return;}
 if(t.format==='single'){
  const winners=roundMatches.map((x:any)=>String(x.teams[x.winner]));
  if(winners.length===1){await d.collection('tournaments').updateOne({_id:t._id},{$set:{status:'completed',champion:winners[0]}},{session:tx});return;}
  const next=[];for(let i=0;i+1<winners.length;i+=2)next.push({a:winners[i],b:winners[i+1]});
  if(next.length)await d.collection('matches').insertMany(next.map((x,i)=>({context:'tournament',tournamentId:t._id,teams:[oid(x.a),oid(x.b)],round:match.round+1,position:i,status:'pending',target:11,winBy:2,createdAt:now()})),{session:tx});
 }
 if(t.format==='double'){
  const state=t.bracket;for(const m of roundMatches){const loser=String(m.teams[m.winner===0?1:0]);state.losses[loser]++;state.history.push({winner:String(m.teams[m.winner]),loser});}
  state.round++;
  const live=state.entries.filter((id:string)=>state.losses[id]<2);
  if(live.length===1){state.champion=live[0];await d.collection('tournaments').updateOne({_id:t._id},{$set:{bracket:state,status:'completed',champion:live[0]}},{session:tx});return;}
  const next=nextDoubleRound(state);await d.collection('tournaments').updateOne({_id:t._id},{$set:{bracket:state,round:state.round+1}},{session:tx});if(next.length)await d.collection('matches').insertMany(next.map((x:any,i:number)=>({context:'tournament',tournamentId:t._id,teams:[oid(x.a),oid(x.b)],round:match.round+1,position:i,status:'pending',target:11,winBy:2,createdAt:now()})),{session:tx});
 }
}
export const GET=handler;export const POST=handler;export const PATCH=handler;export const DELETE=handler;
