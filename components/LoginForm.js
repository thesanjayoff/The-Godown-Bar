'use client';

import { useState } from 'react';
import '../app/admin/admin.css';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      window.location.reload();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Login failed');
    }
  }

  return (
    <div className="login-wrap">
      <form onSubmit={handleSubmit} className="login-card">
        <div className="login-icon">M</div>
        <h1>Menu Admin</h1>
        <p className="sub">Sign in to edit both restaurants&rsquo; menus.</p>
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={busy}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
