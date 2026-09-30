import { useEffect, useState, type MouseEvent } from 'react';
import { useStore } from '@nanostores/react';
import { $count, $drawerOpen, $subtotal, hydrateCart, openDrawer } from '../lib/cart';
import { formatPrice } from '../data/menu';

type Page = 'home' | 'menu' | 'reserve';

interface CtaState {
  kicker: string;
  action: string;
  ring: string;
  href?: string;
  onClick?: (event: MouseEvent) => void;
}

export default function FloatingFoodCTA({ page }: { page: Page }) {
  const [ready, setReady] = useState(false);
  const storeCount = useStore($count);
  const subtotal = useStore($subtotal);
  const drawerOpen = useStore($drawerOpen);

  useEffect(() => {
    hydrateCart();
    setReady(true);
  }, []);

  const count = ready ? storeCount : 0;
  const hasOrder = count > 0;

  const state: CtaState = hasOrder
    ? {
        kicker: 'Your Order',
        action: `${count} ${count === 1 ? 'Item' : 'Items'}`,
        ring: 'Your order · Pickup saves 10% · Your order · Pickup saves 10% · ',
        onClick: (event) => {
          event.preventDefault();
          openDrawer('cart');
        },
      }
    : page === 'menu'
      ? {
          kicker: 'Ready to eat?',
          action: 'Order',
          ring: 'Ready to eat? · Order for pickup · 10% off direct · ',
          href: '#popular',
        }
      : {
          kicker: 'Hungry?',
          action: 'Explore the Menu',
          ring: 'Hungry? · Explore the menu · Zin & Gin · Rotterdam · ',
          href: '/menu',
        };

  const Tag = state.href ? 'a' : 'button';
  const tagProps = state.href ? { href: state.href } : { type: 'button' as const };

  return (
    <>
      <div className={`fcta ${drawerOpen ? 'is-muted' : ''} ${hasOrder ? 'has-order' : ''}`}>
        <Tag
          {...tagProps}
          className="fcta__plate"
          onClick={state.onClick}
          aria-label={hasOrder ? `Your order, ${count} items. Open order.` : `${state.kicker} ${state.action}`}
        >
          <svg className="fcta__ring" viewBox="0 0 160 160" aria-hidden="true">
            <defs>
              <path id="fcta-circle" d="M80,80 m-65,0 a65,65 0 1,1 130,0 a65,65 0 1,1 -130,0" />
            </defs>
            <circle cx="80" cy="80" r="79" className="fcta__disc" />
            <text>
              <textPath href="#fcta-circle" textLength="404" lengthAdjust="spacing">
                {state.ring.toUpperCase()}
              </textPath>
            </text>
          </svg>

          <span className="fcta__dish" aria-hidden="true">
            <span className="fcta__rim" />
            <span className="fcta__garnish">
              <i /> <i /> <i /> <i /> <i />
            </span>
            <span className="fcta__label" key={`${state.kicker}-${count}`}>
              <em>{state.kicker}</em>
              <small>
                {state.action} {!hasOrder && <b className="fcta__arrow">→</b>}
              </small>
              {hasOrder && <span className="fcta__total">{formatPrice(subtotal)}</span>}
            </span>
          </span>

          {hasOrder && (
            <span className="fcta__badge" key={count} aria-hidden="true">
              {count}
            </span>
          )}
        </Tag>
      </div>

      <div className={`fbar ${drawerOpen ? 'is-muted' : ''} ${page === 'reserve' ? 'fbar--solo' : ''}`}>
        <Tag {...tagProps} className="fbar__main" onClick={state.onClick}>
          <span className="fbar__plate" aria-hidden="true">
            {hasOrder ? <span key={count}>{count}</span> : <span className="fbar__dot" />}
          </span>
          <span className="fbar__text">
            <small>{state.kicker}</small>
            <strong>{hasOrder ? `${state.action} · ${formatPrice(subtotal)}` : state.action}</strong>
          </span>
          <span className="fbar__arrow" aria-hidden="true">
            →
          </span>
        </Tag>
        {page !== 'reserve' && (
          <a className="fbar__reserve" href="/reserve#table">
            Reserve
          </a>
        )}
      </div>
    </>
  );
}
