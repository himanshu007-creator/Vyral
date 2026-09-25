import { useEffect, useRef, useState } from 'react';
import Studio from '../studio/Studio';
import Avatar from './Avatar';
import { useGame } from '../game';
import { toBlob } from '../lib/image';
import { play } from '../lib/sfx';
import { NPCS, THREADS } from '../data/npc';
import './apps.css';

const ORDER = ['mom', 'linda', 'unknown', 'malone', 'dwayne', 'kayleigh', 'chad'];

export default function IText({ q, nav, home }) {
  const { state, media, addText, addMedia, push, clock } = useGame();
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);
  const msgs = (id) => [...THREADS[id].base, ...(state.texts[id] || [])];
  const answered = (id) => (state.texts[id] || []).some((m) => m.mediaId);
  const view = q.view || 'list';

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [q.id, state.texts]);

  if (view === 'studio') {
    const req = msgs(q.id).find((m) => m.request);
    if (!req) return <div />;
    return (
      <Studio
        skin="text"
        image={req.request}
        onBack={() => nav({ view: 'thread' })}
        onDone={async (image) => {
          const item = await addMedia({ app: 'itext', blob: await toBlob(image), thread: q.id });
          addText(q.id, { from: 'me', mediaId: item.id });
          nav({ view: 'thread' });
          play('send');
          setTimeout(() => {
            setTyping(true);
            play('typing', 0.35);
          }, 800);
          setTimeout(() => {
            setTyping(false);
            push({ app: 'itext', view: 'thread', target: q.id, kind: 'text', from: q.id, text: THREADS[q.id].onEdited, title: NPCS[q.id].name, avatar: NPCS[q.id].photo });
          }, 3400);
        }}
      />
    );
  }

  if (view === 'thread' && THREADS[q.id]) {
    const list = msgs(q.id);
    return (
      <div className="ios-app">
        <div className="ios-nav">
          <button className="back" onClick={() => nav({ view: null, id: null })}>
            Messages
          </button>
          {NPCS[q.id].name}
        </div>
        <div className="sms">
          {list.map((m, i) => {
            const img = m.mediaId && media.find((x) => x.id === m.mediaId)?.url;
            return (
              <div key={i} className={`sms-row ${m.from === 'me' ? 'me' : ''}`}>
                <div className={`bubble ${m.from === 'me' ? 'me' : ''}`}>
                  {m.text}
                  {m.request && <img src={m.request} alt="" />}
                  {img && <img src={img} alt="" />}
                  {m.image && <img src={m.image} alt="" />}
                </div>
                {m.request && !answered(q.id) && (
                  <button className="sms-edit" onClick={() => nav({ view: 'studio' })}>
                    ✎ Edit & send back
                  </button>
                )}
              </div>
            );
          })}
          {typing && (
            <div className="sms-row">
              <div className="bubble sms-typing">
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
          {THREADS[q.id].receipt && <p className="sms-receipt">{THREADS[q.id].receipt}</p>}
          {!typing && list[list.length - 1]?.from === 'me' && !THREADS[q.id].receipt && <p className="sms-receipt">Read {clock.hhmm} {clock.ampm}</p>}
          <div ref={endRef} />
        </div>
        <form
          className="sms-input"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            addText(q.id, { from: 'me', text: draft.trim() });
            setDraft('');
            play('send', 0.4);
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Text Message" />
          <button>Send</button>
        </form>
      </div>
    );
  }

  return (
    <div className="ios-app">
      <div className="ios-nav">
        <button className="back" onClick={home}>
          Home
        </button>
        Messages
      </div>
      <div className="ios-list">
        {ORDER.map((id) => {
          const list = msgs(id);
          const last = list[list.length - 1];
          const pending = list.some((m) => m.request) && !answered(id);
          return (
            <button key={id} className="ios-row" onClick={() => nav({ view: 'thread', id })}>
              <i className={`unread ${pending || (state.texts[id] || []).length ? 'on' : ''}`} />
              <Avatar id={id} size={40} />
              <span className="ios-row-body">
                <b>{NPCS[id].name}</b>
                <small>{pending ? '📷 wants you to edit a photo' : last ? last.text || '📷 Photo' : 'No messages. Suspicious.'}</small>
              </span>
              <span className="chev">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
