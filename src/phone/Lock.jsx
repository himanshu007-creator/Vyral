import { useRef, useState } from 'react';
import Wallpaper from './Wallpaper';
import { useGame } from '../game';
import { play, buzz } from '../lib/sfx';
import { AppLogo } from './Phone';
import { MangoLogo } from './Icons';

function SlideToRegret({ onDone }) {
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const track = useRef(null);
  const start = useRef(0);
  const max = () => track.current.clientWidth - 68;
  const clamp = (e) => Math.max(0, Math.min(max(), e.clientX - start.current));

  return (
    <div className="slider" ref={track}>
      <span className="slider-text" style={{ opacity: 1 - x / 120 }}>
        slide to regret
      </span>
      <div
        className="slider-knob"
        style={{ transform: `translateX(${x}px)`, transition: drag ? 'none' : 'transform .3s ease' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          start.current = e.clientX - x;
          setDrag(true);
        }}
        onPointerMove={(e) => drag && setX(clamp(e))}
        onPointerUp={(e) => {
          setDrag(false);
          if (clamp(e) > max() * 0.85) {
            setX(max());
            play('unlock');
            buzz(15);
            setTimeout(onDone, 120);
          } else setX(0);
        }}
      >
        ➜
      </div>
    </div>
  );
}

export default function Lock({ onUnlock }) {
  const { clock, notifs, openNotif } = useGame();
  const unreadAll = notifs.filter((n) => !n.read);
  const notes = unreadAll.slice(0, 3);
  return (
    <div className="lock">
      <Wallpaper variant="lock" />
      <div className="lock-band">
        <div className="lock-time">{clock.hhmm}</div>
        <div className="lock-date">{clock.date}</div>
        <div className="lock-brand">
          <MangoLogo size={12} /> iFRUTE
        </div>
      </div>
      <div className="lock-notes">
        {unreadAll.length > 3 && <p className="lock-more">+{unreadAll.length - 3} more · unlock to face them</p>}
        {notes.length === 0 && <p className="lock-empty">No notifications. Nobody’s thinking about you. Enjoy it.</p>}
        {notes.map((n, i) => (
          <button key={n.id} className="lock-note" style={{ animationDelay: `${0.4 + i * 0.15}s` }} onClick={() => openNotif(n)}>
            <span className="banner-icon">{n.avatar ? <img src={n.avatar} alt="" /> : <AppLogo app={n.app} />}</span>
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <b>{n.title}</b>
              <span className="lock-note-text">{n.text}</span>
            </span>
            <small>{clock.total - n.at < 2 ? 'now' : `${Math.min(59, clock.total - n.at)}m`}</small>
          </button>
        ))}
      </div>
      <div className="lock-bottom">
        <SlideToRegret onDone={onUnlock} />
        <button className="lock-cam" title="SusChat camera" onClick={() => openNotif({ app: 'suschat', view: 'camera' })}>
          📷
        </button>
      </div>
    </div>
  );
}
