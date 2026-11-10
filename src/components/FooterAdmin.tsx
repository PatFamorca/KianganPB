'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useEffect,useState} from 'react';

type User={name:string;role:string};
export default function FooterAdmin(){
 const pathname=usePathname();
 const router=useRouter();
 const [user,setUser]=useState<User|null>(null);
 const [loading,setLoading]=useState(false);
 const onAdminPage=pathname.startsWith('/admin');
 useEffect(()=>{
  if(!onAdminPage){setUser(null);return;}
  const controller=new AbortController();
  fetch('/api/v1/auth/me',{cache:'no-store',signal:controller.signal})
   .then(r=>r.ok?r.json():null)
   .then(data=>{if(!controller.signal.aborted)setUser(data?.user?.role==='admin'?data.user:null)})
   .catch(()=>{});
  return ()=>controller.abort();
 },[onAdminPage,pathname]);
 async function logout(){
  if(loading)return;
  setLoading(true);
  try{
   const response=await fetch('/api/v1/auth/logout',{method:'POST',cache:'no-store'});
   if(!response.ok)throw Error('Logout failed');
   setUser(null);
   router.replace('/admin/login');
   router.refresh();
  }catch{setLoading(false);window.alert('Unable to log out. Please try again.');}
 }
 return <span className="footer-admin">{user&&onAdminPage?
  <span className="footer-session"><span className="footer-user" title={`Signed in as ${user.name} (${user.role})`}>{user.name} <span className="footer-role">({user.role})</span></span><button type="button" className="footer-logout" disabled={loading} onClick={logout}>{loading?'Signing out…':'Logout'}</button></span>
  :<Link href="/admin">Admin</Link>}</span>;
}
