// FIFO with compatibility: oldest player is always included, then seek compatible players.
// Never skip the oldest player; if there are fewer than 4 compatible players, fill by arrival.
export type QueueEntry={joinedAt:Date|string;skillLevel?:string;playStyle?:string};
export function selectFifoGroup<T extends QueueEntry>(waiting:T[]):T[]{
 const ordered=[...waiting].sort((a,b)=>new Date(a.joinedAt).getTime()-new Date(b.joinedAt).getTime());
 if(ordered.length<4)return [];
 const first=ordered[0];const chosen=[first];const remaining=ordered.slice(1);
 const score=(q:T)=>{const skill=['beginner','intermediate','advanced'];const a=skill.indexOf(first.skillLevel||'beginner'),b=skill.indexOf(q.skillLevel||'beginner');return (first.playStyle===q.playStyle?0:3)+Math.abs(a-b)};
 // Strict compatibility first, then adjacent skill levels, then fallback to FIFO.
 for(const q of remaining){if(chosen.length===4)break;if(score(q)===0)chosen.push(q)}
 for(const q of remaining){if(chosen.length===4)break;if(!chosen.includes(q)&&score(q)<=1)chosen.push(q)}
 for(const q of remaining){if(chosen.length===4)break;if(!chosen.includes(q))chosen.push(q)}
 return chosen;
}
