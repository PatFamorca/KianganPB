'use client';
import {useEffect} from 'react';
export default function PWARegister(){
 useEffect(()=>{
  if(!('serviceWorker' in navigator))return;
  const onLoad=()=>{navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(err=>console.warn('PWA service worker unavailable',err));};
  if(document.readyState==='complete')onLoad();else{window.addEventListener('load',onLoad);return()=>window.removeEventListener('load',onLoad);}
 },[]);
 return null;
}
