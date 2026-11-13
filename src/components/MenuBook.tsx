import { useEffect, useRef, useState } from 'react';
import type { BookPage } from '../data/ops';
import { formatPrice } from '../data/menu';
import { posEntry } from '../data/ordering';
import { mediaSrc } from '../lib/media';
import { DietaryLegend, DietaryTags } from './DietaryTags';
import '../styles/menu-book.css';

function Sheet({ page }: { page: BookPage }) {
  return (
    <article className="sheet">
      <header>
        <p>{page.kicker}</p>
        <h2>{page.title}</h2>
      </header>
      {page.image && <img className="sheet__photo" src={mediaSrc(page.image, 800)} alt="" />}
      {page.groups.map((group) => (
        <section key={group.id}>
          <h3>{group.label}</h3>
          <ul>
            {group.items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>
                    {item.name}
                    <DietaryTags tags={item.tags} />
                  </strong>
                  {item.description && <p>{item.description}</p>}
                </div>
                <span className="price">{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}

function Blank() {
  return (
    <article className="sheet">
      <header>
        <p>Zin & Gin</p>
        <h2>That’s the menu.</h2>
      </header>
      <p>Ask us if you want the kitchen to cook for a party.</p>
    </article>
  );
}

export default function MenuBook() {
  const [pages, setPages] = useState<BookPage[] | null>(null);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(0);
  const [wide, setWide] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null);
  const [hot, setHot] = useState(false);
  const [anim, setAnim] = useState(true);
  const timer = useRef<number>(0);
  const touchX = useRef(0);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/menu', { signal: ac.signal })
      .then((response) => response.json())
      .then((data) => setPages(data.pages ?? []))
      .catch(() => setError('The menu could not be opened. Refresh and try again.'));
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const desk = window.matchMedia('(min-width: 860px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setWide(desk.matches);
      setReduced(motion.matches);
    };
    sync();
    desk.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    return () => {
      desk.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    setCursor((value) => (wide ? value - (value % 2) : value));
  }, [wide]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const step = wide ? 2 : 1;
  const list = pages ?? [];
  const atStart = cursor <= 0;
  const atEnd = cursor + step >= list.length;

  function go(direction: 1 | -1) {
    if (turning || !list.length) return;
    const next = cursor + direction * step;
    if (next < 0 || next >= list.length) return;
    if (reduced) {
      setCursor(next);
      return;
    }
    setHot(false);
    setTurning(direction > 0 ? 'next' : 'prev');
    requestAnimationFrame(() => requestAnimationFrame(() => setHot(true)));
    timer.current = window.setTimeout(() => {
      setAnim(false);
      setCursor(next);
      setTurning(null);
      setHot(false);
      requestAnimationFrame(() => setAnim(true));
    }, 760);
  }

  function onKey(event: React.KeyboardEvent) {
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  }

  const left = list[cursor];
  const right = list[cursor + 1];
  const upcomingLeft = list[cursor + 2];
  const upcomingRight = list[cursor + 3];
  const previousLeft = list[cursor - 2];
  const previousRight = list[cursor - 1];
  const label = wide
    ? `${Math.floor(cursor / 2) + 1} / ${Math.max(1, Math.ceil(list.length / 2))}`
    : `${cursor + 1} / ${Math.max(1, list.length)}`;

  return (
    <div className="book-page" data-surface="light">
      <header className="container book-head">
        <div>
          <p className="eyebrow eyebrow--terra">The menu · for reading</p>
          <h1 className="h1">Browse the menu here</h1>
          <p className="lede">Turn the pages, check dietary icons — ordering happens on BonAppio.</p>
          <DietaryLegend />
        </div>
        <div className="book-head__actions">
          <a className="btn" href={posEntry()}>
            Order for pickup <span className="arrow arrow--diag">↗</span>
          </a>
        </div>
      </header>

      <div className="container book-stage">
        {error && <p role="alert">{error}</p>}
        {!pages && !error && <p>Opening the menu…</p>}
        {pages && (
          <>
            <div
              className="book"
              tabIndex={0}
              role="region"
              aria-label="Menu book"
              onKeyDown={onKey}
              onTouchStart={(event) => {
                touchX.current = event.changedTouches[0].clientX;
              }}
              onTouchEnd={(event) => {
                const delta = event.changedTouches[0].clientX - touchX.current;
                if (delta > 48) go(-1);
                if (delta < -48) go(1);
              }}
            >
              <div className="book__spread book__pane">{left ? <Sheet page={left} /> : <Blank />}</div>
              <div className="book__spread book__pane">
                {turning === 'next' && (upcomingRight ? <Sheet page={upcomingRight} /> : <Blank />)}
                {turning === 'prev' && previousLeft && <Sheet page={previousLeft} />}
                {!turning && (right ? <Sheet page={right} /> : <Blank />)}
                {turning === 'next' && right && (
                  <div className={`leaf leaf--next ${anim ? '' : 'no-anim'} ${hot ? 'is-turning' : ''}`}>
                    <div className="face face--front">
                      <Sheet page={right} />
                    </div>
                    <div className="face face--back">{upcomingLeft ? <Sheet page={upcomingLeft} /> : <Blank />}</div>
                  </div>
                )}
                {turning === 'prev' && left && (
                  <div className={`leaf leaf--prev ${anim ? '' : 'no-anim'} ${hot ? 'is-turning' : ''}`} style={{ position: 'absolute', inset: '0 auto 0 -100%', width: '100%' }}>
                    <div className="face face--front">
                      <Sheet page={left} />
                    </div>
                    <div className="face face--back">{previousRight ? <Sheet page={previousRight} /> : <Blank />}</div>
                  </div>
                )}
              </div>
              <div className="book__single">{list[cursor] ? <Sheet page={list[cursor]} /> : <Blank />}</div>
            </div>
            <div className="book-nav">
              <button type="button" onClick={() => go(-1)} disabled={atStart}>
                Previous
              </button>
              <p aria-live="polite">{label}</p>
              <button type="button" onClick={() => go(1)} disabled={atEnd}>
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <aside className="container menu-allergy" aria-label="Allergen information">
        <p>
          <strong>Allergies &amp; dietary needs:</strong> Icons mark vegetarian, vegan, gluten, nuts and spice level where
          relevant. Please tell us about allergies when you order or reserve — the team can guide you dish by dish.
        </p>
      </aside>
    </div>
  );
}
