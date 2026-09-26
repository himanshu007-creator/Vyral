import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game';
import { play, setMuted, useMuted } from '../lib/sfx';
import { ReelgramLogo, SusChatLogo, ICallLogo, ITextLogo, FruitRollLogo } from './Icons';
import IncomingCall from './IncomingCall';
import PhoneBack from './PhoneBack';
import { Hand, Hands, TapFinger } from './Hand';
import './phone.css';

const LOGOS = { reelgram: ReelgramLogo, suschat: SusChatLogo, icall: ICallLogo, itext: ITextLogo, roll: FruitRollLogo };
export const AppLogo = ({ app }) => {
  const L = LOGOS[app];
  return L ? <L /> : <span className="sys-logo">⚠️</span>;
};

function StatusBar({ locked, clock, battery, signal }) {
  const low = battery < 10;
  const muted = useMuted();
  return (
    <div className="sb">
      <span className="sb-left">
        <span className="sb-bars">
          {[4, 6, 8, 10, 12].map((h, i) => (
            <i key={h} style={{ height: h, opacity: i < signal ? 1 : 0.3 }} />
          ))}
        </span>
        LEONIDA {signal > 2 ? '3G' : 'E'}
      </span>
      <span className="sb-time">{locked ? '🔒' : `${clock.hhmm} ${clock.ampm}`}</span>
      <span className={`sb-right ${low ? 'low' : ''}`}>
        {/* the HUD's mute button is hidden on phones, so the status bar carries one */}
        <button className="sb-mute" onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn sound on' : 'Turn radio and sound off'}>
          {muted ? '🔇' : '🔊'}
        </button>
        {Math.round(battery)}%{' '}
        <i className="sb-batt">
          <b style={{ width: `${battery}%` }} />
        </i>
      </span>
    </div>
  );
}

/** iOS-6 banner outside the app, or an app-styled toast when you're already inside it. */
function Banners({ banners, current, onOpen }) {
  return (
    <div className="banners">
      {banners.map((b) =>
        b.app && b.app === current ? (
          <button key={b.bid} className={`toast toast--${b.app}`} onClick={() => onOpen(b)}>
            {b.avatar ? <img src={b.avatar} alt="" /> : <span className="toast-icon">{b.kind === 'like' ? '❤️' : b.kind === 'comment' ? '💬' : '✦'}</span>}
            <span>{b.text}</span>
          </button>
        ) : (
          <button key={b.bid} className="banner" onClick={() => onOpen(b)}>
            <span className="banner-icon">
              <AppLogo app={b.app} />
            </span>
            <span className="banner-body">
              <b>{b.title}</b>
              <span>{b.text}</span>
            </span>
          </button>
        ),
      )}
    </div>
  );
}

function Dialog() {
  const { dialog, setDialog } = useGame();
  if (!dialog) return null;
  const buttons = dialog.buttons || [{ label: 'OK' }];
  return (
    <div className="ios-alert-veil" onClick={() => setDialog(null)}>
      <div className="ios-alert" onClick={(e) => e.stopPropagation()}>
        <h3>{dialog.title}</h3>
        <p>{dialog.text}</p>
        <div className="ios-alert-btns">
          {buttons.map((b) => (
            <button
              key={b.label}
              onClick={() => {
                setDialog(null);
                b.onClick?.();
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Phone({ up, orientation, tilt, locked, studio, current, toast, onHome, onRotate, children }) {
  const { clock, banners, alert, openNotif, battery, signal } = useGame();
  const stageRef = useRef(null);
  const holdRef = useRef(null);
  const swipeRef = useRef(null);
  const [turned, setTurned] = useState(false);
  // Laptop pickup: hand flips the phone from its back, then a finger taps it awake.
  const [picking, setPicking] = useState(false);
  const [wasUp, setWasUp] = useState(up);
  if (wasUp !== up) {
    setWasUp(up);
    if (up && !matchMedia('(max-width: 560px), (max-height: 480px)').matches) setPicking(true);
  }
  useEffect(() => {
    if (!picking) return;
    // rise (0.5s) → hold the back so it can be read (1.6s) → flip (0.6s) → finger taps the screen awake
    const f = setTimeout(() => play('flip', 0.5), 2100);
    const a = setTimeout(() => play('screen-tap', 0.5), 3000);
    const t = setTimeout(() => setPicking(false), 3500);
    return () => [f, a, t].forEach(clearTimeout);
  }, [picking]);
  const [lastO, setLastO] = useState(orientation);
  if (lastO !== orientation) {
    setLastO(orientation);
    setTurned(true);
  }

  // Glass glare follows the mouse. Vars go on the glare itself, not the stage: setting them on the stage
  // restyled the whole phone (editor included) on every move, and touch-scrolling fired it constantly.
  const glareRef = useRef(null);
  useEffect(() => {
    const move = (e) => {
      const el = glareRef.current;
      if (!el || e.pointerType !== 'mouse') return;
      el.style.setProperty('--gx', `${(e.clientX / innerWidth) * 100}%`);
      el.style.setProperty('--gy', `${(e.clientY / innerHeight) * 100}%`);
    };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);

  const homeDown = () => {
    holdRef.current = setTimeout(() => {
      holdRef.current = 'siri';
      play('siri');
      alert({ title: 'Siri-ously?', text: 'Sorry, I didn’t catch that. Also, you owe $400.', buttons: [{ label: 'Ignore' }, { label: 'Pay later' }] });
    }, 650);
  };
  const homeUp = () => {
    if (holdRef.current !== 'siri') {
      clearTimeout(holdRef.current);
      play('tap', 0.3);
      onHome();
    }
    holdRef.current = null;
  };

  return (
    <div ref={stageRef} className={`phone-stage ${up ? 'is-up' : ''} ${orientation} ${tilt ? `tilt-${tilt}` : ''} ${studio ? 'is-studio' : ''} ${turned ? 'turned' : ''} ${picking ? 'picking' : ''}`}>
      <div className="phone">
        <PhoneBack />
        <i className="phone-btn phone-btn--power" />
        <i className="phone-btn phone-btn--vol1" />
        <i className="phone-btn phone-btn--vol2" />
        <div className="phone-top">
          <i className="phone-cam" />
          <i className="phone-speaker" />
        </div>
        <div className="phone-screen">
          <StatusBar locked={locked} clock={clock} battery={battery} signal={signal} />
          <div className="phone-content">{children}</div>
          <Banners banners={banners} current={current} onOpen={openNotif} />
          {toast && <div className="phone-toast">{toast}</div>}
          <IncomingCall />
          <Dialog />
          {!locked && (
            <div
              className="edge-swipe"
              onPointerDown={(e) => {
                swipeRef.current = e.clientX;
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerUp={(e) => {
                if (swipeRef.current != null && e.clientX - swipeRef.current > 50) onHome();
                swipeRef.current = null;
              }}
            />
          )}
          <i className="phone-glare" ref={glareRef} />
          {picking && <i className="tap-ripple" />}
          <button className="home-float" aria-label="Home" onClick={onHome} />
        </div>
        <div className="phone-chin">
          <button className="home-btn" aria-label="Home" onPointerDown={homeDown} onPointerUp={homeUp} onPointerLeave={() => clearTimeout(holdRef.current)}>
            <i />
          </button>
        </div>
      </div>
      {orientation === 'portrait' ? <Hand /> : <Hands />}
      {picking && <TapFinger />}
      <button className="rotate-btn" onClick={onRotate} title="Rotate phone (← →)">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 2v5h-5M6 22v-5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {orientation === 'portrait' ? 'Landscape' : 'Portrait'}
      </button>
    </div>
  );
}
