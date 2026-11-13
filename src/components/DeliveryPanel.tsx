import { SITE } from '../data/site';
import { uberEatsHref } from '../data/ordering';

const DELIVERY_PARTNERS = SITE.uberEatsUrl || uberEatsHref()
  ? [{ id: 'uber', label: 'Uber Eats', href: SITE.uberEatsUrl || uberEatsHref(), short: 'Uber' }]
  : [];

export default function DeliveryPanel() {
  return (
    <div className="delivery-panel step-in">
      <header className="delivery-panel__head">
        <p className="eyebrow">Delivery</p>
        <h2 className="h2">Get Zin &amp; Gin delivered.</h2>
        <p className="lede">
          Feeling lazy? Continue on Uber Eats. Ordering and payment happen there, not on this website.
        </p>
      </header>

      <div className="delivery-panel__cards">
        {DELIVERY_PARTNERS.map((partner, index) => (
          <a
            key={partner.id}
            className={`delivery-card delivery-card--${partner.id}`}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="delivery-card__num">0{index + 1}</span>
            <span className="delivery-card__brand">
              {partner.id === 'uber' ? (
                <>
                  <span>Uber</span> <b>Eats</b>
                </>
              ) : (
                <b>{partner.label}</b>
              )}
            </span>
            <span className="delivery-card__cta">
              Order on {partner.label} <span className="arrow arrow--diag">↗</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
