'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../app/admin/admin.css';

const RESTAURANTS = [
  { slug: 'godown-bar', label: 'The Godown Bar' },
  { slug: 'southern-station', label: 'Southern Station' },
];

function DragHandle({ attributes, listeners, extraClass }) {
  return (
    <button
      type="button"
      className={'drag-handle' + (extraClass ? ' ' + extraClass : '')}
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      ⠿
    </button>
  );
}

function SortableRow({ id, item, catIndex, itemIndex, updateItem, deleteItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative',
  };

  if (item.groupLabel !== undefined) {
    return (
      <div ref={setNodeRef} style={style} className="group-row">
        <DragHandle attributes={attributes} listeners={listeners} extraClass="drag-handle-row" />
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
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="item-row">
      <DragHandle attributes={attributes} listeners={listeners} extraClass="drag-handle-row" />
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
  );
}

function SortableCategoryCard({
  cat,
  catIndex,
  updateCategory,
  deleteCategory,
  addItem,
  addSubheading,
  updateItem,
  deleteItem,
  reorderItems,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.key,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const itemSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const itemIds = cat.items.map((_, i) => `${cat.key}-item-${i}`);

  function handleItemDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(active.id);
    const newIndex = itemIds.indexOf(over.id);
    reorderItems(catIndex, oldIndex, newIndex);
  }

  return (
    <div ref={setNodeRef} style={style} className="cat-card">
      <div className="cat-card-header">
        <DragHandle attributes={attributes} listeners={listeners} />
        <input
          className="cat-label-input"
          value={cat.label}
          onChange={(e) => updateCategory(catIndex, (c) => (c.label = e.target.value))}
        />
        <button onClick={() => deleteCategory(catIndex)} className="btn-delete">
          Delete category
        </button>
      </div>

      <DndContext
        sensors={itemSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleItemDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {cat.items.map((item, itemIndex) => (
            <SortableRow
              key={itemIds[itemIndex]}
              id={itemIds[itemIndex]}
              item={item}
              catIndex={catIndex}
              itemIndex={itemIndex}
              updateItem={updateItem}
              deleteItem={deleteItem}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="cat-card-footer">
        <button onClick={() => addItem(catIndex)} className="btn-add">
          + Add item
        </button>
        <button onClick={() => addSubheading(catIndex)} className="btn-add">
          + Add sub-heading
        </button>
      </div>
    </div>
  );
}

export default function AdminEditor() {
  const [slug, setSlug] = useState(RESTAURANTS[0].slug);
  const [data, setData] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [statusOk, setStatusOk] = useState(true);

  const categorySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

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

  function addSubheading(catIndex) {
    updateCategory(catIndex, (c) => {
      c.items.push({ groupLabel: 'New sub-heading' });
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

  function reorderItems(catIndex, oldIndex, newIndex) {
    updateCategory(catIndex, (c) => {
      c.items = arrayMove(c.items, oldIndex, newIndex);
    });
  }

  function handleCategoryDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    updateTab((t) => {
      const oldIndex = t.categories.findIndex((c) => c.key === active.id);
      const newIndex = t.categories.findIndex((c) => c.key === over.id);
      t.categories = arrayMove(t.categories, oldIndex, newIndex);
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

      <DndContext
        sensors={categorySensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        <SortableContext
          items={tab.categories.map((c) => c.key)}
          strategy={verticalListSortingStrategy}
        >
          {tab.categories.map((cat, catIndex) => (
            <SortableCategoryCard
              key={cat.key}
              cat={cat}
              catIndex={catIndex}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              addItem={addItem}
              addSubheading={addSubheading}
              updateItem={updateItem}
              deleteItem={deleteItem}
              reorderItems={reorderItems}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button onClick={addCategory} className="btn-add-category">
        + Add category
      </button>
    </div>
  );
}
