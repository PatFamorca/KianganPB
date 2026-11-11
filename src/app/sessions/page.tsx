import Link from 'next/link';
import MySessions from '@/components/MySessions';
export default function SessionsPage(){return <main className="self-main self-sessions-page"><div className="self-heading"><div><p className="self-muted">YOUR OPEN PLAY</p><h1>My Sessions</h1><p className="self-muted">Resume or manage sessions saved on this device.</p></div><Link className="self-primary self-nav-action" href="/create">+ New session</Link></div><MySessions /></main>}
