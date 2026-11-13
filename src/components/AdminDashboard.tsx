import { useEffect, useState } from 'react';
import type { Role } from '../data/ops';
import '../styles/admin.css';

async function api(path: string) {
  const response = await fetch(path);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

const CMS_CARDS = {
  reservations: {
    tone: 'terra',
    icon: '◷',
    blurb: 'Confirm tables and notes',
  },
  menu: {
    tone: 'green',
    icon: '☰',
    blurb: 'Dishes, prices & tags',
  },
  events: {
    tone: 'gold',
    icon: '✦',
    blurb: 'Homepage what’s on',
  },
  gallery: {
    tone: 'cream',
    icon: '▣',
    blurb: 'Photos on gallery page',
  },
} as const;

export default function AdminDashboard({ role, name }: { role: Role; name: string }) {
  const [stats, setStats] = useState<{
    pendingToday: number;
    upcomingReservations: number;
    menuVisible: number;
    galleryVisible: number;
    upcomingEvents: number;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/admin/stats')
      .then((data) => setStats(data.stats))
      .catch((err) => setError(err.message));
  }, []);

  const cards: {
    href: string;
    title: string;
    key: keyof typeof CMS_CARDS;
    stat: string;
    sub: string;
    show: boolean;
  }[] = [
    {
      href: '/admin/reservations',
      title: 'Reservations',
      key: 'reservations',
      stat: stats ? String(stats.pendingToday) : '—',
      sub: stats ? `${stats.upcomingReservations} upcoming` : 'Loading…',
      show: true,
    },
    {
      href: '/admin/menu',
      title: 'Menu',
      key: 'menu',
      stat: stats ? String(stats.menuVisible) : '—',
      sub: 'visible dishes',
      show: role === 'owner',
    },
    {
      href: '/admin/events',
      title: 'Events',
      key: 'events',
      stat: stats ? String(stats.upcomingEvents) : '—',
      sub: 'upcoming published',
      show: role === 'owner',
    },
    {
      href: '/admin/gallery',
      title: 'Gallery',
      key: 'gallery',
      stat: stats ? String(stats.galleryVisible) : '—',
      sub: 'live photos',
      show: role === 'owner',
    },
  ];

  return (
    <div className="desk desk--dashboard">
      <header className="desk__top desk__top--dash">
        <div>
          <p className="eyebrow">Zin &amp; Gin Admin</p>
          <h1>Content desk</h1>
          <p className="lead">
            Signed in as <strong>{name}</strong> · {role}
          </p>
        </div>
        <button
          type="button"
          className="btn btn--light"
          onClick={async () => {
            await fetch('/api/admin/logout', { method: 'POST' });
            location.href = '/admin';
          }}
        >
          Sign out
        </button>
      </header>
      {error ? <p className="desk__error">{error}</p> : null}
      <p className="dash-intro">Choose a section to manage. Changes on Menu, Events and Gallery appear on the public site when saved.</p>
      <div className="dash-cards">
        {cards
          .filter((card) => card.show)
          .map((card) => {
            const meta = CMS_CARDS[card.key];
            return (
              <a key={card.href} className={`dash-card dash-card--${meta.tone}`} href={card.href}>
                <span className="dash-card__icon" aria-hidden>
                  {meta.icon}
                </span>
                <div className="dash-card__body">
                  <h2>{card.title}</h2>
                  <p className="dash-card__blurb">{meta.blurb}</p>
                </div>
                <div className="dash-card__stat">
                  <strong>{card.stat}</strong>
                  <span>{card.sub}</span>
                </div>
                <span className="dash-card__arrow" aria-hidden>
                  →
                </span>
              </a>
            );
          })}
      </div>
    </div>
  );
}
