import Image from 'next/image';
import Link from 'next/link';
import InstallPWA from '@/components/InstallPWA';

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-content">
          <span className="home-eyebrow">Kiangan Pickleball Community</span>
          <h1 id="home-title">Play! Connect! Stay Active!</h1>
          <p>Friendly doubles, fair rotations, and a welcoming community. Pick a session, join the queue, and get on court.</p>
          <div className="home-hero-buttons">
            <Link className="home-action-link" href="/open-play">Join Open Play</Link>
            <Link className="home-action-link home-link-outline" href="/display">View Live Courts</Link>
          </div>
          <InstallPWA />
          <div className="home-schedule" aria-label="Weekly Open Play schedule">
            <strong>Weekly Open Play</strong>
            <span>Mon · Wed · Fri — 6:30–8:00 PM</span>
            <span>Saturday — 5:00–7:00 PM</span>
            <small>Kiangan Gym · See the poster for house rules</small>
          </div>
        </div>
        <div className="home-hero-poster" aria-label="Open Play poster and house rules">
          <Image src="/kiangan-open-play-poster.png" alt="Kiangan Pickleball Open Play schedule and house rules" width={1024} height={1536} sizes="(max-width: 780px) 100vw, 440px" priority className="home-poster" />
        </div>
      </section>
      <section className="home-actions" aria-label="Get started">
        <article className="home-action-card"><span className="home-action-icon" aria-hidden="true">🏓</span><h2>Open Play</h2><p>Choose your session and preferences, then join the waiting queue.</p><Link className="home-action-link" href="/open-play">Join the queue</Link></article>
        <article className="home-action-card"><span className="home-action-icon" aria-hidden="true">📺</span><h2>Live Courts</h2><p>Check available courts, live matches, queue positions, and rankings.</p><Link className="home-action-link" href="/display">See live courts</Link></article>
      </section>
    </main>
  );
}
