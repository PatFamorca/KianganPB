import './globals.css';
import Link from 'next/link';
import FooterAdmin from '@/components/FooterAdmin';
import PWARegister from '@/components/PWARegister';
export const metadata={title:'Kiangan Pickleball',description:'Play! Connect! Stay Active!',manifest:'/manifest.webmanifest',applicationName:'Kiangan Pickleball',appleWebApp:{capable:true,statusBarStyle:'default',title:'Kiangan PB'},icons:{icon:[{url:'/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icon-512.png',sizes:'512x512',type:'image/png'}],apple:'/icon-192.png'}};
export const viewport={width:'device-width',initialScale:1,themeColor:'#124c39'};
export default function Root({children}:{children:React.ReactNode}){
 return <html lang="en"><body><PWARegister/>
  <header className="site-header"><Link href="/" className="site-brand"><span aria-hidden="true">🏓</span><span>Kiangan <strong>Pickleball</strong></span></Link>
   <nav className="site-nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/open-play">Open Play</Link><Link href="/display">Courts</Link></nav>
  </header>{children}<footer className="site-footer">Kiangan Pickleball · Play! Connect! Stay Active! <FooterAdmin/></footer>
 </body></html>
}