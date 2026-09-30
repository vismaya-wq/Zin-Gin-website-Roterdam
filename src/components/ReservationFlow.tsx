import { useEffect, useState, type FormEvent } from 'react';
import { submitReservation } from '../lib/api';

type DateChoice = 'today' | 'tomorrow' | 'custom';

const TIMES = ['18:00', '18:30', '19:00', '19:30', '20:00'];
const STEPS = ['Date', 'Time', 'Guests', 'Details'];
const MIN_GUESTS = 1;
const MAX_GUESTS = 12;

const toIso = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
const pretty = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export default function ReservationFlow() {
  const [step, setStep] = useState(0);
  const [dateChoice, setDateChoice] = useState<DateChoice | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [hotelGuest, setHotelGuest] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ reference: string; name: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('hotel') === '1') setHotelGuest(true);
    if (params.get('when') === 'today') {
      setDateChoice('today');
      setStep(1);
    }
  }, []);

  const dateIso =
    dateChoice === 'today' ? toIso(new Date()) : dateChoice === 'tomorrow' ? toIso(addDays(1)) : customDate;
  const dateLabel =
    dateChoice === 'today' ? 'Today' : dateChoice === 'tomorrow' ? 'Tomorrow' : customDate ? pretty(customDate) : '';

  const chooseDate = (choice: DateChoice) => {
    setDateChoice(choice);
    if (choice !== 'custom') window.setTimeout(() => setStep(1), 260);
  };
  const chooseTime = (slot: string) => {
    setTime(slot);
    window.setTimeout(() => setStep(2), 260);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const name = String(data.get('name'));
      const result = await submitReservation({
        date: dateIso,
        time: time!,
        guests,
        name,
        phone: String(data.get('phone')),
        email: String(data.get('email')),
        hotelGuest: hotelGuest === true,
        roomNumber: hotelGuest ? String(data.get('room') || '') || undefined : undefined,
      });
      setConfirmed({ reference: result.reference, name: name.split(' ')[0] });
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setConfirmed(null);
    setStep(0);
    setDateChoice(null);
    setCustomDate('');
    setTime(null);
    setGuests(2);
  }

  if (confirmed) {
    return (
      <div className="flow flow--done step-in" aria-live="polite">
        <div className="plate-mark plate-mark--lg" aria-hidden="true">
          <span>✓</span>
        </div>
        <p className="eyebrow eyebrow--plain eyebrow--terra">Request received · {confirmed.reference}</p>
        <h3 className="h2">We’ll save you a seat.</h3>
        <p className="flow__lede">
          Your reservation request has been received.
          <br />
          Our team will contact you shortly to confirm.
        </p>
        <ul className="flow__summary flow__summary--done">
          <li>{dateLabel}</li>
          <li>{time}</li>
          <li>
            {guests} {guests === 1 ? 'guest' : 'guests'}
          </li>
          {hotelGuest && <li>Teleport guest</li>}
        </ul>
        <div className="flow__done-actions">
          <a className="btn" href="/menu">
            Explore the Menu <span className="arrow">→</span>
          </a>
          <button type="button" className="link-arrow" onClick={reset}>
            Make another booking
          </button>
        </div>
      </div>
    );
  }

  const summary = [
    { label: dateLabel, step: 0 },
    { label: time ?? '', step: 1 },
    { label: step > 2 ? `${guests} ${guests === 1 ? 'guest' : 'guests'}` : '', step: 2 },
  ].filter((chip) => chip.label && chip.step < step);

  return (
    <div className="flow">
      <div className="flow__progress" aria-hidden="true">
        {STEPS.map((label, index) => (
          <span key={label} className={index <= step ? 'is-on' : ''}>
            <b>0{index + 1}</b> {label}
          </span>
        ))}
      </div>

      {summary.length > 0 && (
        <ul className="flow__summary" aria-label="Your selection so far">
          {summary.map((chip) => (
            <li key={chip.step}>
              <button type="button" onClick={() => setStep(chip.step)} aria-label={`Change ${chip.label}`}>
                {chip.label} <span aria-hidden="true">✎</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flow__stage" key={step}>
        <p className="flow__count">Step 0{step + 1} / 04</p>

        {step === 0 && (
          <fieldset className="flow__step step-in">
            <legend className="h2">When should we expect you?</legend>
            <div className="choice-list">
              {(
                [
                  ['today', 'Today', pretty(toIso(new Date()))],
                  ['tomorrow', 'Tomorrow', pretty(toIso(addDays(1)))],
                  ['custom', 'Choose a Date', 'Plan ahead'],
                ] as const
              ).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  className={`choice ${dateChoice === value ? 'is-selected' : ''}`}
                  aria-pressed={dateChoice === value}
                  onClick={() => chooseDate(value)}
                >
                  <span className="choice__label">{label}</span>
                  <span className="choice__hint">{hint}</span>
                  <span className="choice__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </div>
            {dateChoice === 'custom' && (
              <div className="flow__custom step-in">
                <label className="field">
                  <span>Pick a date</span>
                  <input
                    type="date"
                    min={toIso(new Date())}
                    value={customDate}
                    onChange={(event) => setCustomDate(event.target.value)}
                  />
                </label>
                <button type="button" className="btn" disabled={!customDate} onClick={() => setStep(1)}>
                  Continue <span className="arrow">→</span>
                </button>
              </div>
            )}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="flow__step step-in">
            <legend className="h2">What time works?</legend>
            <div className="time-grid">
              {TIMES.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`time ${time === slot ? 'is-selected' : ''}`}
                  aria-pressed={time === slot}
                  onClick={() => chooseTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
            <p className="flow__hint">Looking for a later table? Call us and we’ll do our best.</p>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="flow__step step-in">
            <legend className="h2">Table for how many?</legend>
            <div className="guests">
              <button
                type="button"
                onClick={() => setGuests((n) => Math.max(MIN_GUESTS, n - 1))}
                disabled={guests <= MIN_GUESTS}
                aria-label="One guest fewer"
              >
                −
              </button>
              <output aria-live="polite">
                <span key={guests}>{guests}</span>
                <small>{guests === 1 ? 'guest' : 'guests'}</small>
              </output>
              <button
                type="button"
                onClick={() => setGuests((n) => Math.min(MAX_GUESTS, n + 1))}
                disabled={guests >= MAX_GUESTS}
                aria-label="One guest more"
              >
                +
              </button>
            </div>
            <button type="button" className="btn" onClick={() => setStep(3)}>
              Continue <span className="arrow">→</span>
            </button>
            <p className="flow__hint">Larger group? Call us for tables of 12+.</p>
          </fieldset>
        )}

        {step === 3 && (
          <form className="flow__step step-in" onSubmit={submit}>
            <h3 className="h2">Nearly there.</h3>
            <div className="form form--grid">
              <label className="field">
                <span>Your name</span>
                <input name="name" autoComplete="name" required />
              </label>
              <label className="field">
                <span>Phone number</span>
                <input name="phone" type="tel" autoComplete="tel" required />
              </label>
              <label className="field field--wide">
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
            </div>

            <div className="hotel-q">
              <p id="hotel-q">Staying at Teleport Hotel?</p>
              <div className="segmented" role="group" aria-labelledby="hotel-q">
                <button type="button" aria-pressed={hotelGuest === true} onClick={() => setHotelGuest(true)}>
                  Yes
                </button>
                <button type="button" aria-pressed={hotelGuest === false} onClick={() => setHotelGuest(false)}>
                  No
                </button>
              </div>
            </div>
            {hotelGuest && (
              <label className="field step-in">
                <span>Room number — optional</span>
                <input name="room" inputMode="numeric" placeholder="e.g. 412" />
              </label>
            )}

            <button type="submit" className="btn btn--terra flow__submit" disabled={submitting}>
              {submitting ? (
                'Sending your request…'
              ) : (
                <>
                  Request My Table <span className="arrow">→</span>
                </>
              )}
            </button>
          </form>
        )}

        {step > 0 && (
          <button type="button" className="flow__back" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
