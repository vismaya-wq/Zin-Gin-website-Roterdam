import { useEffect, useRef, useState, type FormEvent } from 'react';
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

const PICKUP_PRESETS = ['ASAP', '18:30', '19:00', '19:30', '20:00'] as const;

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
  const [pickupChoice, setPickupChoice] = useState<string>(PICKUP_PRESETS[0]);
  const closeRef = useRef<HTMLButtonElement>(null);

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
    const preset = String(data.get('pickupPreset'));
    const customTime = String(data.get('pickupCustom') || '');
    const resolvedPickup =
      preset === 'other' && customTime ? customTime : preset === 'other' ? 'To be agreed' : preset;

    setSubmitting(true);
    try {
      const result = await submitPickupOrder({
        lines: lines.map(({ item, qty }) => ({ id: item.id, name: item.name, qty, unitPrice: item.price })),
        subtotal,
        discount,
        total,
        name: String(data.get('name')),
        phone: String(data.get('phone')),
        email: String(data.get('email') || '') || undefined,
        pickupTime: resolvedPickup,
        specialInstructions: String(data.get('instructions') || '') || undefined,
      });
      setReference(result.reference);
      setPickupTime(resolvedPickup);
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
              {view === 'done' ? 'Takeaway request' : 'Takeaway · 10% off'}
            </p>
            <h2 id="drawer-title" className="drawer__title">
              {view === 'details' ? 'Your details' : view === 'done' ? 'Request sent' : 'Your order'}
            </h2>
          </div>
          <button ref={closeRef} type="button" className="drawer__close" onClick={closeDrawer} aria-label="Close order">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="drawer__body" data-lenis-prevent>
          {view === 'done' ? (
            <div className="drawer__done step-in">
              <p className="status-pill status-pill--pending">Order request sent</p>
              <h3 className="h3">Awaiting manager confirmation</h3>
              <p>
                We&apos;ve received your takeaway request. Our manager will check the dishes, final price and pickup
                time and confirm your order.
              </p>
              <dl className="drawer__ref">
                <div>
                  <dt>Reference</dt>
                  <dd>{reference}</dd>
                </div>
                <div>
                  <dt>Requested pickup</dt>
                  <dd>{pickupTime}</dd>
                </div>
                <div>
                  <dt>Collect at</dt>
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
              <p>Add dishes from the menu — takeaway orders get 10% off when you collect.</p>
              <a className="btn" href="/menu?takeaway=1#popular" onClick={closeDrawer}>
                Browse the Menu <span className="arrow">→</span>
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
                    <button type="button" className="cart-line__remove" onClick={() => setQty(item.id, 0)}>
                      Remove
                    </button>
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
                <span>Phone number</span>
                <input name="phone" type="tel" autoComplete="tel" required placeholder="+31 6 …" />
              </label>
              <label className="field">
                <span>Email — optional</span>
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
              </label>
              <label className="field">
                <span>Preferred pickup time</span>
                <select
                  name="pickupPreset"
                  required
                  value={pickupChoice}
                  onChange={(e) => setPickupChoice(e.target.value)}
                >
                  {PICKUP_PRESETS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                  <option value="other">Choose another time</option>
                </select>
              </label>
              {pickupChoice === 'other' && (
                <label className="field step-in">
                  <span>Your preferred time</span>
                  <input name="pickupCustom" type="time" required />
                </label>
              )}
              <label className="field">
                <span>Special instructions</span>
                <textarea name="instructions" rows={3} placeholder="Allergies, spice level, packaging…" />
              </label>
              <p className="form__note">No online payment — the manager confirms availability and final price.</p>
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
                <dt>Direct takeaway · 10% off</dt>
                <dd>−{formatPrice(discount)}</dd>
              </div>
              <div className="totals__grand">
                <dt>Expected total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            {view === 'cart' ? (
              <button type="button" className="btn btn--block" onClick={() => $drawerView.set('details')}>
                Continue <span className="arrow">→</span>
              </button>
            ) : (
              <div className="drawer__actions">
                <button type="button" className="drawer__back" onClick={() => $drawerView.set('cart')}>
                  ← Back
                </button>
                <button type="submit" form="pickup-form" className="btn btn--block" disabled={submitting}>
                  {submitting ? 'Sending request…' : (
                    <>
                      Send Order Request <span className="arrow">→</span>
                    </>
                  )}
                </button>
              </div>
            )}
            <p className="drawer__note">Awaiting manager confirmation before your order is final.</p>
          </footer>
        )}
      </aside>
    </div>
  );
}
