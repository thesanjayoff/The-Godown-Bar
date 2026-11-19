import { NextResponse } from 'next/server';
import { getMenu, saveMenu } from '../../../../lib/blob';
import { isAuthenticated } from '../../../../lib/auth';

const KNOWN_SLUGS = new Set(['godown-bar', 'southern-station']);

export async function GET(req, { params }) {
  const { slug } = await params;
  if (!KNOWN_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Unknown restaurant' }, { status: 404 });
  }
  const data = await getMenu(slug);
  return NextResponse.json(data);
}

export async function PUT(req, { params }) {
  const { slug } = await params;
  if (!KNOWN_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Unknown restaurant' }, { status: 404 });
  }
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  try {
    await saveMenu(slug, data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not save. Make sure Blob storage is attached to this project in the Vercel dashboard.' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
