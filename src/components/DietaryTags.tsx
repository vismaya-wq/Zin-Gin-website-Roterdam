import type { DietaryTag } from '../data/menu';

const META: Record<DietaryTag, { label: string; icon: 'veg' | 'vegan' | 'wheat' | 'nut' | 'chilli' }> = {
  VEG: { label: 'Vegetarian', icon: 'veg' },
  VEGAN: { label: 'Vegan', icon: 'vegan' },
  GF: { label: 'Gluten', icon: 'wheat' },
  NUTS: { label: 'Contains nuts', icon: 'nut' },
  SPICY: { label: 'Spicy', icon: 'chilli' },
};

function Icon({ type }: { type: (typeof META)[DietaryTag]['icon'] }) {
  if (type === 'veg') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 14.2C3.2 10.4 2 7.2 3.2 4.6 4.6 6.2 6.2 7 8 7.2 8 4.2 10.2 2 13.2 2 12.4 6.4 10.2 9.6 8 14.2z" fill="currentColor" />
        <path d="M8 14V7.2" stroke="#fff" strokeWidth="0.8" />
      </svg>
    );
  }
  if (type === 'vegan') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 13.5c-.2-2.2.4-3.6 1.6-4.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M8 13.5V6.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M8 8.2C6.4 6.6 5.6 4.8 6 3.2c1.6.4 2.6 1.6 3.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M8 7.2c1.4-1.8 2.8-2.6 4.2-2.6-.2 1.8-.8 3.2-2.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'wheat') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 14V3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 4.2c-1.6-.2-2.4-1.2-2.6-2.4.8 1.2 1.8 1.8 2.6 2" fill="currentColor" />
        <path d="M8 4.2c1.6-.2 2.4-1.2 2.6-2.4-.8 1.2-1.8 1.8-2.6 2" fill="currentColor" />
        <path d="M8 7c-1.7-.1-2.6-1-2.8-2.2.9 1.1 1.9 1.6 2.8 1.8" fill="currentColor" />
        <path d="M8 7c1.7-.1 2.6-1 2.8-2.2-.9 1.1-1.9 1.6-2.8 1.8" fill="currentColor" />
        <path d="M8 9.6c-1.6 0-2.5-.8-2.7-2 .8 1 1.8 1.4 2.7 1.5" fill="currentColor" />
        <path d="M8 9.6c1.6 0 2.5-.8 2.7-2-.8 1-1.8 1.4-2.7 1.5" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'nut') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 3.2c2.4 0 4.2 2 4.2 4.6 0 2.8-1.8 5-4.2 5s-4.2-2.2-4.2-5C3.8 5.2 5.6 3.2 8 3.2z" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 3.2c.2-1.4 1.2-2 2.2-1.6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M6.2 7.2c.6 1.4 1.4 2.2 1.8 3.4" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8.2 2.2c.4 1.6-.2 2.6-1.2 3.2 1.8.2 3.2 1.4 3.4 3.2-1.6-.6-2.6-.4-3.4.4.2 1.8-1 3.4-2.8 3.6 1.2-1.6 1-3 .2-4.2C3 7.2 3.4 5.2 5 4.2c.8 1 1.8.8 3.2-.2.2-.6.2-1.2 0-1.8z" fill="currentColor" />
    </svg>
  );
}

export function DietaryLegend() {
  return (
    <ul className="diet-legend" aria-label="Dietary icons">
      {(Object.keys(META) as DietaryTag[]).map((tag) => (
        <li key={tag}>
          <Icon type={META[tag].icon} /> {META[tag].label}
        </li>
      ))}
    </ul>
  );
}

export function DietaryTags({ tags }: { tags: DietaryTag[] }) {
  if (!tags.length) return null;
  const unique = [...new Set(tags)];
  return (
    <span className="diet-tags" aria-label={unique.map((tag) => META[tag].label).join(', ')}>
      {unique.map((tag) => (
        <span key={tag} className="diet-tag" title={META[tag].label}>
          <Icon type={META[tag].icon} />
          <span className="sr-only">{META[tag].label}</span>
        </span>
      ))}
    </span>
  );
}
