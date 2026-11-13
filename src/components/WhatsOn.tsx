import { useEffect, useState } from 'react';
import type { EventRecord } from '../data/ops';
import { mediaSrc } from '../lib/media';

function formatEventDate(iso: string) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
  } catch {
    return iso;
  }
}

function reserveHref(event: EventRecord) {
  const params = new URLSearchParams({
    event: event.name,
    date: event.date,
  });
  return `/reserve?${params.toString()}`;
}

export default function WhatsOn() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [active, setActive] = useState<EventRecord | null>(null);

  useEffect(() => {
    fetch('/api/events')
      .then((response) => response.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <section className="whats section" id="whats-on" data-surface="light" aria-labelledby="whats-title">
      <div className="container">
        <header className="whats__head">
          <p className="eyebrow eyebrow--terra">The board</p>
          <h2 id="whats-title" className="h1">What&apos;s happening at Zin &amp; Gin?</h2>
        </header>
        {events.length === 0 ? (
          <p>Nothing posted this week. The table is still open.</p>
        ) : (
          <div className="whats__grid">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                {event.image && (
                  <div className="event-card__media">
                    <img src={mediaSrc(event.image, 900)} alt="" />
                  </div>
                )}
                <div className="event-card__body">
                  <p className="event-card__date">{formatEventDate(event.date)}</p>
                  <h3 className="event-card__title">{event.name}</h3>
                  <p className="event-card__desc">{event.description}</p>
                  <button type="button" className="event-card__cta" onClick={() => setActive(event)}>
                    View event →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div className="event-modal" role="presentation" onClick={() => setActive(null)}>
          <dialog className="event-modal__panel" open aria-labelledby="event-modal-title" onClick={(e) => e.stopPropagation()}>
            {active.image && (
              <div className="event-modal__media">
                <img src={mediaSrc(active.image, 1000)} alt="" />
              </div>
            )}
            <div className="event-modal__body">
              <p className="event-card__date">{formatEventDate(active.date)}</p>
              <h3 id="event-modal-title" className="event-card__title">{active.name}</h3>
              <p className="event-card__desc">{active.description}</p>
              <div className="event-modal__actions">
                <a className="btn" href={reserveHref(active)}>
                  Reserve a table <span className="arrow">→</span>
                </a>
                <button type="button" className="link-arrow" onClick={() => setActive(null)}>
                  Close
                </button>
              </div>
            </div>
          </dialog>
        </div>
      )}

      <style>{`
        .whats { background: var(--ivory); color: var(--petrol); }
        .whats__head { max-width: 40rem; margin-bottom: clamp(2rem, 5vw, 3.5rem); }
        .whats__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 18.5rem), 1fr));
          gap: 1rem;
          align-items: stretch;
        }
        .event-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: 18px;
          background: var(--cream);
          box-shadow: inset 0 0 0 1px rgba(6, 76, 79, 0.08);
          overflow: hidden;
          transition: transform 0.5s var(--ease-out);
        }
        .event-card:hover { transform: translateY(-4px); }
        .event-card__media { padding: 0.65rem 0.75rem 0; }
        .event-card__media img {
          display: block;
          width: 100%;
          height: 11.25rem;
          object-fit: cover;
          border-radius: 12px;
        }
        .event-card__body {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
          gap: 0.55rem;
          padding: 0.85rem 0.75rem 1.35rem;
          text-align: left;
        }
        .event-card__date {
          margin: 0;
          width: 100%;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(6, 76, 79, 0.55);
        }
        .event-card__title {
          margin: 0;
          width: 100%;
          font-family: var(--serif);
          font-size: clamp(1.45rem, 2.2vw, 1.8rem);
          font-weight: 500;
          line-height: 1.12;
          text-wrap: balance;
        }
        .event-card__desc {
          margin: 0;
          width: 100%;
          line-height: 1.62;
          color: var(--ink-soft);
          font-size: 0.95rem;
          text-align: left;
          text-wrap: pretty;
        }
        .event-card__cta {
          margin-top: auto;
          border: 0;
          background: none;
          padding: 0.35rem 0;
          color: var(--petrol);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.72rem;
          cursor: pointer;
        }
        .event-modal {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: grid;
          place-items: center;
          padding: 1rem;
          background: rgba(4, 57, 59, 0.55);
        }
        .event-modal__panel {
          width: min(520px, 100%);
          max-height: min(90vh, 720px);
          overflow: auto;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: var(--cream);
          color: var(--petrol);
        }
        .event-modal__media img {
          display: block;
          width: 100%;
          max-height: 240px;
          object-fit: cover;
        }
        .event-modal__body {
          display: grid;
          gap: 0.75rem;
          padding: 1.15rem 1.25rem 1.35rem;
        }
        .event-modal__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          align-items: center;
          margin-top: 0.35rem;
        }
      `}</style>
    </section>
  );
}
