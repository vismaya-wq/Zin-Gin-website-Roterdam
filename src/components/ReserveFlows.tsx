import { useEffect, useState } from 'react';
import HotelGuestSlotFlow from './HotelGuestSlotFlow';
import DeliveryPanel from './DeliveryPanel';

type ActivePath = 'hotel-guest' | 'delivery' | null;

function pathFromHash(): ActivePath {
  const hash = location.hash.replace('#', '');
  if (hash === 'hotel-guest') return 'hotel-guest';
  if (hash === 'delivery') return 'delivery';
  return null;
}

export default function ReserveFlows() {
  const [active, setActive] = useState<ActivePath>(null);

  useEffect(() => {
    const sync = () => {
      const next = pathFromHash();
      setActive(next);
      if (next) {
        requestAnimationFrame(() => {
          document.getElementById(next)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  if (!active) {
    return (
      <p className="reserve-prompt step-in">
        Choose one of the three options above — hotel guest booking, takeaway (menu), or delivery partners.
      </p>
    );
  }

  if (active === 'delivery') {
    return <DeliveryPanel />;
  }

  return <HotelGuestSlotFlow />;
}
