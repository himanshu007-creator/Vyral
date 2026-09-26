import { useCallback, useEffect, useRef, useState } from 'react';
import { GameProvider, useGame } from './game';
import useUrlState from './lib/useUrlState';
import { play, startRadio } from './lib/sfx';
import Intro from './intro/Intro';
import World from './world/World';
import Phone from './phone/Phone';
import Lock from './phone/Lock';
import Home from './phone/Home';
import Reelgram from './apps/reelgram/Reelgram';
import SusChat from './apps/suschat/SusChat';
import IText from './apps/IText';
import ICall from './apps/ICall';
import FruitRoll from './apps/FruitRoll';

const APPS = { reelgram: Reelgram, suschat: SusChat, itext: IText, icall: ICall, roll: FruitRoll };
// Like the real things: these two refuse landscape.
const PORTRAIT_ONLY = {
  reelgram: 'Reelgram doesn’t do landscape. Neither does your posture.',
  suschat: 'SusChat is portrait-only. Hold your phone like a normal suspect.',
};
const PASSED = ['', 'LOCAL NOBODY → LOCAL SOMEBODY', 'MOM SHARED IT', 'WVCN 6 WANTS A COMMENT', 'LEONIDA FAMOUS', 'VCPD HAS BEEN NOTIFIED'];

function Passed({ passed }) {
  if (!passed) return null;
  const post = passed.kind === 'post';
  return (
    <div className={`passed ${post ? '' : 'passed--stars'}`} key={passed.key}>
      <div className="passed-band">
        <h2 className="gta-title">{post ? (passed.app === 'suschat' ? 'snap sent' : `${passed.what || 'post'} passed`) : 'wanted level up'}</h2>
        <p>{post ? 'RESPECT +1 · VALIDATION INCOMING · MOM HAS BEEN NOTIFIED' : `${'★'.repeat(passed.stars)} CLOUT · ${PASSED[passed.stars]}`}</p>
      </div>
    </div>
  );
}

const SMALL = '(max-width: 560px), (max-height: 480px)';
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));

/** Small-screen facts: viewport orientation, plus which way the device is physically tilted (gravity). */
function useDevice() {
  const [dev, setDev] = useState(() => ({ small: matchMedia(SMALL).matches, land: matchMedia('(orientation: landscape)').matches, tilt: null }));
  useEffect(() => {
    const small = matchMedia(SMALL);
    const land = matchMedia('(orientation: landscape)');
    const read = () => setDev((d) => ({ ...d, small: small.matches, land: land.matches }));
    small.addEventListener('change', read);
    land.addEventListener('change', read);
    // Gravity says which edge is down. ponytail: iOS reports it with the sign flipped vs Android;
    // if a device ever turns the wrong way, this IOS flip is the calibration knob.
    const onMotion = (e) => {
      const g = e.accelerationIncludingGravity;
      if (g?.x == null) return;
      const ax = Math.abs(g.x);
      const ay = Math.abs(g.y);
      const next = ax > 6.5 && ax > ay * 1.6 ? (g.x > 0 !== IOS ? 'cw' : 'ccw') : ay > 6.5 && ay > ax * 1.6 ? null : undefined;
      if (next !== undefined) setDev((d) => (d.tilt === next ? d : { ...d, tilt: next }));
    };
    const listen = () => addEventListener('devicemotion', onMotion);
    const firstTap = () => {
      if (!small.matches) return;
      // iOS only hands out motion data after asking, and only from a tap.
      const ask = window.DeviceMotionEvent?.requestPermission;
      if (typeof ask === 'function') ask().then((st) => st === 'granted' && listen(), () => {});
    };
    if (typeof window.DeviceMotionEvent?.requestPermission !== 'function') listen();
    addEventListener('pointerup', firstTap, { once: true });
    return () => {
      small.removeEventListener('change', read);
      land.removeEventListener('change', read);
      removeEventListener('devicemotion', onMotion);
      removeEventListener('pointerup', firstTap);
    };
  }, []);
  return dev;
}

// Full screen only on phone-sized screens, and only while the phone is up (where the browser allows it;
// iPhone Safari has no Fullscreen API, "Add to Home Screen" covers it there).
const fullscreenEl = () => document.fullscreenElement || document.webkitFullscreenElement;
function enterFullscreen() {
  if (!matchMedia(SMALL).matches || fullscreenEl()) return;
  const el = document.documentElement;
  (el.requestFullscreen?.({ navigationUI: 'hide' }) || el.webkitRequestFullscreen?.())?.catch?.(() => {});
}
function exitFullscreen() {
  if (fullscreenEl()) (document.exitFullscreen?.() || document.webkitExitFullscreen?.())?.catch?.(() => {});
}

function Experience() {
  const [q, nav] = useUrlState();
  const { passed, setWhere, markRead, ringing, ready, setComposing } = useGame();
  const [introDone, setIntroDone] = useState(() => !!q.app || localStorage.getItem('vyral:intro') === '1');
  const [toast, setToast] = useState(null);
  const toastT = useRef(null);

  const up = q.phone === 'up' || !!q.app;
  const o = q.o === 'landscape' ? 'landscape' : 'portrait';
  const locked = up && !q.app;
  const onHome = q.app === 'home' || locked;
  const AppView = APPS[q.app];

  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // Tell the notification engine where we are; opening an app reads its notifications.
  useEffect(() => {
    setWhere({ app: q.app || null, up, playing: introDone });
    if (ready && q.app && APPS[q.app]) markRead((n) => n.app === q.app);
  }, [q.app, up, introDone, ready, setWhere, markRead]);

  useEffect(() => {
    setComposing(['compose', 'camera', 'studio', 'caption', 'send', 'storyshare'].includes(q.view));
  }, [q.view, setComposing]);

  // Incoming call yanks the phone out, GTA-style.
  useEffect(() => {
    if (ringing && !up) nav({ phone: 'up', app: 'home' });
  }, [ringing, up, nav]);

  // Portrait-only apps bounce back from landscape (also covers deep links / real-device rotation).
  useEffect(() => {
    if (o === 'landscape' && PORTRAIT_ONLY[q.app]) {
      flash(`↻ ${PORTRAIT_ONLY[q.app]}`);
      const t = setTimeout(() => {
        if (!matchMedia('(max-width: 560px), (max-height: 480px)').matches) nav({ o: null }, { replace: true });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [o, q.app, nav, flash]);

  const pickup = () => {
    enterFullscreen(); // inside the tap, which is the only time browsers allow it
    play('pickup');
    nav({ phone: 'up' });
  };
  const putAway = useCallback(() => {
    play('whoosh', 0.4);
    nav({ phone: null, app: null, view: null, id: null, folder: null });
  }, [nav]);
  const home = useCallback(() => nav({ app: 'home', view: null, id: null, folder: null }), [nav]);
  const rotate = useCallback(() => nav({ o: o === 'portrait' ? 'landscape' : null }, { replace: true }), [nav, o]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, [contenteditable="true"], .studio-body')) return;
      if (e.key === 'ArrowUp' && !up) nav({ phone: 'up' });
      else if ((e.key === 'ArrowDown' || e.key === 'Backspace') && onHome) putAway();
      else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && up) rotate();
      else if (e.key === 'Escape') {
        if (q.app && q.app !== 'home') home();
        else if (up) putAway();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [up, onHome, q.app, nav, putAway, rotate, home]);

  // On a real phone the device *is* the phone: follow its orientation — even with rotation lock on.
  const dev = useDevice();
  const wantLand = dev.small && (dev.land || (!!dev.tilt && !PORTRAIT_ONLY[q.app]));
  useEffect(() => {
    if (dev.small && (q.o === 'landscape') !== wantLand) nav({ o: wantLand ? 'landscape' : null }, { replace: true });
  }, [dev.small, wantLand, q.o, nav]);
  // Phone up via a link/back button (no tap to piggyback on): go full screen on the next tap.
  // Phone away, or no longer phone-sized: leave full screen.
  useEffect(() => {
    if (!up || !dev.small) return exitFullscreen();
    addEventListener('pointerup', enterFullscreen, { once: true });
    return () => removeEventListener('pointerup', enterFullscreen);
  }, [up, dev.small]);
  // On phones the iFrute fills the screen, so there's no world to tap: the home bar on the home/lock
  // screen puts it away. Tell people once.
  useEffect(() => {
    if (!dev.small || q.app !== 'home' || localStorage.getItem('vyral:awayHint')) return;
    localStorage.setItem('vyral:awayHint', '1');
    const t = setTimeout(() => flash('Tap the bar at the bottom again to put your phone away'), 1200);
    return () => clearTimeout(t);
  }, [dev.small, q.app, flash]);
  // Rotation-locked phone held sideways: the viewport stays portrait, so the phone UI turns itself.
  const tilt = dev.small && !dev.land && wantLand ? dev.tilt : null;

  if (!introDone)
    return (
      <Intro
        onDone={() => {
          localStorage.setItem('vyral:intro', '1');
          setIntroDone(true);
        }}
      />
    );

  const deviceLandscapeBlocked = o === 'landscape' && PORTRAIT_ONLY[q.app];

  return (
    <>
      <World up={up} onPickup={up ? (onHome ? putAway : undefined) : pickup} />
      <Phone up={up} orientation={o} tilt={tilt} locked={locked} studio={q.view === 'studio'} current={q.app} toast={toast || (deviceLandscapeBlocked && `↻ ${PORTRAIT_ONLY[q.app]} Rotate back to portrait.`)} onHome={dev.small && onHome ? putAway : home} onRotate={rotate}>
        {!up ? null : locked ? (
          <Lock onUnlock={home} />
        ) : AppView ? (
          <div className={`app-shell ${deviceLandscapeBlocked ? 'app-shell--blocked' : ''}`}>
            <AppView key={q.app} q={q} nav={nav} home={home} flash={flash} />
          </div>
        ) : (
          <Home onOpen={(app) => nav({ app })} />
        )}
      </Phone>
      <Passed passed={passed} />
    </>
  );
}

export default function App() {
  useEffect(startRadio, []);
  return (
    <GameProvider>
      <Experience />
    </GameProvider>
  );
}
