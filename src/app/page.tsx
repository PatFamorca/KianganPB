import Image from 'next/image';
import Link from 'next/link';
import InstallPWA from '@/components/InstallPWA';
import MySessions from '@/components/MySessions';

export default function Home() {
  return <main className="home-page self-home">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-content">
        <span className="home-eyebrow">🏓 KIANGAN PICKLEBALL · OPEN PLAY ORGANIZER</span>
        <h1 id="home-title">Play! Connect! Stay Active!</h1>
        <p>Run your own Open Play in minutes. Add players, set up courts, rotate teams fairly, and return to saved sessions anytime — no account required.</p>
        <div className="home-hero-buttons">
          <Link className="home-action-link self-primary" href="/create">＋ Create Open Play</Link>
          <a className="home-action-link home-link-outline" href="#saved-sessions">My saved sessions</a>
        </div>
        <InstallPWA />
        <div className="home-schedule"><strong>Everything you need on court</strong><span>✓ Player skills and play styles</span><span>✓ Automatic or manual court assignments</span><span>✓ Live scores, rotations and leaderboard</span><small>Your sessions are saved to this device and MongoDB.</small></div>
      </div>
      <div className="home-hero-poster"><Image src="/kiangan-open-play-poster.png" alt="Kiangan Pickleball community poster" width={1024} height={1536} sizes="(max-width: 780px) 100vw, 440px" priority className="home-poster" /></div>
    </section>
    <section id="saved-sessions" className="self-home-sessions" aria-label="Saved Open Play sessions"><MySessions /></section>
  </main>;
}
