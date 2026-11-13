import { useEffect, useRef, useState } from 'react';
import ConsultForm from './ConsultForm';
import type { ConsultSource } from '../../data/wound';

interface OpenDetail {
  concern?: string;
  source?: ConsultSource;
  heading?: string;
}

const SOURCES = new Set<ConsultSource>(['hero', 'situations', 'diabetic', 'treats', 'doctor', 'faq', 'final']);

export default function ConsultDialog() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<ConsultSource>('hero');
  const [heading, setHeading] = useState('Tell us how we can help.');
  const [concern, setConcern] = useState('');
  const [formKey, setFormKey] = useState(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    returnFocus.current?.focus();
  }

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = ((event as CustomEvent<OpenDetail>).detail || {}) as OpenDetail;
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setSource(detail.source && SOURCES.has(detail.source) ? detail.source : 'hero');
      setHeading(detail.heading || 'Tell us how we can help.');
      setConcern(detail.concern || '');
      setFormKey((value) => value + 1);
      setOpen(true);
    };
    window.addEventListener('wc-open', onOpen);
    return () => window.removeEventListener('wc-open', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => {
      cardRef.current?.querySelector<HTMLElement>('input[name="name"]')?.focus();
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, formKey]);

  if (!open) return null;

  return (
    <div className="wc-modal" onClick={close}>
      <div
        ref={cardRef}
        className="wc-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consult-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="wc-modal-close" type="button" aria-label="Close" onClick={close}>
          <span aria-hidden="true">×</span>
        </button>
        <ConsultForm
          key={`${formKey}-${concern}-${heading}`}
          source={source}
          showLead
          heading={heading}
          initialConcern={concern}
        />
      </div>
    </div>
  );
}
