import { useState } from 'react';
import '../styles/admin.css';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <main className="login">
      <div className="login-card">
        <p className="eyebrow">Zin &amp; Gin Admin</p>
        <h1>Sign in</h1>
        <p className="lead">Email and password for authorised staff only.</p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            const form = event.currentTarget;
            const body = Object.fromEntries(new FormData(form).entries());
            try {
              const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || 'Sign in failed.');
              location.href = '/admin';
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Sign in failed.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <button className="btn btn--light" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          {error ? (
            <p className="hint" role="alert">
              {error}
            </p>
          ) : null}
          <p className="hint">
            <a href="/">← Back to website</a>
          </p>
        </form>
      </div>
    </main>
  );
}
