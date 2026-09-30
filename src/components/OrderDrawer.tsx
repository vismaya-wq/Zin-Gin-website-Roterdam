import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useStore } from '@nanostores/react';
import {
  $discount,
  $drawerOpen,
  $drawerView,
  $lines,
  $subtotal,
  $total,
  clearCart,
  closeDrawer,
  hydrateCart,
  setQty,
} from '../lib/cart';
import { formatPrice } from '../data/menu';
import { photo } from '../data/images';
import { submitPickupOrder } from '../lib/api';

function pickupSlots() {
  const slots = ['As soon as possible (± 30 min)'];
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
  start.setMinutes(start.getMinutes() + 30);
  for (let i = 0; i < 10; i++) {
    const slot = new Date(start.getTime() + i * 15 * 60 * 1000);
    if (slot.getHours() >= 23 || slot.getDate() !== now.getDate()) break;
    slots.push(slot.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }));
  }
  return slots;
}

export function QtyStepper({ id, qty, name }: { id: string; qty: number; name: string }) {
  return (
    <div className="qty" role="group" aria-label={`Quantity for ${name}`}>
      <button type="button" onClick={() => setQty(id, qty - 1)} aria-label={`Remove one ${name}`}>
        −
      </button>
      <span aria-live="polite">{qty}</span>
      <button type="button" onClick={() => setQty(id, qty + 1)} aria-label={`Add one ${name}`}>
        +
      </button>
    </div>
  );
}

export default function OrderDrawer() {
  const open = useStore($drawerOpen);
  const view = useStore($drawerView);
  const [ready, setReady] = useState(false);
  const storeLines = useStore($lines);
  const lines = ready ? storeLines : [];
  const subtotal = useStore($subtotal);
  const discount = useStore($discount);
  const total = useStore($total);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const slots = useMemo(() => (open ? pickupSlots() : []), [open]);

  useEffect(() => {
    hydrateCart();
    setReady(true);
  }, []);

  useEffect(() => {
    window.zgLockScroll?.(open);
    document.documentElement.classList.toggle('drawer-open', open);
    if (open) closeRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && closeDrawer();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const result = await submitPickupOrder({
        lines: lines.map(({ item, qty }) => ({ id: item.id, name: item.name, qty, unitPrice: item.price })),
        subtotal,
        discount,
        total,
        name: String(data.get('name')),
        phone: String(data.get('phone')),
        email: String(data.get('email')),
        pickupTime: String(data.get('pickupTime')),
      });
      setReference(result.reference);
      setPickupTime(String(data.get('pickupTime')));
      clearCart();
      $drawerView.set('done');
    } finally {
      setSubmitting(false);
    }
  }

  const isEmpty = lines.length === 0;

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__scrim" onClick={closeDrawer} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" inert={!open}>
        <header className="drawer__head">
          <div>
            <p className="eyebrow eyebrow--plain eyebrow--terra">
              {view === 'done' ? 'Order received' : 'Pickup · 10% off'}
            </p>
            <h2 id="drawer-title" className="drawer__title">
              {view === 'details' ? 'Nearly ready.' : view === 'done' ? 'Thank you.' : 'Your order'}
            </h2>
          </div>
          <button ref={closeRef} type="button" className="drawer__close" onClick={closeDrawer} aria-label="Close order">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="drawer__body" data-lenis-prevent>
          {view === 'done' ? (
            <div className="drawer__done step-in">
              <div className="plate-mark" aria-hidden="true">
                <span>✓</span>
              </div>
              <h3 className="h3">The kitchen has your order.</h3>
              <p>We’ll contact you shortly to confirm the pickup time.</p>
              <dl className="drawer__ref">
                <div>
                  <dt>Reference</dt>
                  <dd>{reference}</dd>
                </div>
                <div>
                  <dt>Pickup</dt>
                  <dd>{pickupTime}</dd>
                </div>
                <div>
                  <dt>Where</dt>
                  <dd>Zin &amp; Gin · Schiekade 730, inside Teleport Hotel</dd>
                </div>
              </dl>
              <button type="button" className="btn btn--block" onClick={closeDrawer}>
                Back to the site
              </button>
            </div>
          ) : isEmpty ? (
            <div className="drawer__empty step-in">
              <p className="drawer__empty-title">Nothing on the plate yet.</p>
              <p>Add a few favourites and collect them from our kitchen — with 10% off.</p>
              <a className="btn" href="/menu#popular" onClick={closeDrawer}>
                Explore the Menu <span className="arrow">→</span>
              </a>
            </div>
          ) : view === 'cart' ? (
            <ul className="cart-lines step-in">
              {lines.map(({ item, qty, lineTotal }) => (
                <li key={item.id} className="cart-line">
                  {item.image ? (
                    <img src={photo(item.image, 200)} alt="" loading="lazy" />
                  ) : (
                    <span className="cart-line__ph" aria-hidden="true">
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <div className="cart-line__info">
                    <p className="cart-line__name">{item.name}</p>
                    <p className="cart-line__unit">{formatPrice(item.price)} each</p>
                    <QtyStepper id={item.id} qty={qty} name={item.name} />
                  </div>
                  <p className="cart-line__total">{formatPrice(lineTotal)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <form id="pickup-form" className="form step-in" onSubmit={placeOrder}>
              <label className="field">
                <span>Name</span>
                <input name="name" autoComplete="name" required placeholder="Your name" />
              </label>
              <label className="field">
                <span>Phone</span>
                <input name="phone" type="tel" autoComplete="tel" required placeholder="+31 6 …" />
              </label>
              <label className="field">
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
              </label>
              <label className="field">
                <span>Preferred pickup time</span>
                <select name="pickupTime" required defaultValue={slots[0]}>
                  {slots.map((slot) => (
                    <option key={slot}>{slot}</option>
                  ))}
                </select>
              </label>
              <p className="form__note">No online payment needed — pay when you collect.</p>
            </form>
          )}
        </div>

        {!isEmpty && view !== 'done' && (
          <footer className="drawer__foot">
            <dl className="totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="totals__save">
                <dt>Direct pickup · 10% off</dt>
                <dd>−{formatPrice(discount)}</dd>
              </div>
              <div className="totals__grand">
                <dt>Total at pickup</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            {view === 'cart' ? (
              <button type="button" className="btn btn--block" onClick={() => $drawerView.set('details')}>
                Continue to Pickup Details <span className="arrow">→</span>
              </button>
            ) : (
              <div className="drawer__actions">
                <button type="button" className="drawer__back" onClick={() => $drawerView.set('cart')}>
                  ← Back
                </button>
                <button type="submit" form="pickup-form" className="btn btn--block" disabled={submitting}>
                  {submitting ? 'Sending to the kitchen…' : (
                    <>
                      Place Pickup Order <span className="arrow">→</span>
                    </>
                  )}
                </button>
              </div>
            )}
            <p className="drawer__note">Our team will contact you to confirm the order and pickup time.</p>
          </footer>
        )}
      </aside>
    </div>
  );
}
