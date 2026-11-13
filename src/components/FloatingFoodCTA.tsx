import { useEffect, useState } from 'react';
import { posEntry } from '../data/ordering';

const href = posEntry();

export default function FloatingFoodCTA() {
  const [onDark, setOnDark] = useState(true);
  const [overFooter, setOverFooter] = useState(false);

  useEffect(() => {
    const update = () => {
      const node = document.querySelector<HTMLElement>('.fcta');
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = Math.min(window.innerWidth - 8, Math.max(8, rect.left + rect.width / 2));
      const y = Math.min(window.innerHeight - 8, Math.max(8, rect.top + rect.height / 2));
      const hit = document.elementsFromPoint(x, y).find((el) => !el.closest('.fcta'));
      setOnDark(hit?.closest('[data-surface]')?.getAttribute('data-surface') === 'dark');
      setOverFooter(Boolean(hit?.closest('footer')));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className={`fcta ${onDark ? 'fcta--on-dark' : 'fcta--on-light'}${overFooter ? ' is-muted' : ''}`}>
      <a className="fcta__plate" href={href} aria-label="Order now. 10 percent off direct orders. Opens BonAppio.">
        <svg className="fcta__ring" viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <path id="fcta-circle" d="M80,80 m-65,0 a65,65 0 1,1 130,0 a65,65 0 1,1 -130,0" />
          </defs>
          <circle cx="80" cy="80" r="79" className="fcta__disc" />
          <text>
            <textPath href="#fcta-circle" textLength="404" lengthAdjust="spacing">
              <tspan fontWeight="800">10%</tspan>
              {' OFF DIRECT ORDER  ·  '}
              <tspan fontWeight="800">10%</tspan>
              {' OFF DIRECT ORDER  ·  '}
            </textPath>
          </text>
        </svg>
        <span className="fcta__dish">
          <span className="fcta__rim" />
          <span className="fcta__label">
            <strong className="fcta__order">
              Order
              <br />
              now
            </strong>
            <small className="fcta__off">10% off</small>
          </span>
        </span>
      </a>
    </div>
  );
}
