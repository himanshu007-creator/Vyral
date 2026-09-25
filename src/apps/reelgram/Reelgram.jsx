import { useEffect, useMemo, useRef, useState } from 'react';
import CameraView from '../../camera/CameraView';
import Studio from '../../studio/Studio';
import { ReelgramLogo } from '../../phone/Icons';
import { Stars } from '../../world/World';
import { useGame } from '../../game';
import { getKV, setKV } from '../../lib/db';
import { fileToDataUrl, toBlob } from '../../lib/image';
import { fmt, likesOf, peakFor } from '../../lib/clout';
import { ago, gameMinutes } from '../../lib/useGameClock';
import { play } from '../../lib/sfx';
import { unlayer } from '../../ui/links';
import Video from '../../ui/Video';
import ReelPager from '../../ui/ReelPager';
import { blankPng, burnOverlay } from '../../lib/video';
import { Heart, Comment, Send, Bookmark, Home, Search, Reels as ReelsIcon, Plus, Dots, Back, Verified } from '../../ui/icons';
import { ACCOUNTS, POSTS, REELS, CREDIT } from '../../data/media';
import { LOCATIONS, ROASTS, TAGS } from '../../data/roasts';
import { CommentsSheet, ShareSheet, avatarFor } from './Sheets';
import './reelgram.css';

const DRAFT = 'draft:gram';
const ME = 'newinleonida';
const MY_AVATAR = '/media/avatars/me.webp';
const USER_COMMENTS = ['kayleigh.heals', 'dwayne.flips.cars', 'vcpd_malone'];
const seen = () => JSON.parse(localStorage.getItem('rg:seen') || '[]');

function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="rg-splash" onClick={onDone}>
      <div className="rg-splash-logo">
        <ReelgramLogo />
      </div>
      <b>Reelgram</b>
      <span>Because apparently 10 seconds is too long.</span>
      <small className="rg-splash-from">from <b>Leonida Social Holdings™</b></small>
    </div>
  );
}

/** One post card — used for NPC posts and yours. Like / comment / share / save are all real. */
function PostCard({ p, mine, now, onOpen, onComments, onShare }) {
  const { state, toggle } = useGame();
  const [burst, setBurst] = useState(0);
  const acct = mine ? { handle: ME, avatar: MY_AVATAR } : ACCOUNTS[p.acct];
  const liked = !!state.liked[p.id];
  const saved = !!state.saved[p.id];
  const following = mine || state.follows[p.acct];
  const base = mine ? likesOf(p, now) : p.likes;
  const likes = base + (liked ? 1 : 0);
  const extra = state.comments[p.id] || [];
  const seedC = mine ? USER_COMMENTS.map((who, i) => [who, ['this you in the Herald mugshot section?', 'the lighting is doing SO much work', 'Nice post. Where were you at 4:15 PM?'][i]]) : p.comments;
  const preview = [...seedC.slice(0, 2).map(([who, text]) => ({ who, text })), ...extra.slice(-1)];
  const like = () => {
    toggle('liked', p.id);
    play('heart', 0.4);
  };
  const dbl = () => {
    setBurst((b) => b + 1);
    if (!liked) toggle('liked', p.id);
    play('tap', 0.3);
  };
  return (
    <article className="rg-post">
      <header>
        <img className="rg-av" src={acct.avatar} alt="" />
        <span className="rg-post-who">
          <b>
            {acct.handle} {acct.verified && <Verified />}
          </b>
          <small>{p.loc}</small>
        </span>
        {!following && (
          <button className="rg-follow" onClick={() => toggle('follows', p.acct)}>
            Follow
          </button>
        )}
        <button onClick={onOpen} aria-label="More">
          <Dots size={20} />
        </button>
      </header>
      <div className="rg-post-img" onDoubleClick={dbl}>
        {p.kind === 'video' ? <Video src={p.url} poster={p.poster} className="rg-post-video" threshold={0.5} /> : <img src={mine ? p.url : p.image} alt="" loading="lazy" />}
        {p.kind === 'video' && <ReelsIcon size={18} className="rg-explore-badge" />}
        {burst > 0 && (
          <span key={burst} className="rg-burst">
            <Heart on size={96} />
          </span>
        )}
      </div>
      <div className="rg-actions">
        <button className={liked ? 'liked pop' : ''} onClick={like} aria-label="Like">
          <Heart on={liked} />
        </button>
        <button onClick={onComments} aria-label="Comment">
          <Comment />
        </button>
        <button onClick={onShare} aria-label="Share">
          <Send />
        </button>
        <span />
        <button onClick={() => toggle('saved', p.id)} aria-label="Save">
          <Bookmark on={saved} />
        </button>
      </div>
      <div className="rg-post-text">
        <b>{fmt(likes)} likes</b>
        <p>
          <b>{acct.handle}</b> {p.caption}
          {p.tags?.length ? <span className="rg-tags"> {p.tags.join(' ')}</span> : null}
        </p>
        <button className="rg-dim" onClick={onComments}>
          View all {fmt(Math.floor(likes / 211) + seedC.length + extra.length)} comments
        </button>
        {preview.map((c, i) => (
          <p key={i}>
            <b>{c.who}</b> {c.text}
          </p>
        ))}
        <small className="rg-dim">{mine ? ago(now - p.createdAt).toUpperCase() : '4 GAME HOURS AGO'}</small>
      </div>
    </article>
  );
}

function Sponsored() {
  return (
    <article className="rg-post">
      <header>
        <img className="rg-av" src="/brand/unlayer-mark.svg" alt="" />
        <span className="rg-post-who">
          <b>
            unlayer <Verified />
          </b>
          <small>Sponsored</small>
        </span>
      </header>
      <a className="rg-ad" href={unlayer('reelgram-sponsored')} target="_blank" rel="noreferrer">
        <img src="/brand/unlayer-logo-white.webp" alt="Unlayer" />
        <b>Edit anything.</b>
        <span>Even your past.</span>
        <small>The React Image Editor behind every roast on this phone.</small>
      </a>
      <a className="rg-ad-cta" href={unlayer('reelgram-learn-more')} target="_blank" rel="noreferrer">
        Learn More <span>›</span>
      </a>
      <div className="rg-post-text">
        <p>
          <b>unlayer</b> Crop it. Filter it. Censor it. Caption it. Deny it later. ✨ #BuiltWithImageEditor
        </p>
      </div>
    </article>
  );
}

function Suggested() {
  const { state, toggle } = useGame();
  const list = Object.entries(ACCOUNTS).filter(([k]) => !state.follows[k]);
  if (!list.length) return null;
  return (
    <section className="rg-suggested">
      <b>Suggested for you</b>
      <div>
        {list.map(([k, a]) => (
          <div key={k} className="rg-sugg">
            <img src={a.avatar} alt="" />
            <b>
              {a.handle} {a.verified && <Verified size={12} />}
            </b>
            <small>{a.followers} followers · followed by aunt_linda</small>
            <button onClick={() => toggle('follows', k)}>Follow</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReelsView({ items, start, onTrap, openSheet }) {
  const { state, toggle } = useGame();
  const swipes = useRef(0);
  return (
    <ReelPager
      items={items}
      start={start}
      onChange={() => ++swipes.current === 3 && onTrap()}
      render={(r, active) => {
        const a = r.mine ? { handle: ME, avatar: MY_AVATAR } : ACCOUNTS[r.acct];
        const liked = !!state.liked[r.id];
        return (
          <div className="rg-reel">
            <Video src={r.src} poster={r.poster} className="rg-reel-video" active={active} />
            <div className="rg-reel-side" onPointerDown={(e) => e.stopPropagation()}>
              <button onClick={() => toggle('liked', r.id)} className={liked ? 'liked pop' : ''}>
                <Heart on={liked} size={28} />
                <small>{fmt(r.likes + (liked ? 1 : 0))}</small>
              </button>
              <button onClick={() => openSheet({ kind: 'comments', post: r, seed: r.mine ? [] : [['vicebeach.cam', 'this is my street 😭'], ['blessed_brenda_62', 'Is this safe??']] })}>
                <Comment size={28} />
                <small>{fmt(Math.floor(r.likes / 180))}</small>
              </button>
              <button onClick={() => openSheet({ kind: 'share', post: r, image: r.poster, blob: r.blob })}>
                <Send size={28} />
              </button>
            </div>
            <div className="rg-reel-text">
              <b>
                <img src={a.avatar} alt="" /> {a.handle} {a.verified && <Verified />}
              </b>
              <p>{r.text}</p>
              <small>{r.audio}</small>
            </div>
          </div>
        );
      }}
    />
  );
}

function StoryViewer({ acctKey, onDone }) {
  const a = ACCOUNTS[acctKey];
  const post = POSTS.find((p) => p.acct === acctKey);
  const reel = REELS.find((r) => r.acct === acctKey);
  useEffect(() => {
    localStorage.setItem('rg:seen', JSON.stringify([...new Set([...seen(), acctKey])]));
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [acctKey, onDone]);
  return (
    <div className="rg-story-view" onClick={onDone}>
      {reel ? <Video src={reel.src} poster={reel.poster} className="rg-story-media" threshold={0.1} /> : <img className="rg-story-media" src={post?.image} alt="" />}
      <div className="rg-story-top">
        <i className="rg-story-bar">
          <b />
        </i>
        <span>
          <img src={a.avatar} alt="" /> <b>{a.handle}</b> <small>2h</small>
        </span>
      </div>
      <div className="rg-story-reply">Send message… (they won’t reply)</div>
    </div>
  );
}

// Three formats, three homes: post → feed/grid, reel → Reels, story → "Your story" (24 game hours).
const formatOf = (m) => m.format || (m.kind === 'video' ? 'reel' : 'post');
const storyStats = (s, now) => {
  const views = Math.min(99999, Math.floor(Math.max(0, now - s.createdAt) * 3.1) + 2);
  return { views, likes: Math.floor(views * 0.14) };
};
const VIEWERS = ['kayleigh.heals', 'vcpd_malone', 'aunt_linda', 'dwayne.flips.cars', 'chad.eth', 'blessed_brenda_62', 'withdrawal.bryce', 'mudbog_mikey', 'vcpd.booking.daily'];

function StoryShare({ draft, onShare, onBack }) {
  const video = draft.kind === 'video';
  const url = useMemo(() => (video ? URL.createObjectURL(draft.blob) : draft.image), [draft, video]);
  return (
    <div className="rg-storyshare">
      {video ? <video src={url} autoPlay loop muted playsInline className="rg-storyshare-media" /> : <img src={url} alt="" className="rg-storyshare-media" />}
      <button className="rg-storyshare-back" onClick={onBack} aria-label="Back">
        <Back />
      </button>
      <div className="rg-storyshare-bar">
        <button onClick={() => onShare('everyone')}>
          <img src={MY_AVATAR} alt="" /> Your story
        </button>
        <button className="cf" onClick={() => onShare('close')}>
          <span>★</span> Close Friends
        </button>
      </div>
      <p className="rg-storyshare-hint">Disappears in 24 game hours. Det. Malone’s screenshots don’t.</p>
    </div>
  );
}

function MyStory({ stories, now, onClose }) {
  const [i, setI] = useState(0);
  const [sheet, setSheet] = useState(false);
  const s = stories[i];
  useEffect(() => {
    if (sheet || !s) return;
    const t = setTimeout(() => (i + 1 < stories.length ? setI(i + 1) : onClose()), s.kind === 'video' ? 6000 : 5000);
    return () => clearTimeout(t);
  }, [i, s, sheet, stories.length, onClose]);
  if (!s) return null;
  const { views, likes } = storyStats(s, now);
  const left = s.expiresAt - now;
  const seen = VIEWERS.slice(0, Math.min(VIEWERS.length, 2 + Math.floor(views / 40)));
  return (
    <div className="rg-story-view rg-mystory">
      {s.kind === 'video' ? <video key={s.id} className="rg-story-media" src={s.url} poster={s.poster} autoPlay muted playsInline loop /> : <img key={s.id} className="rg-story-media" src={s.url} alt="" />}
      <div className="rg-story-top">
        <div className="rg-segs">
          {stories.map((x, k) => (
            <i key={x.id}>
              <b className={k < i ? 'done' : k === i && !sheet ? 'run' : ''} key={`${x.id}-${i}-${sheet}`} style={{ animationDuration: s.kind === 'video' ? '6s' : '5s' }} />
            </i>
          ))}
        </div>
        <span>
          <img src={MY_AVATAR} alt="" /> <b>Your story</b> <small>{Math.floor((1440 - left) / 60)}h · {s.audience === 'close' ? '★ Close Friends' : 'Everyone'}</small>
          <button onClick={onClose} className="rg-story-x" aria-label="Close">
            ✕
          </button>
        </span>
      </div>
      <button className="rg-tapzone rg-tapzone--l" onClick={() => setI(Math.max(0, i - 1))} aria-label="Previous" />
      <button className="rg-tapzone rg-tapzone--r" onClick={() => (i + 1 < stories.length ? setI(i + 1) : onClose())} aria-label="Next" />
      <button className="rg-story-activity" onClick={() => setSheet(true)}>
        <span className="rg-story-faces">
          {seen.slice(0, 3).map((h) => (
            <img key={h} src={avatarFor(h)} alt="" />
          ))}
        </span>
        <b>👁 {fmt(views)}</b>
        <b>❤️ {fmt(likes)}</b>
        <small>Activity ⌃</small>
      </button>
      {sheet && (
        <div className="rg-sheet-veil" onClick={() => setSheet(false)}>
          <div className="rg-sheet" onClick={(e) => e.stopPropagation()}>
            <i className="rg-sheet-grab" />
            <header>
              <b>
                👁 {fmt(views)} viewers · ❤️ {fmt(likes)}
              </b>
            </header>
            <div className="rg-comments">
              {seen.map((h, k) => (
                <div key={h} className="rg-comment">
                  <img src={avatarFor(h)} alt="" />
                  <p>
                    <b>{h}</b> {k % 3 === 0 ? '❤️ liked your story' : k % 3 === 1 ? 'viewed (3 times)' : 'viewed · took a screenshot 📸'}
                  </p>
                </div>
              ))}
              <p className="rg-dim rg-pad">+ {fmt(Math.max(0, views - seen.length))} others (mostly Kayleigh on alt accounts)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Caption({ image, meta, onPost, onBack }) {
  const [caption, setCaption] = useState('');
  const [roast, setRoast] = useState(false);
  const [tags, setTags] = useState(['#OnlyInLeonida']);
  const [loc, setLoc] = useState(LOCATIONS[0]);
  const [cross, setCross] = useState(true);
  return (
    <div className="rg-caption">
      <header className="rg-head">
        <button onClick={onBack} aria-label="Back">
          <Back />
        </button>
        <b>{meta.mode === 'reel' || meta.kind === 'video' ? 'New reel' : 'New post'}</b>
        <button className="rg-link" onClick={() => onPost({ caption: caption || 'no caption, the vibes speak', roast, tags, loc, cross })}>
          Share
        </button>
      </header>
      <div className="rg-caption-body">
        <div className="rg-caption-top">
          <img src={image} alt="" />
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption… or let us tell the truth ↓" />
        </div>
        <p className="rg-label">Roast chips — captions that tell the truth</p>
        <div className="rg-chips rg-chips--scroll">
          {ROASTS.map((r) => (
            <button
              key={r}
              onClick={() => {
                setCaption(r);
                setRoast(true);
              }}
              className={caption === r ? 'on' : ''}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="rg-label">Trending in Leonida</p>
        <div className="rg-chips">
          {TAGS.map((t) => (
            <button key={t} className={tags.includes(t) ? 'on' : ''} onClick={() => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}>
              {t}
            </button>
          ))}
        </div>
        <div className="rg-rows">
          <label>
            <span>📍 Add location</span>
            <select value={loc} onChange={(e) => setLoc(e.target.value)}>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            <span>👻 Also post to SusChat story</span>
            <input type="checkbox" checked={cross} onChange={(e) => setCross(e.target.checked)} />
          </label>
          <label>
            <span>🚔 Tag Det. Malone</span>
            <input type="checkbox" onChange={(e) => e.target.checked && setTags((t) => [...t, '@vcpd_malone'])} />
          </label>
        </div>
        <p className="rg-forecast">
          📈 Clout forecast: {meta.edited ? 'edited ✓' : 'unedited (brave, doomed)'} · {meta.lens ? 'filter ✓' : 'no filter'} · {roast ? 'roast ✓' : 'no roast'} · {tags.length} tags
        </p>
      </div>
    </div>
  );
}

export default function Reelgram({ q, nav, flash }) {
  const { media, clock, notifs, addMedia, removeMedia, unlock, alert, stars, totalLikes, openNotif, burst, storyBurst, state, celebratePost } = useGame();
  const view = q.view || 'splash';
  const [draft, setDraft] = useState(null);
  const [posting, setPosting] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [tab, setTab] = useState('grid');
  const [render, setRender] = useState(null);
  const blank = useMemo(() => (draft?.kind === 'video' ? blankPng(draft.w, draft.h) : null), [draft]);
  const clipUrl = useMemo(() => (draft?.kind === 'video' ? URL.createObjectURL(draft.blob) : null), [draft]);

  useEffect(() => {
    if ((view === 'studio' || view === 'caption') && !draft)
      getKV(DRAFT).then((d) => (d ? setDraft(d) : nav({ view: 'compose' }, { replace: true })));
  }, [view, draft, nav]);

  const saveDraft = (d) => {
    setDraft(d);
    setKV(DRAFT, d);
  };

  const all = media.filter((m) => m.app === 'reelgram');
  const mine = all.filter((m) => formatOf(m) === 'post');
  const myReels = all.filter((m) => formatOf(m) === 'reel');
  const myStories = all.filter((m) => formatOf(m) === 'story' && m.expiresAt > clock.total).sort((a, b) => a.createdAt - b.createdAt);
  const reelItems = [
    ...myReels.map((m) => ({ id: m.id, src: m.url, poster: m.poster, blob: m.blob, mine: true, text: m.caption, audio: '♫ original audio — you (no one asked)', likes: likesOf(m, clock.total) })),
    ...REELS,
  ];
  const findPost = (id) => all.find((m) => m.id === id) || POSTS.find((p) => p.id === id) || REELS.find((r) => r.id === id);

  const post = async ({ caption, roast, tags, loc, cross }) => {
    const isVideo = draft.kind === 'video';
    const format = isVideo || draft.mode === 'reel' ? 'reel' : 'post';
    const blob = isVideo ? draft.blob : await toBlob(draft.image);
    const extra = isVideo ? { kind: 'video', poster: draft.poster, format } : { format };
    // Reels get a little algorithm boost. Obviously.
    const peak = peakFor({ edited: draft.edited, lens: draft.lens, roast, tags: tags.length }) * (isVideo ? 1.6 : 1);
    const item = await addMedia({ app: 'reelgram', blob, caption, tags, loc, peak, lens: draft.lens, edited: draft.edited, ...extra });
    if (cross) await addMedia({ app: 'suschat', blob, story: true, to: ['story'], expiresAt: gameMinutes() + 1440, ...extra });
    play('send');
    setPosting(true);
    setTimeout(() => setPosting(false), 1800);
    nav({ view: format === 'reel' ? 'reels' : 'feed', id: format === 'reel' ? item.id : null });
    celebratePost('reelgram', format);
    unlock('firstPost');
    burst(item);
  };

  const shareStory = async (audience) => {
    const isVideo = draft.kind === 'video';
    const blob = isVideo ? draft.blob : await toBlob(draft.image);
    await addMedia({ app: 'reelgram', format: 'story', audience, blob, expiresAt: gameMinutes() + 1440, lens: draft.lens, edited: draft.edited, ...(isVideo ? { kind: 'video', poster: draft.poster } : {}) });
    play('send');
    nav({ view: 'feed' });
    celebratePost('reelgram', 'story');
    storyBurst();
  };

  const trap = () =>
    alert({
      title: 'Take a break?',
      text: 'You’ve been scrolling for 47 minutes. Your screen time is up 312%. Mom has called twice.',
      buttons: [{ label: 'No' }, { label: 'Absolutely not' }],
    });

  const openSheet = (s) => setSheet({ ...s, view });
  // A sheet belongs to the screen that opened it.
  const sheetEl =
    sheet?.view === view &&
    (sheet.kind === 'comments' ? (
      <CommentsSheet post={sheet.post} seed={sheet.seed} onClose={() => setSheet(null)} dark={view === 'reels'} />
    ) : (
      <ShareSheet post={sheet.post} image={sheet.image} blob={sheet.blob} onClose={() => setSheet(null)} dark={view === 'reels'} />
    ));
  const card = (p, isMine) => (
    <PostCard
      key={p.id}
      p={p}
      mine={isMine}
      now={clock.total}
      onOpen={() => nav({ view: 'post', id: p.id })}
      onComments={() => openSheet({ kind: 'comments', post: p, seed: isMine ? [] : p.comments })}
      onShare={() => openSheet({ kind: 'share', post: p, image: isMine ? (p.kind === 'video' ? p.poster : p.url) : p.image, blob: p.kind === 'video' ? p.blob : null })}
    />
  );

  const unreadActivity = notifs.some((n) => n.app === 'reelgram' && !n.read);
  const tabs = (
    <nav className="rg-tabs">
      <button className={view === 'feed' ? 'on' : ''} onClick={() => nav({ view: 'feed', id: null })} aria-label="Home">
        <Home on={view === 'feed'} />
      </button>
      <button className={view === 'explore' ? 'on' : ''} onClick={() => nav({ view: 'explore', id: null })} aria-label="Explore">
        <Search />
      </button>
      <button onClick={() => nav({ view: 'compose', id: null })} aria-label="New post">
        <Plus />
      </button>
      <button className={view === 'reels' ? 'on' : ''} onClick={() => nav({ view: 'reels', id: null })} aria-label="Reels">
        <ReelsIcon on={view === 'reels'} />
      </button>
      <button className={view === 'profile' ? 'on' : ''} onClick={() => nav({ view: 'profile', id: null })} aria-label="Profile">
        <img className={`rg-tab-me ${view === 'profile' ? 'on' : ''}`} src={MY_AVATAR} alt="" />
      </button>
    </nav>
  );

  if (view === 'splash') return <Splash onDone={() => nav({ view: 'feed' }, { replace: true })} />;

  if (view === 'compose')
    return (
      <div className="rg rg-dark">
        <CameraView
          mode="gram"
          initialMode={(q.mode || 'post').toUpperCase()}
          flashMsg={flash}
          onClose={() => nav({ view: 'feed', mode: null })}
          onCapture={(image, { lens, mode }) => {
            saveDraft({ image, lens, mode });
            nav({ view: 'studio', mode: null });
          }}
          onVideo={({ blob, poster, w, h, lens, mode }) => {
            saveDraft({ kind: 'video', blob, poster, w, h, lens, mode });
            nav({ view: 'studio', mode: null });
          }}
        />
      </div>
    );

  if (view === 'studio' && draft?.kind === 'video')
    return (
      <Studio
        skin="gram"
        image={blank}
        guide={draft.poster}
        guideVideo={clipUrl}
        busy={render}
        onBack={() => nav({ view: 'compose' })}
        onDone={async (overlay, { edited }) => {
          setRender(0);
          const out = await burnOverlay(draft.blob, overlay, setRender);
          setRender(null);
          play('burn-done', 0.5);
          saveDraft({ ...draft, blob: out.blob, poster: out.poster, edited: edited || !!draft.lens });
          nav({ view: draft.mode === 'story' ? 'storyshare' : 'caption' });
        }}
      />
    );

  if (view === 'studio')
    return draft ? (
      <Studio
        skin="gram"
        image={draft.image}
        onBack={() => nav({ view: 'compose' })}
        onDone={(image, { edited }) => {
          saveDraft({ ...draft, image, edited: edited || draft.edited });
          nav({ view: draft.mode === 'story' ? 'storyshare' : 'caption' });
        }}
      />
    ) : (
      <div className="rg" />
    );

  if (view === 'storyshare')
    return draft ? <StoryShare draft={draft} onShare={shareStory} onBack={() => nav({ view: 'studio' })} /> : <div className="rg" />;

  if (view === 'mystory')
    return myStories.length ? (
      <MyStory stories={myStories} now={clock.total} onClose={() => nav({ view: 'feed' }, { replace: true })} />
    ) : (
      <div className="rg rg-empty-story" onClick={() => nav({ view: 'compose', mode: 'story' })}>
        <p className="rg-empty">No active story. The algorithm has forgotten you. Tap to fix that.</p>
      </div>
    );

  if (view === 'caption')
    return draft ? (
      <div className="rg">
        <Caption image={draft.kind === 'video' ? draft.poster : draft.image} meta={draft} onPost={post} onBack={() => nav({ view: 'studio' })} />
      </div>
    ) : (
      <div className="rg" />
    );

  if (view === 'story' && ACCOUNTS[q.id]) {
    const keys = Object.keys(ACCOUNTS);
    const next = keys[keys.indexOf(q.id) + 1];
    return <StoryViewer key={q.id} acctKey={q.id} onDone={() => (next ? nav({ id: next }, { replace: true }) : nav({ view: 'feed', id: null }, { replace: true }))} />;
  }

  if (view === 'reels')
    return (
      <div className="rg rg-dark">
        <header className="rg-reels-head">
          <b>Reels</b>
          <small>clips: fan/concept footage</small>
        </header>
        <ReelsView key={q.id || "reels"} items={reelItems} start={Math.max(0, reelItems.findIndex((r) => r.id === q.id))} onTrap={trap} openSheet={openSheet} />
        {tabs}
        {sheetEl}
      </div>
    );

  if (view === 'explore') {
    const tiles = [...POSTS.map((p) => ({ ...p, kind: 'post' })), ...REELS.map((r) => ({ ...r, kind: 'reel' }))].sort((a, b) => (a.id > b.id ? 1 : -1));
    return (
      <div className="rg">
        <header className="rg-head">
          <div className="rg-searchbar" onClick={() => alert({ title: 'Search', text: 'Searching “how to be happy”… 0 results. Showing “how to look happy” instead.', buttons: [{ label: 'Fair' }] })}>
            <Search size={16} /> Search Leonida
          </div>
        </header>
        <div className="rg-scroll">
          <div className="rg-explore">
            {tiles.map((t, i) => (
              <button key={t.id} className={i % 5 === 2 ? 'tall' : ''} onClick={() => (t.kind === 'reel' ? nav({ view: 'reels', id: t.id }) : nav({ view: 'post', id: t.id }))}>
                <img src={t.kind === 'reel' ? t.poster : t.image} alt="" loading="lazy" />
                {t.kind === 'reel' && <ReelsIcon size={18} className="rg-explore-badge" />}
              </button>
            ))}
          </div>
          <p className="rg-end">Stills © {CREDIT.handle}. Clips © their creators.</p>
        </div>
        {tabs}
      </div>
    );
  }

  if (view === 'activity') {
    const list = notifs.filter((n) => n.app === 'reelgram');
    return (
      <div className="rg">
        <header className="rg-head">
          <button onClick={() => nav({ view: 'feed' })} aria-label="Back">
            <Back />
          </button>
          <b>Activity</b>
          <span />
        </header>
        <div className="rg-scroll">
          {list.length === 0 && <p className="rg-empty">No activity. Post something and let the validation roll in.</p>}
          {list.map((n) => (
            <div key={n.id} role="button" tabIndex={0} className={`rg-act ${n.read ? '' : 'unread'}`} onClick={() => openNotif(n)} onKeyDown={(e) => e.key === 'Enter' && openNotif(n)}>
              <img src={n.avatar || avatarFor(n.who || n.text.split(' ')[0])} alt="" />
              <p>
                {n.text} <small>{ago(clock.total - n.at)}</small>
              </p>
              {n.kind === 'follow' && <em>Follow back</em>}
              {(n.kind === 'like' || n.kind === 'comment') && mine[0] && <img className="rg-act-thumb" src={mine[0].kind === 'video' ? mine[0].poster : mine[0].url} alt="" />}
            </div>
          ))}
        </div>
        {tabs}
      </div>
    );
  }

  if (view === 'post') {
    const p = findPost(q.id);
    const isMine = !!mine.find((m) => m.id === q.id);
    if (!p) return <div className="rg" onClick={() => nav({ view: 'feed' })} />;
    return (
      <div className="rg">
        <header className="rg-head">
          <button onClick={() => history.back()} aria-label="Back">
            <Back />
          </button>
          <b>{isMine ? 'Your post' : 'Post'}</b>
          <span />
        </header>
        <div className="rg-scroll">
          {p.src ? (
            <div className="rg-post-reel">
              <Video src={p.src} poster={p.poster} className="rg-reel-video" threshold={0.2} />
            </div>
          ) : (
            card(p, isMine)
          )}
          {isMine && (
            <div className="rg-post-tools">
              <button
                style={p.kind === 'video' ? { display: 'none' } : undefined}
                onClick={async () => {
                  saveDraft({ image: await fileToDataUrl(p.blob), lens: p.lens, edited: true });
                  nav({ view: 'studio', id: null });
                }}
              >
                ✎ Edit again
              </button>
              <button
                className="danger"
                onClick={() =>
                  alert({
                    title: 'Delete post?',
                    text: 'It will be gone forever. (Det. Malone already has a screenshot.)',
                    buttons: [
                      { label: 'Keep' },
                      {
                        label: 'Delete',
                        onClick: () => {
                          removeMedia(p.id);
                          nav({ view: 'profile', id: null }, { replace: true });
                        },
                      },
                    ],
                  })
                }
              >
                🗑 Delete
              </button>
            </div>
          )}
        </div>
        {tabs}
        {sheetEl}
      </div>
    );
  }

  if (view === 'profile') {
    const grid =
      tab === 'saved' ? [...POSTS.filter((p) => state.saved[p.id]), ...all.filter((m) => state.saved[m.id])] : tab === 'tagged' ? POSTS.filter((p) => p.acct === 'booking') : tab === 'reels' ? myReels : mine;
    return (
      <div className="rg">
        <header className="rg-head">
          <span />
          <b>
            {ME} <Verified />
          </b>
          <Stars n={stars} className="rg-stars" />
        </header>
        <div className="rg-scroll">
          <div className="rg-profile">
            <img className={`rg-me-big ${myStories.length ? 'ring' : ''}`} src={MY_AVATAR} alt="" onClick={() => myStories.length && nav({ view: 'mystory' })} />
            <div className="rg-counts">
              <span>
                <b>{mine.length + myReels.length}</b>posts
              </span>
              <span>
                <b>{fmt(Math.floor(totalLikes * 0.13) + 12 + Object.values(state.follows).filter(Boolean).length)}</b>followers
              </span>
              <span>
                <b>{7812 + Object.values(state.follows).filter(Boolean).length}</b>following
              </span>
            </div>
          </div>
          <p className="rg-bio">
            <b>New in Leonida 🌴</b>
            <br />
            Suffering, yet pretending ✨ DM for collabs (pls)
            <br />
            <span className="rg-dim">📍 Vice City · Edited with Unlayer</span>
          </p>
          <div className="rg-profile-btns">
            <button onClick={() => alert({ title: 'Edit profile', text: 'You can’t edit who you are. Only your photos. Tap ＋ and open the Edit Studio.' })}>Edit profile</button>
            <button
              className="rg-verify"
              onClick={() =>
                alert({
                  title: 'Reelgram Verified',
                  text: 'Get the blue check for $49.99/mo or 3 gators. Includes: nothing. Everyone will still know.',
                  buttons: [{ label: 'Pay in gators' }, { label: 'No thanks' }],
                })
              }
            >
              Get verified
            </button>
          </div>
          <div className="rg-ptabs">
            {['grid', 'reels', 'saved', 'tagged'].map((t) => (
              <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
                {{ grid: '▦ Posts', reels: '▶ Reels', saved: '🔖 Saved', tagged: '🚔 Tagged' }[t]}
              </button>
            ))}
          </div>
          <div className="rg-grid">
            {grid.length === 0 && <p className="rg-empty">{tab === 'saved' ? 'Nothing saved. Tap 🔖 on posts you pretend to understand.' : 'No posts. No proof you exist. Tap ＋.'}</p>}
            {grid.map((p) => (
              <button key={p.id} className={tab === 'reels' ? 'is-reel' : ''} onClick={() => nav(tab === 'reels' ? { view: 'reels', id: p.id } : { view: 'post', id: p.id })}>
                <img src={p.kind === 'video' ? p.poster : p.url || p.image} alt="" />
                {p.kind === 'video' && <ReelsIcon size={16} className="rg-explore-badge" />}
                {p.url && <small>♥ {fmt(likesOf(p, clock.total))}</small>}
              </button>
            ))}
          </div>
          {tab === 'tagged' && <p className="rg-end">You were tagged by @vcpd.booking.daily. Nothing to worry about. Probably.</p>}
        </div>
        {tabs}
      </div>
    );
  }

  // feed
  const feed = [];
  const npc = [...POSTS];
  mine.forEach((p) => feed.push(card(p, true), ...(npc.length ? [card(npc.shift(), false)] : [])));
  npc.forEach((p, i) => {
    feed.push(card(p, false));
    if (i === 1) feed.push(<Sponsored key="ad" />);
    if (i === 3) feed.push(<Suggested key="sugg" />);
  });
  const seenList = seen();
  return (
    <div className="rg">
      <header className="rg-head rg-head--brand">
        <b className="rg-wordmark">Reelgram</b>
        <span className="rg-head-right">
          <Stars n={stars} className="rg-stars" />
          <button onClick={() => nav({ view: 'activity' })} aria-label="Activity" className="rg-act-btn">
            <Heart />
            {unreadActivity && <i className="rg-dot" />}
          </button>
          <button onClick={() => nav({ app: 'itext', view: null })} aria-label="Messages">
            <Send />
          </button>
        </span>
      </header>
      {posting && (
        <div className="rg-posting">
          <i />
          Posting… sacrificing privacy
        </div>
      )}
      <div className="rg-scroll">
        <div className="rg-stories">
          <div className="rg-story">
            <button className={`rg-story-ring ${myStories.length ? '' : 'none'}`} onClick={() => nav(myStories.length ? { view: 'mystory' } : { view: 'compose', mode: 'story' })}>
              <img src={MY_AVATAR} alt="" />
            </button>
            <button className="rg-story-add" onClick={() => nav({ view: 'compose', mode: 'story' })} aria-label="Add to story">
              +
            </button>
            <small>{myStories.length ? `👁 ${fmt(storyStats(myStories[myStories.length - 1], clock.total).views)}` : 'Your story'}</small>
          </div>
          {Object.entries(ACCOUNTS).map(([k, a]) => (
            <button key={k} className="rg-story" onClick={() => nav({ view: 'story', id: k })}>
              <span className={`rg-story-ring ${seenList.includes(k) ? 'seen' : ''}`}>
                <img src={a.avatar} alt="" />
              </span>
              <small>{a.handle.slice(0, 11)}</small>
            </button>
          ))}
        </div>
        {mine.length === 0 && (
          <button className="rg-cta" onClick={() => nav({ view: 'compose' })}>
            <b>You haven’t posted yet.</b> Do you even exist? Tap to shoot, roast it in the Edit Studio, post it. 📸
          </button>
        )}
        {feed}
        <p className="rg-end">You’re all caught up. That’s a lie. Watch reels ▶</p>
      </div>
      {tabs}
      {sheetEl}
    </div>
  );
}
