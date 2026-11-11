import type { ObjectId } from 'mongodb';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
export const token=()=>randomBytes(32).toString('base64url');
export const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export const valid=(raw:string,stored:string)=>{const a=Buffer.from(hash(raw),'hex'),b=Buffer.from(stored,'hex');return a.length===b.length&&timingSafeEqual(a,b)};
export type Skill='beginner'|'intermediate'|'advanced';export type Style='casual'|'balanced'|'competitive';
export type Player={id:string,name:string,skill:Skill,style:Style,plays:number,wins:number,joined:number};
export type Match={id:string,court:number,teams:[string[],string[]],status:'playing'|'finished',score?:[number,number],createdAt:number};
export type Session={_id?:ObjectId,ownerHash:string,version:number,name:string,courts:number,rotation:'fifo'|'balanced'|'random'|'fixed',players:Player[],matches:Match[],nextMatches?:{court:number,teams:[string[],string[]]}[],createdAt:Date,updatedAt:Date};
export const uuid=()=>randomBytes(12).toString('hex');
export function choose(players:Player[],matches:Match[],rotation:Session['rotation']){const busy=new Set(matches.filter(m=>m.status==='playing').flatMap(m=>m.teams.flat()));let waiting=players.filter(p=>!busy.has(p.id));if(waiting.length<4)return null;
 waiting.sort((a,b)=>a.plays-b.plays||a.joined-b.joined);
 const min=waiting[0].plays;let pool=waiting.filter(p=>p.plays<=min+1);
 if(pool.length<4)pool=waiting;
 if(rotation==='random'){const head=pool.slice(0,Math.max(4,Math.min(pool.length,8)));for(let i=head.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[head[i],head[j]]=[head[j],head[i]]}pool=head;}
 const selected=pool.slice(0,4);
 const skill=(p:Player)=>({beginner:1,intermediate:2,advanced:3})[p.skill];
 if(rotation==='balanced'){const sorted=[...selected].sort((a,b)=>skill(a)-skill(b));return [[sorted[0].id,sorted[3].id],[sorted[1].id,sorted[2].id]] as [string[],string[]]}
 return [[selected[0].id,selected[1].id],[selected[2].id,selected[3].id]] as [string[],string[]];}
export function validScore(a:number,b:number){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&Math.max(a,b)>=11&&Math.abs(a-b)>=2}
