import './globals.css';import Link from 'next/link';
export const metadata={title:'Pickleball Hub',description:'Open Play queues and tournament management'};
export default function Root({children}:{children:React.ReactNode}){return <html lang="en"><body><header><strong>🏓 PICKLEBALL HUB</strong><nav><Link href="/">Home</Link><Link href="/player">Player</Link><Link href="/admin">Admin</Link><Link href="/display">Court Display</Link><Link href="/login">Login</Link></nav></header>{children}</body></html>}
