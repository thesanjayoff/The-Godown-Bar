import { list, put } from '@vercel/blob';
import godownBarSeed from './data/godown-bar.json';
import southernStationSeed from './data/southern-station.json';

const SEEDS = {
  'godown-bar': godownBarSeed,
  'southern-station': southernStationSeed,
};

function pathFor(slug) {
  return `menus/${slug}.json`;
}

export async function getMenu(slug) {
  if (!SEEDS[slug]) throw new Error('Unknown restaurant: ' + slug);

  try {
    const { blobs } = await list({ prefix: pathFor(slug) });
    const match = blobs.find((b) => b.pathname === pathFor(slug));
    if (match) {
      const res = await fetch(match.url, { cache: 'no-store' });
      if (res.ok) return res.json();
    }
  } catch (err) {
    // Blob store not attached yet, or network hiccup — fall back to seed.
    console.error('getMenu fallback for', slug, err.message);
  }

  return SEEDS[slug];
}

export async function saveMenu(slug, data) {
  if (!SEEDS[slug]) throw new Error('Unknown restaurant: ' + slug);
  await put(pathFor(slug), JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}
