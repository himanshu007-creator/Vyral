import { useEffect, useMemo, useRef, useState } from 'react';
import CameraView from '../../camera/CameraView';
import Studio from '../../studio/Studio';
import { SusChatLogo } from '../../phone/Icons';
import { useGame } from '../../game';
import { getKV, setKV } from '../../lib/db';
import { toBlob } from '../../lib/image';
import { ago, gameMinutes } from '../../lib/useGameClock';
import { play } from '../../lib/sfx';
import Video from '../../ui/Video';
import ReelPager from '../../ui/ReelPager';
import { blankPng, burnOverlay } from '../../lib/video';
import { Pin, Chat, Camera, People, Play, Search, Back } from '../../ui/icons';
import { NPCS, SNAP_REPLIES, SUS_FRIENDS } from '../../data/npc';
import { REELS, ACCOUNTS } from '../../data/media';
import { TEXT_LINES } from '../../data/feed-events';
import './suschat.css';

const DRAFT = 'draft:sus';
const ME = '/media/avatars/me.webp';

function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="sus-splash" onClick={onDone}>
      <div className="sus-splash-logo">
        <SusChatLogo bg={false} bubble animated />
      </div>
      <b>SusChat</b>
      <span>For conversations you’ll deny later.</span>
    </div>
  );
}

function Nav({ view, nav, unreadChats }) {
  const item = (v, Icon, label, extra) => (
    <button className={view === v ? 'on' : ''} onClick={() => nav({ view: v, id: null })} aria-label={label}>
      <Icon size={22} />
      {extra}
    </button>
  );
  return (
    <nav className={`sus-nav ${view === 'camera' ? 'sus-nav--over' : ''}`}>
      {item('map', Pin, 'Map')}
      {item('chats', Chat, 'Chat', unreadChats ? <i className="sus-nav-dot">{unreadChats}</i> : null)}
      {item('camera', Camera, 'Camera')}
      {item('stories', People, 'Stories')}
      {item('nearby', Play, 'Nearby')}
    </nav>
  );
}

function Head({ title, nav, right }) {
  return (
    <header className="sus-head">
      <img className="sus-head-me" src={ME} alt="" onClick={() => nav({ view: 'stories' })} />
      <button className="sus-head-search" onClick={() => nav({ view: 'nearby' })} aria-label="Search">
        <Search size={18} />
      </button>
      <b>{title}</b>
      <span className="sus-head-right">{right}</span>
    </header>
  );
}

function Row({ id, title, sub, left, sel, toggle }) {
  return (
    <button className={`sus-row ${sel.includes(id) ? 'on' : ''}`} onClick={() => toggle(id)}>
      {left}
      <span className="sus-row-body">
        <b>{title}</b>
        <small>{sub}</small>
      </span>
      <i className="sus-check">{sel.includes(id) ? '✓' : ''}</i>
    </button>
  );
}

function SendTo({ image, onSend, onBack }) {
  const [sel, setSel] = useState(['story']);
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="sus-send">
      <header className="sus-head sus-head--plain">
        <button onClick={onBack} aria-label="Back">
          <Back />
        </button>
        <b>Send To…</b>
        <img className="sus-send-thumb" src={image} alt="" />
      </header>
      <div className="sus-list">
        <p className="sus-sec">Stories</p>
        <Row sel={sel} toggle={toggle} id="story" title="My Story" sub="Expires in 24 game hours. Screenshots are forever." left={<img className="sus-av" src={ME} alt="" />} />
        <Row sel={sel} toggle={toggle} id="spotlight" title="Spotlight" sub="for the algorithm 🙏" left={<span className="sus-story-dot">⚡</span>} />
        <p className="sus-sec">Best Friends</p>
        {SUS_FRIENDS.map((f) => (
          <Row
            sel={sel}
            toggle={toggle}
            key={f.id}
            id={f.id}
            title={
              <>
                {NPCS[f.id].name} {f.streak ? <em>🔥{f.streak}</em> : <em>🧊0</em>}
                {f.streak > 100 && <em>⏳</em>}
              </>
            }
            sub={f.status}
            left={<img className="sus-av" src={NPCS[f.id].photo} alt="" />}
          />
        ))}
      </div>
      <button className="sus-send-btn" disabled={!sel.length} onClick={() => onSend(sel)}>
        Send {sel.length ? `(${sel.length})` : ''} ➤
      </button>
    </div>
  );
}

function Viewer({ image, video, title, avatar, sub, onClose, onReply }) {
  const { alert } = useGame();
  useEffect(() => {
    const t = setTimeout(onClose, 10000);
    const s = Math.random() < 0.35 && setTimeout(() => alert({ title: '📸 Screenshot?', text: `Relax. We told ${title} you took a screenshot. You’re welcome.`, buttons: [{ label: 'I didn’t!' }] }), 3500);
    return () => {
      clearTimeout(t);
      clearTimeout(s);
    };
  }, [onClose, alert, title]);
  return (
    <div className="sus-viewer" onClick={onClose}>
      {video ? <Video src={video.src} poster={video.poster} className="sus-viewer-media" active /> : <img className="sus-viewer-media" src={image} alt="" />}
      <div className="sus-viewer-top">
        <i className="sus-progress">
          <b />
        </i>
        <span>
          {avatar && <img src={avatar} alt="" />}
          <span>
            <b>{title}</b>
            <small>{sub}</small>
          </span>
          <i className="sus-timer" />
        </span>
      </div>
      {onReply && (
        <button
          className="sus-viewer-reply"
          onClick={(e) => {
            e.stopPropagation();
            onReply();
          }}
        >
          💬 Send a chat…
        </button>
      )}
    </div>
  );
}

// Snap Map hotzones → "Our Story": the clips play as stories (segments, tap to skip, auto-advance).
const HOTZONES = [
  { id: 'r-beach', name: 'Vice Beach', snaps: 312, x: 62, y: 80 },
  { id: 'r-neon', name: 'Ocean View Strip', snaps: 1204, x: 84, y: 58 },
  { id: 'r-swamp', name: 'Grassrivers', snaps: 47, x: 36, y: 90 },
  { id: 'r-cars', name: 'Palm Row', snaps: 188, x: 14, y: 14 },
];

function OurStory({ zone, onClose }) {
  const start = Math.max(0, REELS.findIndex((r) => r.id === zone.id));
  const list = [...REELS.slice(start), ...REELS.slice(0, start)];
  const [i, setI] = useState(0);
  const r = list[i];
  const next = () => (i + 1 < list.length ? setI(i + 1) : onClose());
  const prev = () => setI(Math.max(0, i - 1));
  return (
    <div className="sus-viewer sus-ourstory">
      <video
        key={r.id}
        className="sus-viewer-media"
        src={r.src}
        poster={r.poster}
        autoPlay
        muted
        playsInline
        onEnded={next}
        ref={(v) => v && (v.muted = true)}
      />
      <div className="sus-viewer-top">
        <div className="sus-segs">
          {list.map((x, k) => (
            <i key={x.id}>
              <b className={k < i ? 'done' : k === i ? 'run' : ''} key={k === i ? `${x.id}-${i}` : x.id} />
            </i>
          ))}
        </div>
        <span>
          <span className="sus-zone-pin">📍</span>
          <span>
            <b>{zone.name} · Our Story</b>
            <small>
              {r.place} · {ACCOUNTS[r.acct].name} · {zone.snaps} snaps nearby
            </small>
          </span>
          <button onClick={onClose} aria-label="Close" className="sus-story-x">
            ✕
          </button>
        </span>
      </div>
      <button className="sus-tap sus-tap--l" onClick={prev} aria-label="Previous" />
      <button className="sus-tap sus-tap--r" onClick={next} aria-label="Next" />
      <p className="sus-story-cap">{r.text}</p>
    </div>
  );
}

function Thread({ id, nav }) {
  const { state, patch, push } = useGame();
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const list = (state.sus || {})[id] || [];
  const friend = SUS_FRIENDS.find((f) => f.id === id);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [list.length, typing]);
  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    patch((s) => ({ ...s, sus: { ...(s.sus || {}), [id]: [...((s.sus || {})[id] || []), { from: 'me', text: t }] } }));
    setText('');
    play('send', 0.3);
    setTimeout(() => {
      setTyping(true);
      play('typing', 0.35);
    }, 900);
    setTimeout(() => {
      setTyping(false);
      const lines = TEXT_LINES[id] || ['k'];
      push({ app: 'suschat', view: 'thread', target: id, kind: 'sus', title: NPCS[id].name, text: lines[Math.floor(Math.random() * lines.length)], avatar: NPCS[id].photo });
    }, 3200);
  };
  return (
    <div className="sus sus-page">
      <header className="sus-head sus-head--plain">
        <button onClick={() => nav({ view: 'chats', id: null })} aria-label="Back">
          <Back />
        </button>
        <img className="sus-av sus-av--sm" src={NPCS[id].photo} alt="" />
        <b>{NPCS[id].name}</b>
        <span className="sus-dim">{friend?.streak ? `🔥${friend.streak}` : ''}</span>
      </header>
      <div className="sus-thread">
        <p className="sus-thread-note">Chats are deleted after viewing. Receipts are not.</p>
        {list.length === 0 && <p className="sus-thread-note">{friend?.status}</p>}
        {list.map((m, i) => (
          <div key={i} className={`sus-msg ${m.from === 'me' ? 'me' : ''}`}>
            <b>{m.from === 'me' ? 'ME' : NPCS[id].name.split(' ')[0].toUpperCase()}</b>
            <p>{m.text}</p>
          </div>
        ))}
        {typing && (
          <div className="sus-msg">
            <b>{NPCS[id].name.split(' ')[0].toUpperCase()}</b>
            <p className="sus-typing">
              <i />
              <i />
              <i />
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form className="sus-input" onSubmit={send}>
        <button type="button" onClick={() => nav({ view: 'camera', id: null })} aria-label="Camera">
          <Camera size={20} />
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Send a chat" />
      </form>
    </div>
  );
}

export default function SusChat({ q, nav, flash }) {
  const { media, clock, state, addMedia, push, unlock, alert, patch, unread, celebratePost } = useGame();
  const view = q.view || 'splash';
  const [draft, setDraft] = useState(null);
  const [sent, setSent] = useState(false);
  const [render, setRender] = useState(null);
  const blank = useMemo(() => (draft?.kind === 'video' ? blankPng(draft.w, draft.h) : null), [draft]);
  const clipUrl = useMemo(() => (draft?.kind === 'video' ? URL.createObjectURL(draft.blob) : null), [draft]);
  const opened = state.opened || {};

  useEffect(() => {
    if ((view === 'studio' || view === 'send') && !draft)
      getKV(DRAFT).then((d) => (d ? setDraft(d) : nav({ view: 'camera' }, { replace: true })));
  }, [view, draft, nav]);

  // Opening a snap marks it opened (persisted) — done in an effect, never during render.
  useEffect(() => {
    if (view === 'viewer' && q.id) patch((s) => (s.opened?.[q.id] ? s : { ...s, opened: { ...(s.opened || {}), [q.id]: true } }));
  }, [view, q.id, patch]);

  const saveDraft = (d) => {
    setDraft(d);
    setKV(DRAFT, d);
  };

  const mine = media.filter((m) => m.app === 'suschat');
  const stories = mine.filter((m) => m.story && m.expiresAt > clock.total);
  // Inbox = engine-delivered snaps + the starter snaps from friends.
  const inbox = [...(state.inbox || []), ...SUS_FRIENDS.filter((f) => f.snap).map((f) => ({ id: `seed-${f.id}`, from: f.id, ...f.snap, at: 0 }))];
  const unopenedFrom = (id) => inbox.find((s) => s.from === id && !opened[s.id]);
  const unreadChats = SUS_FRIENDS.filter((f) => unopenedFrom(f.id)).length;

  const send = async (sel) => {
    const isVideo = draft.kind === 'video';
    const blob = isVideo ? draft.blob : await toBlob(draft.image);
    await addMedia({ app: 'suschat', blob, to: sel, story: sel.includes('story'), expiresAt: gameMinutes() + 1440, lens: draft.lens, edited: draft.edited, ...(isVideo ? { kind: 'video', poster: draft.poster } : {}) });
    play('snap-sent');
    setSent(true);
    setTimeout(() => celebratePost('suschat'), 1300);
    setTimeout(() => {
      setSent(false);
      nav({ view: sel.includes('story') && sel.length === 1 ? 'stories' : 'chats' });
    }, 1300);
    unlock('firstSnap');
    const friends = sel.filter((id) => SNAP_REPLIES[id]);
    friends.forEach((id, i) =>
      setTimeout(() => push({ app: 'suschat', view: 'thread', target: id, kind: 'sus', title: NPCS[id].name, text: SNAP_REPLIES[id], avatar: NPCS[id].photo }), 3000 + i * 2800),
    );
    if (sel.includes('story'))
      setTimeout(() => push({ app: 'suschat', view: 'stories', kind: 'story', title: 'SusChat', text: '📸 Det. Malone took a screenshot of your story.', avatar: NPCS.malone.photo }), 3000 + friends.length * 2800 + 1500);
    if (sel.includes('spotlight'))
      setTimeout(() => alert({ title: 'Spotlight', text: 'Your snap was rejected from Spotlight: “insufficient suffering.” Try the Mugshot lens.', buttons: [{ label: 'Rude' }] }), 2200);
  };

  const navBar = <Nav view={view} nav={nav} unreadChats={unreadChats || unread.suschat} />;

  if (view === 'splash') return <Splash onDone={() => nav({ view: 'camera' }, { replace: true })} />;

  if (view === 'camera')
    return (
      <div className="sus">
        <CameraView
          mode="sus"
          flashMsg={flash}
          onCapture={(image, { lens }) => {
            saveDraft({ image, lens });
            nav({ view: 'studio' });
          }}
          onVideo={({ blob, poster, w, h, lens }) => {
            saveDraft({ kind: 'video', blob, poster, w, h, lens });
            nav({ view: 'studio' });
          }}
          top={
            <div className="sus-cam-top">
              <img className="sus-head-me" src={ME} alt="" onClick={() => nav({ view: 'stories' })} />
              <button className="sus-cam-search" onClick={() => nav({ view: 'nearby' })}>
                <Search size={18} /> Search
              </button>
            </div>
          }
        />
        {navBar}
      </div>
    );

  if (view === 'studio' && draft?.kind === 'video')
    return (
      <Studio
        skin="sus"
        image={blank}
        guide={draft.poster}
        guideVideo={clipUrl}
        busy={render}
        onBack={() => nav({ view: 'camera' })}
        onDone={async (overlay, { edited }) => {
          setRender(0);
          const out = await burnOverlay(draft.blob, overlay, setRender);
          setRender(null);
          saveDraft({ ...draft, blob: out.blob, poster: out.poster, edited });
          nav({ view: 'send' });
        }}
      />
    );

  if (view === 'studio')
    return draft ? (
      <Studio
        skin="sus"
        image={draft.image}
        onBack={() => nav({ view: 'camera' })}
        onDone={(image, { edited }) => {
          saveDraft({ ...draft, image, edited });
          nav({ view: 'send' });
        }}
      />
    ) : (
      <div className="sus" />
    );

  if (view === 'send')
    return draft ? (
      <div className="sus">
        <SendTo image={draft.kind === 'video' ? draft.poster : draft.image} onSend={send} onBack={() => nav({ view: 'studio' })} />
        {sent && (
          <div className="sus-sent">
            <span>➤</span>
            <b>Sent!</b>
            <small>no take-backs</small>
          </div>
        )}
      </div>
    ) : (
      <div className="sus" />
    );

  if (view === 'thread' && NPCS[q.id]) return <Thread id={q.id} nav={nav} />;

  if (view === 'viewer') {
    const snap = inbox.find((s) => s.id === q.id);
    const own = mine.find((m) => m.id === q.id);
    const close = () => nav({ view: own ? 'stories' : 'chats', id: null }, { replace: true });
    if (snap) {
      return (
        <Viewer
          image={snap.image}
          title={NPCS[snap.from].name}
          avatar={NPCS[snap.from].photo}
          sub={snap.caption}
          onClose={close}
          onReply={() => nav({ view: 'thread', id: snap.from }, { replace: true })}
        />
      );
    }
    if (own) {
      const views = Math.min(9999, Math.floor((clock.total - own.createdAt) * 2.7) + 3);
      return (
        <Viewer
          image={own.url}
          video={own.kind === 'video' ? { src: own.url, poster: own.poster } : null}
          title="My Story"
          avatar={ME}
          sub={`👀 ${views} views — ${Math.max(1, views - 3)} are your ex`}
          onClose={close}
        />
      );
    }
    return <div className="sus" onClick={close} />;
  }

  if (view === 'hotzone') {
    const zone = HOTZONES.find((z) => z.id === q.id) || HOTZONES[0];
    return <OurStory key={zone.id} zone={zone} onClose={() => nav({ view: 'map', id: null }, { replace: true })} />;
  }

  if (view === 'nearby')
    return (
      <div className="sus sus-dark">
        <ReelPager
          key={q.id || 'nearby'}
          items={REELS}
          start={Math.max(0, REELS.findIndex((r) => r.id === q.id))}
          render={(r, active) => (
            <div className="sus-nearby-item">
              <Video src={r.src} poster={r.poster} className="sus-viewer-media" active={active} />
              <div className="sus-nearby-meta" onPointerDown={(e) => e.stopPropagation()}>
                <span className="sus-nearby-dist">
                  📍 {r.mi} mi · {r.place}
                </span>
                <b>
                  <img src={ACCOUNTS[r.acct].avatar} alt="" /> {ACCOUNTS[r.acct].name}
                </b>
                <p>{r.text}</p>
                <button onClick={() => alert({ title: 'Add Friend', text: 'Friend request sent. They blocked you in 0.3 seconds. New record!', buttons: [{ label: 'Worth it' }] })}>+ Add Friend</button>
              </div>
            </div>
          )}
        />
        <header className="sus-nearby-head">
          <b>Nearby</b>
          <small>Spotlight from people 0.3 mi away (too close)</small>
        </header>
        {navBar}
      </div>
    );

  if (view === 'map') {
    const pins = [
      ['mom', 22, 30, 'Church bingo'],
      ['dwayne', 64, 48, 'Gas · Bait · Lotto'],
      ['kayleigh', 40, 62, 'Healing (at the mall)'],
      ['chad', 76, 22, 'Wi-Fi at Waffle House'],
      ['malone', 52, 36, 'Suspiciously close to you'],
      ['linda', 18, 72, 'MLM seminar'],
    ];
    return (
      <div className="sus sus-map">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sus-map-bg">
          <rect width="100" height="100" fill="#c9e7f4" />
          <path d="M0 0 H70 Q62 30 72 55 T60 100 H0Z" fill="#f1ede3" />
          <path d="M10 0 V100 M0 40 H70 M35 0 L55 100 M0 80 H65" stroke="#fff" strokeWidth="2.2" />
          <path d="M10 0 V100 M0 40 H70 M35 0 L55 100 M0 80 H65" stroke="#ffd66b" strokeWidth=".6" />
          <circle cx="30" cy="20" r="9" fill="#bfe3b4" />
        </svg>
        {HOTZONES.map((z) => (
          <button key={z.id} className="sus-hot" style={{ left: `${z.x}%`, top: `${z.y}%` }} onClick={() => nav({ view: 'hotzone', id: z.id })}>
            <i />
            <small>
              🔥 {z.name} · {z.snaps}
            </small>
          </button>
        ))}
        {pins.map(([id, x, y, place]) => (
          <button key={id} className="sus-pin" style={{ left: `${x}%`, top: `${y}%` }} onClick={() => nav({ view: 'thread', id })}>
            <img src={NPCS[id].photo} alt="" />
            <small>{place}</small>
          </button>
        ))}
 <div className="sus-cop" title="VCPD patrol">
          🚓
        </div>
        <div className="sus-pin sus-pin--me" style={{ left: '28%', top: '50%' }}>
          <img src={ME} alt="" />
          <small>You · ghost mode ON (they can still see you)</small>
        </div>
        <Head title="Leonida" nav={nav} right="👻" />
        {navBar}
      </div>
    );
  }

  if (view === 'stories')
    return (
      <div className="sus sus-page">
        <Head title="Stories" nav={nav} />
        <div className="sus-list">
          <p className="sus-sec">My Story</p>
          {stories.length === 0 && <p className="sus-empty">Nothing yet. Post something you’ll regret.</p>}
          {stories.map((s) => {
            const left = s.expiresAt - clock.total;
            return (
              <button key={s.id} className="sus-row" onClick={() => nav({ view: 'viewer', id: s.id })}>
                <img className="sus-story-thumb" src={s.kind === 'video' ? s.poster : s.url} alt="" />
                <span className="sus-row-body">
                  <b>My Story</b>
                  <small>
                    ⏳ {Math.floor(left / 60)}h {left % 60}m left (game time) · 👀 {Math.floor((clock.total - s.createdAt) * 2.7) + 3}
                  </small>
                </span>
              </button>
            );
          })}
          <p className="sus-sec">Friends</p>
          <div className="sus-story-row">
            {inbox
              .filter((s, i, a) => a.findIndex((x) => x.from === s.from) === i)
              .map((s) => (
                <button key={s.id} className="sus-story-bubble" onClick={() => nav({ view: 'viewer', id: s.id })}>
                  <img className={opened[s.id] ? '' : 'ring'} src={NPCS[s.from].photo} alt="" />
                  <small>{NPCS[s.from].name.split(' ')[0]}</small>
                </button>
              ))}
          </div>
          <p className="sus-sec">Discover</p>
          <div className="sus-discover">
            {REELS.map((r) => (
              <button key={r.id} onClick={() => nav({ view: 'nearby', id: r.id })}>
                <img src={r.poster} alt="" />
                <b>{ACCOUNTS[r.acct].name}</b>
              </button>
            ))}
          </div>
        </div>
        {navBar}
      </div>
    );

  // chats
  const lastTo = (id) => mine.find((m) => m.to?.includes(id));
  return (
    <div className="sus sus-page">
      <Head title="Chat" nav={nav} right={<button onClick={() => nav({ view: 'camera' })}>✎</button>} />
      <div className="sus-list">
        {SUS_FRIENDS.map((f) => {
          const out = lastTo(f.id);
          const fresh = unopenedFrom(f.id);
          const lastChat = ((state.sus || {})[f.id] || []).slice(-1)[0];
          let icon = 'sq-empty';
          let status = f.status;
          if (fresh) [icon, status] = ['sq-red', `New Snap · ${ago(clock.total - (fresh.at || clock.total - 90))}`];
          else if (lastChat && lastChat.from !== 'me') [icon, status] = ['chat-blue', `New Chat · ${lastChat.text}`];
          else if (out) [icon, status] = clock.total - out.createdAt < 2 ? ['arrow-red', 'Delivered'] : ['arrow-open', `Opened · ${SNAP_REPLIES[f.id] ? 'they have thoughts' : ''}`];
          return (
            <button key={f.id} className="sus-row" onClick={() => (fresh ? nav({ view: 'viewer', id: fresh.id }) : nav({ view: 'thread', id: f.id }))}>
              <img className="sus-av" src={NPCS[f.id].photo} alt="" />
              <span className="sus-row-body">
                <b>
                  {NPCS[f.id].name} {f.streak ? <em>🔥{f.streak}</em> : null}
                  {f.streak > 100 && <em>⏳</em>}
                </b>
                <small className={fresh ? 'sus-new' : ''}>
                  <i className={`sus-glyph ${icon}`} /> {status}
                </small>
              </span>
            </button>
          );
        })}
      </div>
      {navBar}
    </div>
  );
}
