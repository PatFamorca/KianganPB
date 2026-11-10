import {db,mongoClient} from '@/lib/db';
import {ClientSession} from 'mongodb';

// 00:00 Monday in Asia/Manila = Sunday 16:00 UTC. Week keys are ISO Monday dates.
export function manilaWeekKey(date=new Date()):string {
 const shifted=new Date(date.getTime()+8*60*60*1000);
 const weekday=(shifted.getUTCDay()+6)%7;
 shifted.setUTCDate(shifted.getUTCDate()-weekday);
 return shifted.toISOString().slice(0,10);
}
export async function runWeeklyResets(date=new Date()) {
 const d=await db();const week=manilaWeekKey(date);
 const sessions=await d.collection('sessions').find({deletedAt:{$exists:false},weeklyResetEnabled:{$ne:false},createdAt:{$lt:date}}).toArray();
 const result={week,reset:[] as string[],pending:[] as string[],unchanged:[] as string[]};
 for(const s of sessions){
  // Never reset a session before the first Monday after it was created.
  const createdKey=manilaWeekKey(new Date(s.createdAt||date));
  if(createdKey>=week||s.lastResetWeek===week){result.unchanged.push(String(s._id));continue}
  const client=await mongoClient();const tx:ClientSession=client.startSession();
  try{
   const status=await tx.withTransaction(async()=>{
    const current=await d.collection('sessions').findOne({_id:s._id,deletedAt:{$exists:false}},{session:tx});
    if(!current||current.weeklyResetEnabled===false||current.lastResetWeek===week)return 'unchanged';
    if(await d.collection('matches').findOne({sessionId:s._id,status:'playing'},{session:tx}))return 'pending';
    const changed=await d.collection('sessions').updateOne({_id:s._id,lastResetWeek:{$ne:week},deletedAt:{$exists:false}},{$set:{lastResetWeek:week,lastResetAt:date},$inc:{resetCount:1}},{session:tx});
    if(!changed.modifiedCount)return 'unchanged';
    await d.collection('queue').updateMany({sessionId:s._id,active:true},{$set:{active:false,status:'cleared',clearedAt:date}},{session:tx});
    await d.collection('matches').updateMany({sessionId:s._id,archivedAt:{$exists:false}},{$set:{archivedAt:date}},{session:tx});
    await d.collection('guestClaims').deleteMany({sessionId:s._id},{session:tx});
    return 'reset';
   });
   result[status as 'reset'|'pending'|'unchanged'].push(String(s._id));
  }finally{await tx.endSession()}
 }
 return result;
}
