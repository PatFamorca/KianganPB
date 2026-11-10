import './globals.css';
import Link from 'next/link';
import FooterAdmin from '@/components/FooterAdmin';
export const metadata={title:'Kiangan Pickleball',description:'Play! Connect! Stay Active!'};
export default function Root({children}:{children:React.ReactNode}){
 return <html lang="en"><body>
  <header className="site-header"><Link href="/" className="site-brand"><span aria-hidden="true">🏓</span><span>Kiangan <strong>Pickleball</strong></span></Link>
   <nav className="site-nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/open-play">Open Play</Link><Link href="/display">Courts</Link></nav>
  </header>{children}<footer className="site-footer">Kiangan Pickleball · Play! Connect! Stay Active! <FooterAdmin/></footer>
 </body></html>
}