import { useId, useState, type FormEvent } from 'react';
import { CONCERNS, type ConsultSource } from '../../data/wound';

interface Props {
  source: ConsultSource;
  showLead?: boolean;
  heading?: string;
  initialConcern?: string;
}

interface Errors {
  name?: string;
  phone?: string;
  concern?: string;
  form?: string;
}

function digitsOnly(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export default function ConsultForm({
  source,
  showLead = false,
  heading = 'Tell us how we can help.',
  initialConcern = '',
}: Props) {
  const baseId = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [concern, setConcern] = useState(initialConcern);
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Enter your name.';
    if (!/^[6-9]\d{9}$/.test(digitsOnly(phone))) next.phone = 'Enter a 10-digit mobile number.';
    if (!CONCERNS.some((item) => item.value === concern)) next.concern = 'Select the problem.';
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      const first = next.name ? 'name' : next.phone ? 'phone' : 'concern';
      document.getElementById(`${baseId}-${first}`)?.focus();
      return;
    }

    setPending(true);
    try {
      const response = await fetch('/api/wound-consult', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: digitsOnly(phone),
          concern,
          source,
          company,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setErrors({ form: data.error || 'We could not send this. Please call 84949 06440.' });
        return;
      }
      setDone(true);
    } catch {
      setErrors({ form: 'We could not send this. Please call 84949 06440.' });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="wc-form wc-form-done" role="status">
        <p className="wc-form-kicker">Request received</p>
        <h3>Our team will contact you.</h3>
        <p>Our team will contact you to arrange your consultation.</p>
      </div>
    );
  }

  return (
    <form className="wc-form" onSubmit={onSubmit} noValidate>
      {showLead ? (
        <div className="wc-form-lead">
          <h2 id="consult-dialog-title">{heading}</h2>
        </div>
      ) : null}

      <div className="wc-hp" aria-hidden="true">
        <label htmlFor={`${baseId}-company`}>Company</label>
        <input
          id={`${baseId}-company`}
          name="company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="wc-field">
        <label htmlFor={`${baseId}-name`}>Your Name</label>
        <input
          id={`${baseId}-name`}
          name="name"
          value={name}
          placeholder="Enter your name"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((current) => ({ ...current, name: undefined }));
          }}
        />
        {errors.name ? (
          <p id={`${baseId}-name-error`} className="wc-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="wc-field">
        <label htmlFor={`${baseId}-phone`}>Mobile Number</label>
        <input
          id={`${baseId}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          placeholder="Enter your mobile number"
          autoComplete="tel"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? `${baseId}-phone-error` : undefined}
          onChange={(event) => {
            setPhone(event.target.value);
            setErrors((current) => ({ ...current, phone: undefined }));
          }}
        />
        {errors.phone ? (
          <p id={`${baseId}-phone-error`} className="wc-error">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div className="wc-field">
        <label htmlFor={`${baseId}-concern`}>What is the problem?</label>
        <select
          id={`${baseId}-concern`}
          name="concern"
          value={concern}
          className={concern ? undefined : 'is-placeholder'}
          aria-invalid={errors.concern ? true : undefined}
          aria-describedby={errors.concern ? `${baseId}-concern-error` : undefined}
          onChange={(event) => {
            setConcern(event.target.value);
            setErrors((current) => ({ ...current, concern: undefined }));
          }}
        >
          <option value="">Select</option>
          {CONCERNS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {errors.concern ? (
          <p id={`${baseId}-concern-error`} className="wc-error">
            {errors.concern}
          </p>
        ) : null}
      </div>

      {errors.form ? (
        <p className="wc-error wc-error-form" role="alert">
          {errors.form}
        </p>
      ) : null}

      <button className="wc-submit" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Request a Call Back'}
      </button>
      <p className="wc-privacy">Our team will contact you to arrange your consultation.</p>
    </form>
  );
}
