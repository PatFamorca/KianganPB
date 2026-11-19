import './globals.css';
import Link from 'next/link';
import PWARegister from '@/components/PWARegister';
import { Analytics } from '@vercel/analytics/next';
export const metadata={title:'Kiangan Pickleball | Open Play Organizer',description:'Create and manage your own pickleball open play sessions',manifest:'/manifest.webmanifest',applicationName:'Kiangan Pickleball',appleWebApp:{capable:true,title:'Kiangan Pickleball',statusBarStyle:'default'},formatDetection:{telephone:false},icons:{icon:[{url:'/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icon-512.png',sizes:'512x512',type:'image/png'}],apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]}};
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#124c39'};
export default function Root({children}:{children:React.ReactNode}){return <html lang="en"><body><PWARegister/><header className="site-header"><Link href="/" className="site-brand">🏓 Kiangan <strong>Pickleball</strong></Link><nav className="site-nav"><Link href="/">Home</Link><Link href="/sessions">My Sessions</Link><Link href="/create">Create</Link></nav></header>{children}<footer className="site-footer">Kiangan Pickleball · Organize. Rotate. Play.</footer><Analytics /></body></html>}
