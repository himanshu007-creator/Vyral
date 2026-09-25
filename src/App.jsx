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

  // On a real phone the device *is* the phone: follow its orientation.
  useEffect(() => {
    const small = matchMedia('(max-width: 560px), (max-height: 480px)');
    const land = matchMedia('(orientation: landscape)');
    const sync = () => {
      if (small.matches) nav({ o: land.matches ? 'landscape' : null }, { replace: true });
    };
    sync();
    land.addEventListener('change', sync);
    return () => land.removeEventListener('change', sync);
  }, [nav]);

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
      <Phone up={up} orientation={o} locked={locked} studio={q.view === 'studio'} current={q.app} toast={toast || (deviceLandscapeBlocked && `↻ ${PORTRAIT_ONLY[q.app]} Rotate back to portrait.`)} onHome={home} onRotate={rotate}>
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
