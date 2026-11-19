import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';

function expectedToken() {
  const pw = process.env.ADMIN_PASSWORD || '';
  return crypto.createHash('sha256').update('menu-admin::' + pw).digest('hex');
}

export function checkPassword(password) {
  return password === (process.env.ADMIN_PASSWORD || '');
}

export async function setSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated() {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return false;
  return value === expectedToken();
}
