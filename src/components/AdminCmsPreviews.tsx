import { mediaSrc } from '../lib/media';

export function formatAdminEventDate(iso: string) {
  if (!iso) return 'Pick a date';
  try {
    return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(`${iso}T12:00:00`),
    );
  } catch {
    return iso;
  }
}

export function EventSitePreview({
  name,
  date,
  description,
  image,
  ctaLabel,
  status,
  label = 'Website preview',
}: {
  name: string;
  date: string;
  description: string;
  image: string;
  ctaLabel: string;
  status: string;
  label?: string;
}) {
  const published = status === 'published';
  const img = image ? mediaSrc(image, 900) : '';

  return (
    <div className="cms-preview-panel__inner cms-preview-panel__inner--light">
      <p className="cms-preview-label cms-preview-label--site">{label}</p>
      <article className={`event-preview ${published ? '' : 'event-preview--draft'}`}>
        {!published && <span className="event-preview__badge">Draft — hidden on site</span>}
        <div className="event-preview__media">
          {img ? <img src={img} alt="" /> : <div className="event-preview__placeholder">Event image</div>}
        </div>
        <div className="event-preview__body">
          <p className="event-preview__date">{formatAdminEventDate(date)}</p>
          <h3 className="event-preview__title">{name.trim() || 'Event title'}</h3>
          <p className="event-preview__desc">{description.trim() || 'Description will appear here.'}</p>
          <span className="event-preview__cta">{ctaLabel.trim() || 'View event'} →</span>
        </div>
      </article>
    </div>
  );
}
