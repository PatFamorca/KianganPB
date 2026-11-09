import './globals.css';import Link from 'next/link';
export const metadata={title:'Kiangan Pickleball',description:'Play! Connect! Stay Active!'};
export default function Root({children}:{children:React.ReactNode}){return <html lang="en"><body><header><strong>🏓 Kiangan Pickleball</strong><nav><Link href="/">Home</Link><Link href="/open-play">Open Play</Link><Link href="/tournaments">Tournaments</Link><Link href="/display">Court Display</Link></nav></header>{children}</body></html>}
