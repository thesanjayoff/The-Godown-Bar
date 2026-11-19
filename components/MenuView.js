'use client';

import { useState, useMemo, useRef } from 'react';

function Panel({ side, className, children, innerRef }) {
  const stripe = <div className="stripe" aria-hidden="true" />;
  const content = <div className="content">{children}</div>;
  return (
    <div className={'panel ' + (className || '')} data-side={side} ref={innerRef}>
      {side === 'left' ? stripe : null}
      {content}
      {side === 'right' ? stripe : null}
    </div>
  );
}

export default function MenuView({ data, slug }) {
  const tabs = data.tabs || [];
  const [activeTabKey, setActiveTabKey] = useState(tabs[0]?.key);
  const activeTab = useMemo(
    () => tabs.find((t) => t.key === activeTabKey) || tabs[0],
    [tabs, activeTabKey]
  );
  const categories = activeTab?.categories || [];
  const [activeFilter, setActiveFilter] = useState('all');
  const filtersAnchorRef = useRef(null);
  const filtersBarRef = useRef(null);
  const tabnavRef = useRef(null);
  const catRefs = useRef({});

  const scrollToTarget = (el) => {
    requestAnimationFrame(() => {
      if (!el) return;
      const barHeight =
        (filtersBarRef.current?.offsetHeight || 0) + (tabnavRef.current?.offsetHeight || 0);
      const top = el.getBoundingClientRect().top + window.scrollY - barHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  const scrollToFilters = () => scrollToTarget(filtersAnchorRef.current);

  const selectFilter = (key) => {
    setActiveFilter(key);
    if (key === 'all') {
      scrollToFilters();
    } else {
      scrollToTarget(catRefs.current[key]);
    }
  };

  const isGodownBar = slug === 'godown-bar';
  const isSouthern = slug === 'southern-station';
  const itemLayout = isGodownBar ? (activeTab?.key === 'food' ? 'stacked' : 'sidebyside') : 'inline';

  let panelIndex = 0;
  const nextSide = () => (panelIndex++ % 2 === 0 ? 'left' : 'right');

  return (
    <div className="page" data-theme={activeTab?.theme || 'light'}>
      <Panel side={nextSide()} className="cover">
        {isGodownBar ? (
          <img
            src={`/godown-bar/logo-monogram-${activeTab?.theme === 'dark' ? 'gold' : 'black'}.png`}
            alt={data.restaurantName}
            className="cover-logo"
          />
        ) : (
          <img
            src="/southern-station/badge-logo.png"
            alt={data.restaurantName}
            className="cover-badge-logo"
          />
        )}
        <h1>{activeTab?.coverTitle}</h1>
      </Panel>

      {tabs.length > 1 ? (
        <div className="tabnav" ref={tabnavRef}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={'tabbtn' + (t.key === activeTabKey ? ' active' : '')}
              onClick={() => {
                setActiveTabKey(t.key);
                setActiveFilter('all');
                scrollToFilters();
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      <div ref={filtersAnchorRef} aria-hidden="true" style={{ height: 0 }} />
      <div className="filters" ref={filtersBarRef}>
        <button
          type="button"
          className={'chip' + (activeFilter === 'all' ? ' active' : '')}
          onClick={() => selectFilter('all')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            className={'chip' + (activeFilter === c.key ? ' active' : '')}
            onClick={() => selectFilter(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {categories.map((cat) => (
        <Panel
          side={nextSide()}
          className="cat"
          key={cat.key}
          innerRef={(el) => {
            catRefs.current[cat.key] = el;
          }}
        >
          {isSouthern ? <p className="section-eyebrow">{cat.label}</p> : <h2 className="page-title">{cat.label}</h2>}

          {cat.items.map((item, i) => {
            if (item.groupLabel !== undefined) {
              return isSouthern ? (
                <h3 className="group-heading-flanked" key={i}>
                  <span>{item.groupLabel}</span>
                </h3>
              ) : (
                <h3 className="group-heading-underline" key={i}>
                  {item.groupLabel}
                </h3>
              );
            }

            if (itemLayout === 'stacked') {
              return (
                <div className="item-block stacked" key={i}>
                  <div className="name">{item.name}</div>
                  {item.variant ? <div className="variant">({item.variant.replace(/^\(|\)$/g, '')})</div> : null}
                  {item.price ? <div className="price">{item.price}</div> : null}
                </div>
              );
            }

            if (itemLayout === 'inline') {
              return (
                <div className="item-block inline" key={i}>
                  <div className="name-price-line">
                    <span className="name">{item.name}</span>
                    {item.price ? <span className="price"> {item.price}</span> : null}
                  </div>
                  {item.variant ? (
                    <div className="desc">{item.variant.replace(/^\(|\)$/g, '')}</div>
                  ) : null}
                  {item.desc ? <div className="desc">{item.desc}</div> : null}
                </div>
              );
            }

            return (
              <div className="item-block sidebyside" key={i}>
                <div className="name-price-line">
                  <span className="name">{item.name}</span>
                  {item.price ? <span className="price">{item.price}</span> : null}
                </div>
                {item.desc ? <div className="desc">{item.desc}</div> : null}
              </div>
            );
          })}

          <p className="note">All prices exclusive of GST &nbsp;|&nbsp; Please allow us at least 20 minutes to serve you</p>
        </Panel>
      ))}

      <Panel side={nextSide()} className="footer">
        <img
          src={isGodownBar ? '/godown-bar/s-hotels-logo.png' : '/southern-station/s-hotels-logo.png'}
          alt="S Hotels Chennai"
          className="footer-mark"
        />
        <p>{data.address}</p>
      </Panel>
    </div>
  );
}
