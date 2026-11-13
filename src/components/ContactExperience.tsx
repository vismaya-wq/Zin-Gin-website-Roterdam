import { useState } from 'react';
import { CONTACT_FAQ } from '../data/contact';
import { SITE } from '../data/site';
import { PATHS } from '../data/orderPaths';

const MAP_EMBED =
  'https://maps.google.com/maps?q=Zin+%26+Gin+Schiekade+730+3032+AL+Rotterdam&t=&z=16&ie=UTF8&iwloc=&output=embed';

function IconDirections() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l4 9H8l4-9z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="17" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5h14v10H9l-4 4V5z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function ContactExperience() {
  const [copied, setCopied] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="contact-xp">
      <header className="contact-hero">
        <div className="container">
          <p className="eyebrow eyebrow--terra">Contact</p>
          <h1 className="h1">
            <span className="line"><span>Say hello.</span></span>
            <span className="line"><span><em>We&apos;re easy to find.</em></span></span>
          </h1>
          <p className="lede">Ground floor of Hotel Teleport. Write, call, or come by.</p>
        </div>
      </header>

      <section className="container container--sym contact-actions" aria-labelledby="contact-actions-title">
        <h2 id="contact-actions-title" className="h3">How can we reach each other?</h2>
        <div className="contact-actions__grid">
          <a className="contact-action" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
            <IconDirections />
            <strong>Directions</strong>
          </a>
          <a className="contact-action" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
            <IconChat />
            <strong>WhatsApp</strong>
          </a>
          <a className="contact-action" href={`mailto:${SITE.email}`}>
            <IconMail />
            <strong>Email</strong>
          </a>
          <a className="contact-action" href={SITE.phoneHref} aria-label="Call Zin & Gin">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L17 12.5l4 1.5v3A2 2 0 0 1 19 19c-8 0-13-5-13-13a2 2 0 0 1 2-2z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <strong>Call</strong>
          </a>
        </div>
      </section>

      <div className="container container--sym contact-bento contact-bento--simple">
        <section className="contact-card contact-card--hours" aria-labelledby="contact-visit-title">
          <h2 id="contact-visit-title">Opening hours</h2>

          <div className="contact-hours-block contact-hours-block--dinner">
            <h3>
              <IconMoon /> Dinner
            </h3>
            <ul>
              {SITE.dinnerHours.map((row) => (
                <li key={row.days}>
                  <span>{row.days}</span>
                  <span>{row.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="contact-hours-block contact-hours-block--breakfast">
            <h3>
              <IconSun /> Breakfast
            </h3>
            <ul>
              {SITE.breakfastHours.map((row) => (
                <li key={row.days}>
                  <span>{row.days}</span>
                  <span>{row.time}</span>
                </li>
              ))}
            </ul>
          </div>

        </section>

        <section className="contact-card contact-card--map" aria-label="Map">
          <iframe title="Map — Zin & Gin" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={MAP_EMBED} />
        </section>
      </div>

      <section className="container container--sym contact-faq" aria-labelledby="contact-faq-title">
        <div className="contact-faq__inner">
          <h2 id="contact-faq-title" className="h3">FAQs <span className="contact-faq__mark">?</span></h2>
          <div className="contact-faq__list">
          {CONTACT_FAQ.map((item, index) => {
            const open = openFaq === index;
            const panelId = `contact-faq-panel-${item.id}`;
            return (
              <div key={item.id} className={`contact-faq__item${open ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="contact-faq__trigger"
                  aria-expanded={open}
                  aria-controls={panelId}
                  id={`contact-faq-trigger-${item.id}`}
                  onClick={() => setOpenFaq(open ? null : index)}
                >
                  {item.q}
                  <span aria-hidden="true">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className="contact-faq__answer" id={panelId} role="region" aria-labelledby={`contact-faq-trigger-${item.id}`}>
                    <p>{item.a}</p>
                    {item.afterCta === 'reserve' && (
                      <a className="link-arrow contact-faq__cta" href={PATHS.reserve}>
                        Reserve a Table <span className="arrow">→</span>
                      </a>
                    )}
                    {item.afterCta === 'instagram' && (
                      <p className="contact-faq__follow">
                        Send us a message through the contact form below or follow us on Instagram (
                        <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">{SITE.instagramHandle}</a>
                        ) to know more!
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </section>
    </div>
  );
}
