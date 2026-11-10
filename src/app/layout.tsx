import './globals.css';
import Link from 'next/link';
import PWARegister from '@/components/PWARegister';
export const metadata={title:'Kiangan Pickleball | Open Play Organizer',description:'Create and manage your own pickleball open play sessions',manifest:'/manifest.webmanifest',applicationName:'Kiangan Pickleball',icons:{icon:'/icon-192.png',apple:'/icon-192.png'}};
export const viewport={width:'device-width',initialScale:1,themeColor:'#124c39'};
export default function Root({children}:{children:React.ReactNode}){return <html lang="en"><body><PWARegister/><header className="site-header"><Link href="/" className="site-brand">🏓 Kiangan <strong>Pickleball</strong></Link><nav className="site-nav"><Link href="/">My sessions</Link><Link href="/create">New session</Link></nav></header>{children}<footer className="site-footer">Kiangan Pickleball · Organize. Rotate. Play.</footer></body></html>}
