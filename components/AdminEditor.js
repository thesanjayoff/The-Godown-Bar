'use client';

import { useState, useEffect, useCallback } from 'react';
import '../app/admin/admin.css';

const RESTAURANTS = [
  { slug: 'godown-bar', label: 'The Godown Bar' },
  { slug: 'southern-station', label: 'Southern Station' },
];

export default function AdminEditor() {
  const [slug, setSlug] = useState(RESTAURANTS[0].slug);
  const [data, setData] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [statusOk, setStatusOk] = useState(true);

  const load = useCallback(async (s) => {
    setLoading(true);
    setStatus('');
    const res = await fetch(`/api/menu/${s}`, { cache: 'no-store' });
    const json = await res.json();
    setData(json);
    setTabIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(slug);
  }, [slug, load]);

  async function handleSave() {
    setSaving(true);
    setStatus('');
    const res = await fetch(`/api/menu/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    setStatusOk(res.ok);
    setStatus(res.ok ? 'Saved.' : body.error || 'Save failed.');
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  }

  if (loading || !data) {
    return <div className="loading-screen">Loading…</div>;
  }

  const tab = data.tabs[tabIndex];

  function updateTab(updater) {
    setData((prev) => {
      const next = structuredClone(prev);
      updater(next.tabs[tabIndex]);
      return next;
    });
  }

  function updateCategory(catIndex, updater) {
    updateTab((t) => updater(t.categories[catIndex]));
  }

  function addCategory() {
    updateTab((t) => {
      t.categories.push({ key: 'new-' + Date.now(), label: 'New Category', items: [] });
    });
  }

  function deleteCategory(catIndex) {
    if (!confirm('Delete this whole category?')) return;
    updateTab((t) => {
      t.categories.splice(catIndex, 1);
    });
  }

  function addItem(catIndex) {
    updateCategory(catIndex, (c) => {
      c.items.push({ name: 'New item', price: '₹0' });
    });
  }

  function deleteItem(catIndex, itemIndex) {
    updateCategory(catIndex, (c) => {
      c.items.splice(itemIndex, 1);
    });
  }

  function updateItem(catIndex, itemIndex, field, value) {
    updateCategory(catIndex, (c) => {
      c.items[itemIndex][field] = value;
    });
  }

  return (
    <div className="editor" data-restaurant={slug}>
      <div className="editor-topbar">
        <div className="restaurant-picker">
          {RESTAURANTS.map((r) => (
            <button
              key={r.slug}
              onClick={() => setSlug(r.slug)}
              className={r.slug === slug ? 'active' : ''}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="topbar-actions">
          <button onClick={handleSave} disabled={saving} className="btn btn-save">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={handleLogout} className="btn btn-ghost">
            Log out
          </button>
        </div>
      </div>
      {status ? <p className={'status-msg ' + (statusOk ? 'ok' : 'err')}>{status}</p> : null}

      {data.tabs.length > 1 ? (
        <div className="tab-picker">
          {data.tabs.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setTabIndex(i)}
              className={i === tabIndex ? 'active' : ''}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      {tab.categories.map((cat, catIndex) => (
        <div key={cat.key} className="cat-card">
          <div className="cat-card-header">
            <input
              className="cat-label-input"
              value={cat.label}
              onChange={(e) => updateCategory(catIndex, (c) => (c.label = e.target.value))}
            />
            <button onClick={() => deleteCategory(catIndex)} className="btn-delete">
              Delete category
            </button>
          </div>

          {cat.items.map((item, itemIndex) =>
            item.groupLabel !== undefined ? (
              <div key={itemIndex} className="group-row">
                <input
                  className="group-input"
                  value={item.groupLabel}
                  placeholder="Sub-heading"
                  onChange={(e) => updateItem(catIndex, itemIndex, 'groupLabel', e.target.value)}
                />
                <button onClick={() => deleteItem(catIndex, itemIndex)} className="btn-x">
                  ✕
                </button>
              </div>
            ) : (
              <div key={itemIndex} className="item-row">
                <input
                  className="input-name"
                  value={item.name || ''}
                  placeholder="Name"
                  onChange={(e) => updateItem(catIndex, itemIndex, 'name', e.target.value)}
                />
                <input
                  className="input-variant"
                  value={item.variant || ''}
                  placeholder="Variant (optional)"
                  onChange={(e) => updateItem(catIndex, itemIndex, 'variant', e.target.value)}
                />
                <input
                  className="input-price"
                  value={item.price || ''}
                  placeholder="Price"
                  onChange={(e) => updateItem(catIndex, itemIndex, 'price', e.target.value)}
                />
                <input
                  className="input-desc"
                  value={item.desc || ''}
                  placeholder="Description (optional)"
                  onChange={(e) => updateItem(catIndex, itemIndex, 'desc', e.target.value)}
                />
                <button onClick={() => deleteItem(catIndex, itemIndex)} className="btn-x">
                  ✕
                </button>
              </div>
            )
          )}

          <div className="cat-card-footer">
            <button onClick={() => addItem(catIndex)} className="btn-add">
              + Add item
            </button>
            <button
              onClick={() =>
                updateCategory(catIndex, (c) => c.items.push({ groupLabel: 'New sub-heading' }))
              }
              className="btn-add"
            >
              + Add sub-heading
            </button>
          </div>
        </div>
      ))}

      <button onClick={addCategory} className="btn-add-category">
        + Add category
      </button>
    </div>
  );
}
