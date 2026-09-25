import { useRef, useState } from 'react';
import Studio from '../studio/Studio';
import { useGame } from '../game';
import { fileToDataUrl, shareFile, shareImage, toBlob } from '../lib/image';
import { play } from '../lib/sfx';
import './apps.css';

const FOLDERS = [
  ['all', 'All'],
  ['reelgram', 'Reelgram'],
  ['suschat', 'SusChat'],
  ['itext', 'iText'],
  ['roll', 'Edits'],
];

export default function FruitRoll({ q, nav, home }) {
  const { media, clock, addMedia, removeMedia, alert } = useGame();
  const [editing, setEditing] = useState(null);
  const swipe = useRef(null);
  const folder = q.folder || 'all';
  const items = media.filter((m) => folder === 'all' || m.app === folder);

  if (q.view === 'studio' && editing)
    return (
      <Studio
        skin="roll"
        image={editing}
        onBack={() => nav({ view: 'photo' })}
        onDone={async (image) => {
          const item = await addMedia({ app: 'roll', blob: await toBlob(image) });
          play('shutter', 0.3);
          nav({ view: 'photo', id: item.id, folder: 'roll' }, { replace: true });
        }}
      />
    );

  const idx = items.findIndex((m) => m.id === q.id);
  if ((q.view === 'photo' || q.view === 'studio') && idx >= 0) {
    const m = items[idx];
    const go = (d) => items[idx + d] && nav({ id: items[idx + d].id }, { replace: true });
    const expired = m.app === 'suschat' && m.expiresAt && m.expiresAt < clock.total;
    return (
      <div className="roll-photo">
        <div className="ios-nav ios-nav--dark">
          <button className="back" onClick={() => nav({ view: null, id: null })}>
            {FOLDERS.find((f) => f[0] === folder)[1]}
          </button>
          {idx + 1} of {items.length}
        </div>
        <div
          className="roll-stage"
          onPointerDown={(e) => (swipe.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = e.clientX - (swipe.current ?? e.clientX);
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            swipe.current = null;
          }}
        >
          {m.kind === 'video' ? <video src={m.url} poster={m.poster} autoPlay loop muted playsInline controls /> : <img src={m.url} alt="" draggable={false} />}
          {expired && <span className="roll-tag">EXPIRED (screenshotted by VCPD)</span>}
        </div>
        <div className="roll-tools">
          <button onClick={() => (m.kind === 'video' ? shareFile(m.blob, `vyral-${m.app}`) : shareImage(m.url, `vyral-${m.app}`))}>⤴</button>
          <button
            className="roll-edit"
            style={m.kind === 'video' ? { visibility: 'hidden' } : undefined}
            onClick={async () => {
              setEditing(await fileToDataUrl(m.blob));
              nav({ view: 'studio' });
            }}
          >
            ✎ Edit again
          </button>
          <button
            onClick={() =>
              alert({
                title: 'Delete Photo?',
                text: 'Deleting evidence is a crime in 49 states. Leonida is not one of them.',
                buttons: [
                  { label: 'Cancel' },
                  {
                    label: 'Delete',
                    onClick: () => {
                      removeMedia(m.id);
                      nav({ view: null, id: null }, { replace: true });
                    },
                  },
                ],
              })
            }
          >
            🗑
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ios-app">
      <div className="ios-nav">
        <button className="back" onClick={home}>
          Home
        </button>
        FruitRoll
      </div>
      <div className="roll-folders">
        {FOLDERS.map(([id, label]) => (
          <button key={id} className={folder === id ? 'on' : ''} onClick={() => nav({ folder: id === 'all' ? null : id }, { replace: true })}>
            {label} <small>{media.filter((m) => id === 'all' || m.app === id).length}</small>
          </button>
        ))}
      </div>
      <div className="roll-grid">
        {items.length === 0 && <p className="roll-empty">No photos. No evidence. Suspiciously clean. Open SusChat or Reelgram and make some.</p>}
        {items.map((m) => (
          <button key={m.id} onClick={() => nav({ view: 'photo', id: m.id })}>
            <img src={m.kind === 'video' ? m.poster : m.url} alt="" />
            {m.kind === 'video' && <span className="roll-vid">▶ 0:05</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
