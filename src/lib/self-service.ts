import type { ObjectId } from 'mongodb';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
export const token=()=>randomBytes(32).toString('base64url');
export const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export const valid=(raw:string,stored:string)=>{const a=Buffer.from(hash(raw),'hex'),b=Buffer.from(stored,'hex');return a.length===b.length&&timingSafeEqual(a,b)};
export type Skill='beginner'|'intermediate'|'advanced';export type Style='casual'|'balanced'|'competitive';
export type Player={id:string,name:string,skill:Skill,style:Style,plays:number,wins:number,joined:number,active?:boolean};
export type Match={id:string,court:number,teams:[string[],string[]],status:'playing'|'finished',score?:[number,number],createdAt:number};
export type Session={_id?:ObjectId,ownerHash:string,slug?:string,viewerHash?:string,registrationOpen?:boolean,version:number,name:string,courts:number,rotation:'fifo'|'balanced'|'random'|'fixed',players:Player[],matches:Match[],createdAt:Date,updatedAt:Date,endedAt?:Date|null};
export const uuid=()=>randomBytes(12).toString('hex');
// Choose four players with fair participation, diverse teammates and opponents,
// and a penalty for immediately repeating the same quartet.
export function choose(players:Player[],matches:Match[],rotation:Session['rotation']){
 const busy=new Set(matches.filter(m=>m.status==='playing').flatMap(m=>m.teams.flat()));
 const waiting=players.filter(p=>p.active!==false&&!busy.has(p.id));
 if(waiting.length<4)return null;
 const recent=matches.slice(-Math.max(40,players.length*4));
 const partners=new Map<string,number>(),opponents=new Map<string,number>();
 const pair=(a:string,b:string)=>[a,b].sort().join('|');
 for(const m of matches){for(const team of m.teams){partners.set(pair(team[0],team[1]),(partners.get(pair(team[0],team[1]))||0)+1)}for(const a of m.teams[0])for(const b of m.teams[1])opponents.set(pair(a,b),(opponents.get(pair(a,b))||0)+1)}
 const lastSeen=new Map<string,number>();recent.forEach((m,i)=>m.teams.flat().forEach(id=>lastSeen.set(id,i)));
 const min=Math.min(...waiting.map(p=>p.plays));
 // Never allow a large games-played imbalance simply to improve pair diversity.
 const eligible=waiting.filter(p=>p.plays<=min+1);
 const pool=(eligible.length>=4?eligible:waiting).sort((a,b)=>a.plays-b.plays||((lastSeen.get(a.id)??-1)-(lastSeen.get(b.id)??-1))||a.joined-b.joined);
 const candidates=pool.slice(0,Math.min(12,pool.length));
 const level=(p:Player)=>({beginner:1,intermediate:2,advanced:3})[p.skill];
 let best:[string[],string[]]|null=null,bestScore=Infinity;
 const attempts=rotation==='fixed'?1:Math.min(1200,Math.max(120,candidates.length*80));
 for(let t=0;t<attempts;t++){
  const group=t===0?candidates.slice(0,4):[...candidates].sort(()=>Math.random()-.5).slice(0,4);
  if(group.length<4)continue;
  const permutations=rotation==='fixed'?[[0,1,2,3]]:[[0,1,2,3],[0,2,1,3],[0,3,1,2]];
  for(const ix of permutations){const a=group[ix[0]],b=group[ix[1]],c=group[ix[2]],d=group[ix[3]];
   const repeatPartner=(partners.get(pair(a.id,b.id))||0)+(partners.get(pair(c.id,d.id))||0);
   const repeatOpponent=[a,b].reduce((sum,x)=>sum+[c,d].reduce((n,y)=>n+(opponents.get(pair(x.id,y.id))||0),0),0);
   const last=recent.slice(-Math.max(3,Math.ceil(waiting.length/4)));
   const recentPartner=last.reduce((sum,m)=>sum+m.teams.filter(team=>team.includes(a.id)&&team.includes(b.id)||team.includes(c.id)&&team.includes(d.id)).length,0);
   const recentOpponent=last.reduce((sum,m)=>sum+([a,b].some(x=>m.teams[0].includes(x))&&[c,d].some(x=>m.teams[1].includes(x))?1:0),0);
   const games=group.reduce((sum,x)=>sum+x.plays-min,0);
   const wait=group.reduce((sum,x)=>sum+(lastSeen.get(x.id)??-1),0);
   const skillGap=Math.abs(level(a)+level(b)-level(c)-level(d));
   const score=games*45+repeatPartner*15+repeatOpponent*2+recentPartner*65+recentOpponent*4+wait*.04+(rotation==='balanced'?skillGap*6:0)+(rotation==='random'?Math.random()*12:0);
   if(score<bestScore){bestScore=score;best=[[a.id,b.id],[c.id,d.id]]}
  }
 }
 return best;
}
export function validScore(a:number,b:number){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&Math.max(a,b)>=11&&Math.abs(a-b)>=2}
