import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $discount, $lines, $subtotal, $total, addItem, hydrateCart, openDrawer } from '../lib/cart';
import { CATEGORIES, MENU, formatPrice, mostLoved, type MenuItem } from '../data/menu';
import { QtyStepper } from './OrderDrawer';

export default function PickupOrder() {
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<string>('popular');
  const cart = useStore($cart);
  const storeLines = useStore($lines);
  const subtotal = useStore($subtotal);
  const discount = useStore($discount);
  const total = useStore($total);

  useEffect(() => {
    hydrateCart();
    setReady(true);
  }, []);

  const lines = ready ? storeLines : [];
  const items: MenuItem[] = category === 'popular' ? mostLoved() : MENU.filter((item) => item.category === category);

  return (
    <div className="pickup">
      <div className="pickup__intro">
        <p className="eyebrow">Order direct</p>
        <h3 className="h1">
          Good food.
          <br />
          <em>Straight from our kitchen to you.</em>
        </h3>
        <p className="lede">Build your order and collect it from Zin &amp; Gin.</p>
        <p className="pickup__offer">
          <span>10% off</span> your pickup order
        </p>
      </div>

      <div className="pickup__grid">
        <div className="pickup__picker">
          <div className="chip-row" role="tablist" aria-label="Menu categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                className={`chip ${category === cat.id ? 'is-active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <ul className="pick-list" key={category}>
            {items.map((item, index) => {
              const qty = ready ? (cart[item.id] ?? 0) : 0;
              return (
                <li key={item.id} className="pick step-in" style={{ animationDelay: `${index * 40}ms` }}>
                  <div className="pick__info">
                    <p className="pick__name">
                      {item.name}
                      <span className="tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </span>
                    </p>
                    <p className="pick__desc">{item.description}</p>
                  </div>
                  <p className="pick__price">{formatPrice(item.price)}</p>
                  {qty > 0 ? (
                    <QtyStepper id={item.id} qty={qty} name={item.name} />
                  ) : (
                    <button type="button" className="pick__add" onClick={() => addItem(item.id)} aria-label={`Add ${item.name}`}>
                      Add <span aria-hidden="true">+</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="summary" aria-label="Order summary">
          <p className="eyebrow eyebrow--plain">Your pickup order</p>
          {lines.length === 0 ? (
            <p className="summary__empty">Nothing on the plate yet. Add a few dishes and they’ll appear here.</p>
          ) : (
            <ul className="summary__lines">
              {lines.map(({ item, qty, lineTotal }) => (
                <li key={item.id}>
                  <span>
                    <b>{qty}×</b> {item.name}
                  </span>
                  <span>{formatPrice(lineTotal)}</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="totals totals--light">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(ready ? subtotal : 0)}</dd>
            </div>
            <div className="totals__save">
              <dt>Direct pickup · 10% off</dt>
              <dd>−{formatPrice(ready ? discount : 0)}</dd>
            </div>
            <div className="totals__grand">
              <dt>Total</dt>
              <dd>{formatPrice(ready ? total : 0)}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="btn btn--light btn--block"
            disabled={lines.length === 0}
            onClick={() => openDrawer('details')}
          >
            Checkout <span className="arrow">→</span>
          </button>
          <p className="summary__note">No online payment. Our team will confirm your order and pickup time.</p>
        </aside>
      </div>
    </div>
  );
}
