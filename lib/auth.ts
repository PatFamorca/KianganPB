import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';
import { ObjectId } from 'mongodb';
export type Identity={id:string;role:'admin'|'player';name:string};
function key(){const s=process.env.AUTH_SECRET;if(!s||s.length<32)throw new Error('AUTH_SECRET must be 32+ characters');return new TextEncoder().encode(s)}
export async function setLogin(u:Identity){const token=await new SignJWT(u).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(key());cookies().set('ph_session',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:604800});}
export async function identity():Promise<Identity|null>{try{const t=cookies().get('ph_session')?.value;if(!t)return null;const {payload}=await jwtVerify(t,key());const id=String(payload.id);const u=await(await db()).collection('users').findOne({_id:new ObjectId(id)});if(!u)return null;return {id,role:u.role,name:u.name};}catch{return null}}
export function isAdmin(u:Identity|null){return u?.role==='admin'}
