import { MongoClient, Db } from 'mongodb';
const uri=process.env.MONGODB_URI;
const globalCache=globalThis as typeof globalThis & { _mongoClient?:Promise<MongoClient> };
export async function db():Promise<Db>{
 if(!uri) throw new Error('MONGODB_URI is missing');
 if(!globalCache._mongoClient) globalCache._mongoClient=new MongoClient(uri,{maxPoolSize:10}).connect();
 return (await globalCache._mongoClient).db(process.env.MONGODB_DB||'pickleball_hub');
}
export async function indexes(){const d=await db(); await Promise.all([
 d.collection('users').createIndex({email:1},{unique:true}),
 d.collection('sessionPlayers').createIndex({sessionId:1,playerId:1},{unique:true}),
 d.collection('queue').createIndex({sessionId:1,playerId:1},{unique:true,partialFilterExpression:{active:true}}),
 d.collection('queue').createIndex({sessionId:1,active:1,joinedAt:1}),
 d.collection('matches').createIndex({courtId:1,status:1}),
 d.collection('matches').createIndex({courtId:1},{unique:true,partialFilterExpression:{status:'playing',courtId:{$type:'objectId'}}}),
 d.collection('entries').createIndex({divisionId:1,playerIds:1}),
 d.collection('courts').createIndex({name:1},{unique:true}),
 ]);}

export async function mongoClient():Promise<MongoClient>{await db();return await globalCache._mongoClient!;}
