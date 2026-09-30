import { useEffect, useState } from 'react';
import ReservationFlow from './ReservationFlow';
import PickupOrder from './PickupOrder';
import { IMAGES, photo } from '../data/images';

type Mode = 'table' | 'pickup';

const modeFromHash = (): Mode | null =>
  location.hash === '#pickup' ? 'pickup' : location.hash === '#table' ? 'table' : null;

export default function JoinPanel() {
  const [mode, setMode] = useState<Mode>('table');

  useEffect(() => {
    const sync = () => {
      const next = modeFromHash();
      if (next) setMode(next);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const select = (next: Mode) => {
    setMode(next);
    history.replaceState(null, '', `${location.search}#${next}`);
  };

  return (
    <div className={`join join--${mode}`}>
      <div className="join__tabs" role="tablist" aria-label="Reserve or order">
        <button type="button" role="tab" aria-selected={mode === 'table'} onClick={() => select('table')}>
          <small>01</small> Reserve a table
        </button>
        <button type="button" role="tab" aria-selected={mode === 'pickup'} onClick={() => select('pickup')}>
          <small>02</small> Order for pickup <em>−10%</em>
        </button>
        <span className="join__ink" aria-hidden="true" />
      </div>

      <div className="join__body" key={mode}>
        {mode === 'table' ? (
          <div className="join__table step-in">
            <div className="join__aside">
              <p className="eyebrow">Stay for dinner</p>
              <p className="join__aside-copy">
                Inside Teleport Hotel · Schiekade 730, Rotterdam. Staying upstairs? Add your room number and we’ll
                have your table ready.
              </p>
              <img
                src={photo(IMAGES.interiorMoody, 1000)}
                alt="The Zin & Gin dining room in the evening"
                loading="lazy"
              />
            </div>
            <ReservationFlow />
          </div>
        ) : (
          <PickupOrder />
        )}
      </div>
    </div>
  );
}
