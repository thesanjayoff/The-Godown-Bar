import { NextResponse } from 'next/server';
import { checkPassword, setSessionCookie } from '../../../lib/auth';

export async function POST(req) {
  const { password } = await req.json();
  if (!checkPassword(password || '')) {
    return NextResponse.json({ ok: false, error: 'Incorrect password' }, { status: 401 });
  }
  await setSessionCookie();
  return NextResponse.json({ ok: true });
}
