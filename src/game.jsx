import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { allMedia, deleteMedia, getKV, putMedia, setKV } from './lib/db';
import useGameClock, { gameMinutes } from './lib/useGameClock';
import { likesOf, starsFor } from './lib/clout';
import { nav } from './lib/useUrlState';
import { play, buzz } from './lib/sfx';
import { NPCS, UNLOCK_TEXTS } from './data/npc';
import { SEED, ambient, gramBurstEvent } from './data/feed-events';

const Ctx = createContext(null);
// eslint-disable-next-line react/only-export-components
export const useGame = () => useContext(Ctx);

const uid = () => Math.random().toString(36).slice(2, 10);
const rand = (a, b) => a + Math.random() * (b - a);
const withUrl = (m) => ({ ...m, url: m.blob ? URL.createObjectURL(m.blob) : m.src });
const EMPTY = { unlocks: {}, texts: {}, stars: 0, notifs: null, liked: {}, saved: {}, comments: {}, inbox: [], calls: [], follows: {} };
const REPLIES = ['who asked', 'ratio', 'this is why your mom calls me', 'ok but post more', 'I’m telling Det. Malone', 'blocked (jk) (unless?)'];

export function GameProvider({ children }) {
  const clock = useGameClock();
  const [media, setMedia] = useState([]);
  const [state, setState] = useState(EMPTY);
  const stateRef = useRef(EMPTY);
  const [ready, setReady] = useState(false);
  const [banners, setBanners] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [passed, setPassed] = useState(null);
  const [ringing, setRinging] = useState(null);
  const [battery, setBattery] = useState(23);
  const [signal, setSignal] = useState(3);
  // True while shooting/editing/captioning — clout promotions wait until you're done.
  const [composing, setComposing] = useState(false);
  // Where the player is right now (set by App). Refs so the scheduler doesn't re-arm on every nav.
  const where = useRef({ app: null, up: false, playing: false });
  const setWhere = useCallback((w) => (where.current = { ...where.current, ...w }), []);
  const mediaRef = useRef([]);
  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    Promise.all([allMedia(), getKV('state')]).then(([m, s]) => {
      setMedia(m.map(withUrl).sort((a, b) => b.createdAt - a.createdAt));
      const next = { ...EMPTY, ...s };
      if (!next.notifs) next.notifs = SEED.map((n) => ({ ...n, id: uid(), at: gameMinutes(), read: false }));
      stateRef.current = next;
      readyRef.current = true;
      setState(next);
      setReady(true);
    });
  }, []);

  const readyRef = useRef(false);
  // Never persist before the saved state has loaded — that would overwrite the player's progress.
  const commit = useCallback((next) => {
    if (!readyRef.current) return;
    stateRef.current = next;
    setState(next);
    setKV('state', next);
  }, []);
  const patch = useCallback((fn) => commit(fn(stateRef.current)), [commit]);

  const deliver = useCallback((n) => {
    const bid = uid();
    setBanners((q) => [...q.slice(-2), { ...n, bid }]);
    play(`notify-${n.app || 'system'}`);
    buzz(30);
    setTimeout(() => setBanners((q) => q.filter((x) => x.bid !== bid)), 4200);
  }, []);

  /** The notification engine: record → apply side effect → deliver. */
  const push = useCallback(
    (evt) => {
      const n = { ...evt, id: uid(), at: gameMinutes(), read: false };
      const s = stateRef.current;
      const next = { ...s, notifs: [n, ...(s.notifs || [])].slice(0, 100) };
      if (evt.kind === 'text') next.texts = { ...s.texts, [evt.target]: [...(s.texts[evt.target] || []), { from: evt.from, text: evt.text }] };
      if (evt.kind === 'snap') next.inbox = [{ ...evt.snap, at: n.at }, ...s.inbox].slice(0, 30);
      if (evt.kind === 'comment') next.comments = { ...s.comments, [evt.target]: [...(s.comments[evt.target] || []), { who: evt.who, text: evt.comment }] };
      if (evt.kind === 'sus') next.sus = { ...s.sus, [evt.target]: [...((s.sus || {})[evt.target] || []), { from: evt.target, text: evt.text }] };
      if (evt.kind === 'call') next.calls = [{ who: evt.who || evt.target, type: 'missed', at: n.at }, ...s.calls].slice(0, 30);
      commit(next);
      if (!evt.silent) deliver(n);
      return n;
    },
    [commit, deliver],
  );

  const markRead = useCallback((pred) => patch((s) => ({ ...s, notifs: (s.notifs || []).map((n) => (pred(n) ? { ...n, read: true } : n)) })), [patch]);

  const alert = useCallback((d) => setDialog(d), []);

  const openNotif = useCallback(
    (n) => {
      if (n.id) markRead((x) => x.id === n.id);
      if (!n.app) return alert({ title: n.title, text: n.text, buttons: [{ label: 'Cool cool cool' }] });
      nav({ phone: 'up', app: n.app, view: n.view || null, id: n.target || null, folder: null });
    },
    [alert, markRead],
  );

  const addText = useCallback((thread, msg) => patch((s) => ({ ...s, texts: { ...s.texts, [thread]: [...(s.texts[thread] || []), msg] } })), [patch]);

  const unlock = useCallback(
    (key) => {
      if (stateRef.current.unlocks[key]) return;
      patch((s) => ({ ...s, unlocks: { ...s.unlocks, [key]: true } }));
      (UNLOCK_TEXTS[key] || []).forEach((m, i) =>
        setTimeout(
          () => push({ app: 'itext', view: 'thread', target: m.thread, kind: 'text', from: m.thread, text: m.text, title: NPCS[m.thread].name, avatar: NPCS[m.thread].photo }),
          1800 + i * 2600,
        ),
      );
      if (key === 'star3') setTimeout(() => setRinging({ who: 'malone' }), 9000);
    },
    [patch, push],
  );

  const addMedia = useCallback(async (m) => {
    const item = { id: crypto.randomUUID(), createdAt: gameMinutes(), ...m };
    await putMedia(item);
    setMedia((list) => [withUrl(item), ...list]);
    return item;
  }, []);

  const removeMedia = useCallback(async (id) => {
    await deleteMedia(id);
    setMedia((list) => list.filter((m) => m.id !== id));
  }, []);

  // Social actions (all persisted).
  const toggle = useCallback((key, id) => patch((s) => ({ ...s, [key]: { ...s[key], [id]: !s[key][id] } })), [patch]);
  const addComment = useCallback(
    (postId, text) => {
      patch((s) => ({ ...s, comments: { ...s.comments, [postId]: [...(s.comments[postId] || []), { who: 'newinleonida', text, mine: true }] } }));
      const who = ['kayleigh.heals', 'dwayne.flips.cars', 'vcpd_malone', 'linda_lives_laughs'][Math.floor(Math.random() * 4)];
      const reply = `@newinleonida ${REPLIES[Math.floor(Math.random() * REPLIES.length)]}`;
      setTimeout(() => push({ app: 'reelgram', view: 'post', target: postId, kind: 'comment', who, comment: reply, title: 'Reelgram', text: `${who} replied: ${reply}` }), rand(5000, 11000));
    },
    [patch, push],
  );

  // After posting: a burst of likes/comments/follows about that post.
  // Story audience: views + reactions trickle in, each notification opens your story.
  const storyBurst = useCallback(() => {
    const who = ['kayleigh.heals', 'vcpd_malone', 'aunt_linda', 'dwayne.flips.cars', 'chad.eth', 'blessed_brenda_62'];
    const lines = ['viewed your story 👀', 'reacted 😍 to your story', 'replied: “who is that”', 'reacted 😂 to your story', 'viewed your story (again)', 'took a screenshot 📸'];
    who.forEach((h, i) =>
      setTimeout(() => push({ app: 'reelgram', view: 'mystory', kind: 'story', who: h, title: 'Reelgram', text: `${h} ${lines[i]}` }), 3500 + i * rand(3500, 7000)),
    );
  }, [push]);

  const burst = useCallback(
    (post) => {
      for (let i = 0; i < 6; i++) setTimeout(() => push(gramBurstEvent(post)), 4000 + i * rand(4000, 9000));
    },
    [push],
  );

  // Ambient faker: realistic intervals, paused when the tab is hidden or the intro is playing.
  useEffect(() => {
    if (!ready) return;
    let t;
    const loop = () => {
      t = setTimeout(() => {
        if (document.visibilityState === 'visible' && where.current.playing) {
          if (Math.random() < 0.08 && !where.current.ringing) setRinging({ who: ['mom', 'dwayne', 'unknown', 'pruitt'][Math.floor(Math.random() * 4)] });
          else push(ambient({ myPosts: mediaRef.current.filter((m) => m.app === 'reelgram') }));
        }
        loop();
      }, rand(22000, 60000));
    };
    loop();
    return () => clearTimeout(t);
  }, [ready, push]);

  // Battery drains while the phone is out, charges while it's away. Signal flickers.
  useEffect(() => {
    let warned = false;
    const id = setInterval(() => {
      setBattery((b) => {
        const nb = Math.max(1, Math.min(100, b + (where.current.up ? -0.03 : 0.5)));
        if (nb < 5 && !warned) {
          warned = true;
          play('low-battery');
          setDialog({ title: 'Low Battery', text: '5% battery remaining. Charge? In Leonida there are no outlets, only gators.', buttons: [{ label: 'Dismiss' }, { label: 'Post anyway' }] });
        }
        if (nb > 20) warned = false;
        return nb;
      });
      if (Math.random() < 0.15) setSignal(1 + Math.floor(Math.random() * 4));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const notifs = useMemo(() => state.notifs || [], [state.notifs]);
  const unread = useMemo(() => {
    const c = {};
    for (const n of notifs) if (!n.read && n.app) c[n.app] = (c[n.app] || 0) + 1;
    return c;
  }, [notifs]);

  const totalLikes = media.filter((m) => m.app === 'reelgram').reduce((s, p) => s + likesOf(p, clock.total), 0);
  const stars = starsFor(totalLikes);

  // The mission-passed moment belongs to *submitting*, not shooting.
  const celebratePost = useCallback((app, what = 'post') => {
    setPassed({ kind: 'post', app, what, stars: starsFor(0), key: Date.now() });
    play('passed');
    setTimeout(() => setPassed(null), 4300);
  }, []);

  useEffect(() => {
    if (!ready || composing || stars <= stateRef.current.stars) return;
    patch((s) => ({ ...s, stars }));
    setPassed({ kind: 'stars', stars, key: Date.now() });
    play(stars >= 5 ? 'cops' : 'star');
    unlock(`star${stars}`);
    const t = setTimeout(() => setPassed(null), 4300);
    return () => clearTimeout(t);
  }, [stars, ready, composing, patch, unlock]);

  useEffect(() => {
    where.current.ringing = !!ringing;
  }, [ringing]);

  const value = useMemo(
    () => ({
      clock, media, state, ready, banners, dialog, passed, totalLikes, stars, unread, notifs, ringing, battery, signal,
      push, openNotif, markRead, alert, setDialog, addText, unlock, addMedia, removeMedia, toggle, addComment, burst, storyBurst, setRinging, setWhere, patch, setComposing, celebratePost,
    }),
    [clock, media, state, ready, banners, dialog, passed, totalLikes, stars, unread, notifs, ringing, battery, signal,
      push, openNotif, markRead, alert, addText, unlock, addMedia, removeMedia, toggle, addComment, burst, storyBurst, setWhere, patch, celebratePost],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
