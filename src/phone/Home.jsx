import { useEffect, useRef, useState } from 'react';
import Wallpaper from './Wallpaper';
import { useGame } from '../game';
import { play } from '../lib/sfx';
import { fmt } from '../lib/clout';
import { unlayer, CREATOR, ASSETS_BY } from '../ui/links';
import { ReelgramLogo, SusChatLogo, ICallLogo, ITextLogo, FruitRollLogo } from './Icons';

const GRID = [
  { app: 'reelgram', label: 'Reelgram', Logo: ReelgramLogo, featured: true },
  { app: 'suschat', label: 'SusChat', Logo: SusChatLogo, featured: true },
  { app: 'roll', label: 'FruitRoll', Logo: FruitRollLogo },
];
const DOCK = [
  { app: 'icall', label: 'iCall', Logo: ICallLogo },
  { app: 'itext', label: 'iText', Logo: ITextLogo },
];

function Icon({ app, label, Logo, featured, badge, i, onOpen }) {
  return (
    <button
      className={`app-icon ${featured ? 'featured' : ''}`}
      style={{ animationDelay: `${i * 60}ms` }}
      onClick={() => {
        play('tap', 0.3);
        onOpen(app);
      }}
    >
      <span className="app-icon-wrap">
        <span className="app-icon-img">
          <Logo />
        </span>
        {badge ? (
          <span key={badge} className="badge">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </span>
      {label}
    </button>
  );
}

// Live stocks-style card: your like count as a ticker with a sparkline.
function CloutCard({ likes, stars }) {
  const [hist, setHist] = useState([likes]);
  const last = useRef(likes);
  useEffect(() => {
    last.current = likes;
  }, [likes]);
  useEffect(() => {
    const id = setInterval(() => setHist((h) => [...h.slice(-23), last.current]), 2500);
    return () => clearInterval(id);
  }, []);
  const max = Math.max(1, ...hist);
  const min = Math.min(...hist);
  const pts = hist.map((v, i) => `${(i / 23) * 100},${30 - ((v - min) / (max - min || 1)) * 26}`).join(' ');
  const up = hist[hist.length - 1] >= hist[0];
  return (
    <div className="widget widget--clout">
      <div className="widget-row">
        <b>CLOUT</b>
        <span className={up ? 'up' : 'down'}>{up ? '▲' : '▼'} {fmt(likes)}</span>
      </div>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={up ? '#4cd964' : '#ff3b30'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <small>{stars ? `${'★'.repeat(stars)} wanted for attention` : 'LIKES · market closed (you haven’t posted)'}</small>
    </div>
  );
}

export default function Home({ onOpen }) {
  const { stars, totalLikes, unread, clock } = useGame();
  const [page, setPage] = useState(0);
  const pagesRef = useRef(null);
  const dragRef = useRef(null);
  const go = (i) => pagesRef.current?.scrollTo({ left: i * pagesRef.current.clientWidth, behavior: 'smooth' });
  const weather = clock.h >= 20 || clock.h < 6 ? '🌙 84°' : clock.h < 17 ? '☀️ 92°' : '🌇 88°';
  return (
    <div className="home">
      <Wallpaper variant="home" />
      <div
        className="home-pages"
        ref={pagesRef}
        onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        // Touch scrolls natively; a mouse gets drag-to-swipe like a real home screen.
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') dragRef.current = e.clientX;
        }}
        onPointerUp={(e) => {
          const dx = typeof dragRef.current === 'number' ? e.clientX - dragRef.current : 0;
          dragRef.current = null;
          if (Math.abs(dx) > 40) {
            go(dx < 0 ? 1 : 0);
            dragRef.current = 'swiped'; // swallow the click that follows, so a swipe never opens an app
            setTimeout(() => (dragRef.current = null));
          }
        }}
        onPointerLeave={() => (dragRef.current = null)}
        onClickCapture={(e) => dragRef.current === 'swiped' && e.stopPropagation()}
      >
        <section className="home-page">
          <div className="home-grid">
            {GRID.map((a, i) => (
              <Icon key={a.app} {...a} i={i} badge={unread[a.app]} onOpen={onOpen} />
            ))}
          </div>
          <div className="widgets">
            <CloutCard likes={totalLikes} stars={stars} />
            <div className="widget widget--weather">
              <b>Vice City</b>
              <span className="big">{weather}</span>
              <small>Humidity 400% · Hurricane Karen: “on her way”</small>
            </div>
          </div>
          <div className="home-hint">
            {stars === 0 ? (
              <>
                <b>Clout: nobody.</b> Shoot yourself on <b>SusChat</b> or <b>Reelgram</b>, roast it in the Edit Studio, post it. Leonida is watching.
              </>
            ) : (
              <>
                <b>
                  {'★'.repeat(stars)}
                  {'☆'.repeat(5 - stars)}
                </b>{' '}
                — the validation is working. Post more. Mom has questions.
              </>
            )}
          </div>
        </section>
        <section className="home-page home-page--2">
          <p className="home-empty">Nothing else here. Like your savings account.</p>
          <a className="widget widget--ad" href={unlayer('home-widget')} target="_blank" rel="noreferrer">
            <img src="/brand/unlayer-logo-white.webp" alt="Unlayer" />
            <span>Edit anything. Even your past.</span>
            <small>Sponsored · the editor inside Reelgram & SusChat ↗</small>
          </a>
          <div className="widget widget--credits">
            <a href={CREATOR} target="_blank" rel="noreferrer">
              🛠 built by <b>himanshu007-creator</b>
            </a>
            <a href={ASSETS_BY} target="_blank" rel="noreferrer">
              📸 stills by <b>@r3spawnhere</b>
            </a>
          </div>
        </section>
      </div>
      <div className="page-dots">
        <i className={page === 0 ? 'on' : ''} onClick={() => go(0)} />
        <i className={page === 1 ? 'on' : ''} onClick={() => go(1)} />
      </div>
      <div className="dock">
        {DOCK.map((a, i) => (
          <Icon key={a.app} {...a} i={i + 3} badge={unread[a.app]} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}
