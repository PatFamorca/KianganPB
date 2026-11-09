import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-intro" aria-labelledby="home-title">
        <span className="home-eyebrow">Kiangan Pickleball Community</span>
        <h1 id="home-title">Play! Connect! Stay Active!</h1>
        <p>Join your neighbors for friendly doubles, fair court rotation, and a great time on court.</p>
      </section>
      <section className="home-poster-section" aria-label="Open Play schedule and house rules">
        <Image
          src="/kiangan-open-play-poster.png"
          alt="Pickleball Open Play at Kiangan Gym for Kiangan residents. Monday, Wednesday and Friday 6:30 PM to 8:00 PM; Saturday 5:00 PM to 7:00 PM. House rules: residents only, register upon arrival, use the paddle queue, play doubles, rotate when others are waiting, share court time, respect all players, observe etiquette, care for equipment and keep the area clean."
          width={1024}
          height={1536}
          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 75vw, 800px"
          priority
          className="home-poster"
        />
      </section>
      <section className="home-actions" aria-label="Get started">
        <article className="home-action-card">
          <span aria-hidden="true" className="home-action-icon">🏓</span>
          <h2>Join Open Play</h2>
          <p>Choose your session, set your skill level and play style, and join the queue.</p>
          <Link className="home-action-link" href="/open-play">Join the queue</Link>
        </article>
        <article className="home-action-card">
          <span aria-hidden="true" className="home-action-icon">📺</span>
          <h2>Live Courts</h2>
          <p>See court availability, ongoing games, the waiting queue and winner rankings.</p>
          <Link className="home-action-link" href="/display">View live courts</Link>
        </article>
        <article className="home-action-card">
          <span aria-hidden="true" className="home-action-icon">🏆</span>
          <h2>Tournaments</h2>
          <p>Check tournament schedules, teams and results.</p>
          <Link className="home-action-link" href="/tournaments">View tournaments</Link>
        </article>
      </section>
    </main>
  );
}
