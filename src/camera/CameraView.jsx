import { useEffect, useRef, useState } from 'react';
import { LENSES, GRAM_FILTERS, bake, fontsReady } from './lenses';
import { SAMPLES } from '../data/samples';
import { POSTS } from '../data/media';
import { fileToDataUrl, loadImage } from '../lib/image';
import { play, buzz } from '../lib/sfx';
import { CLIP_SECONDS, canRecord, recordClip, videoFrom } from '../lib/video';
import { Close, Flash, Flip, Moon } from '../ui/icons';
import './camera.css';

const rollSeed = () => Math.floor(Math.random() * 1e6);
const STOCK = [...POSTS.map((p) => ({ id: p.id, src: p.image, label: p.caption })), ...SAMPLES];
const SWATCH = '/media/posts/couple-sunset-thumb.webp';

/**
 * Shared camera. mode="gram": Instagram — colour-grade filters overlaid on the bottom of a 4:5 frame.
 * mode="sus": Snapchat — full-bleed, overlay lenses wrapped around the shutter, right-side tool stack.
 */
export default function CameraView({ mode = 'sus', initialMode = 'POST', onCapture, onVideo, onClose, top = null, flashMsg }) {
  const gram = mode === 'gram';
  const videoRef = useRef(null);
  const gradeRef = useRef(null);
  const overlayRef = useRef(null);
  const viewRef = useRef(null);
  const fileRef = useRef(null);
  const [facing, setFacing] = useState('user');
  const [error, setError] = useState(null);
  const [live, setLive] = useState(false);
  const [lensIdx, setLensIdx] = useState(1);
  const [filterIdx, setFilterIdx] = useState(0);
  const [nameFlash, setNameFlash] = useState(0);
  const [seed, setSeed] = useState(rollSeed);
  const [flashOn, setFlashOn] = useState(false);
  const [night, setNight] = useState(false);
  const [white, setWhite] = useState(0);
  const [tray, setTray] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gmode, setGmode] = useState(initialMode);
  const [rec, setRec] = useState(null); // recording progress 0..1
  const holdRef = useRef(null);
  const lens = gram ? null : LENSES[lensIdx];
  const filter = gram ? GRAM_FILTERS[filterIdx] : null;

  // Webcam lifecycle — tracks stop on unmount so the camera light turns off. Front + back supported.
  // `attempt` re-runs it from a tap: iPad/iOS Safari may only show the permission prompt for a user gesture.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let stream;
    let dead = false;
    const md = navigator.mediaDevices;
    if (!md?.getUserMedia) {
      setError(window.isSecureContext ? 'unsupported' : 'insecure');
      return;
    }
    setError(null);
    md.getUserMedia({ video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      // Some iPads reject the resolution hint; any camera beats no camera.
      .catch((e) => (e.name === 'OverconstrainedError' ? md.getUserMedia({ video: true, audio: false }) : Promise.reject(e)))
      .then((s) => {
        if (dead || !videoRef.current) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {}); // iOS won't always honour autoPlay on a stream
      })
      .catch((e) => !dead && setError(e.name || 'error'));
    return () => {
      dead = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing, attempt]);

  // Live lens preview: blend "grade" on its own canvas (CSS mix-blend-mode), overlay on another.
  useEffect(() => {
    if (!lens) return;
    const view = viewRef.current;
    const draw = () => {
      const dpr = devicePixelRatio || 1;
      for (const [ref, fn] of [
        [gradeRef, lens.grade],
        [overlayRef, lens.draw],
      ]) {
        const c = ref.current;
        if (!c) continue;
        c.width = view.clientWidth * dpr;
        c.height = view.clientHeight * dpr;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        fn?.call(lens, ctx, c.width, c.height, seed);
      }
    };
    fontsReady.then(draw);
    const ro = new ResizeObserver(draw);
    ro.observe(view);
    return () => ro.disconnect();
  }, [lens, seed]);

  const aspectNow = () => viewRef.current.clientWidth / viewRef.current.clientHeight;

  const finish = async (source, sw, sh, mirror) => {
    setBusy(true);
    if (flashOn) {
      setWhite((w) => w + 1);
      await new Promise((r) => setTimeout(r, 180));
    }
    play('shutter');
    buzz(25);
    const dataUrl = await bake(source, sw, sh, { aspect: aspectNow(), mirror, lens, seed, filter });
    setBusy(false);
    onCapture(dataUrl, { lens: lensId(), mode: gram ? gmode.toLowerCase() : 'snap' });
  };

  const shoot = () => {
    const v = videoRef.current;
    if (busy) return;
    if (!v?.videoWidth) return setTray(true);
    finish(v, v.videoWidth, v.videoHeight, facing === 'user');
  };

  const fromSrc = async (src) => {
    const img = await loadImage(src);
    setTray(false);
    finish(img, img.naturalWidth, img.naturalHeight, false);
  };

  const lensId = () => (lens && lens.id !== 'none' ? lens.id : filter && filter.id !== 'normal' ? filter.id : null);

  // 5-second clip from the live camera — lens/filter composited into every frame.
  const recordLive = async () => {
    const v = videoRef.current;
    if (busy || rec != null) return;
    if (!canRecord()) return flashMsg?.('This browser can’t record video. Try Chrome or Safari 16+ (or upload a clip).');
    if (!v?.videoWidth) return setTray(true);
    setRec(0);
    play('rec-start', 0.5);
    buzz(40);
    const res = await recordClip(v, { aspect: aspectNow(), mirror: facing === 'user', lens, seed, filter, onProgress: setRec });
    play('rec-stop', 0.5);
    setRec(null);
    onVideo?.({ ...res, lens: lensId(), mode: gram ? (gmode === 'STORY' ? 'story' : 'reel') : 'snap' });
  };

  // Uploaded video → first 5 s, re-shot through the current lens/filter.
  const fromVideoFile = async (file) => {
    if (!canRecord()) return flashMsg?.('This browser can’t process video. Try Chrome or Safari 16+.');
    setTray(false);
    setRec(0);
    try {
      const v = await videoFrom(file);
      const seconds = Number.isFinite(v.duration) ? Math.min(CLIP_SECONDS, v.duration) : CLIP_SECONDS;
      const res = await recordClip(v, { aspect: aspectNow(), lens, seed, filter, fromStart: true, seconds, onProgress: setRec });
      onVideo?.({ ...res, lens: lensId(), mode: gram ? (gmode === 'STORY' ? 'story' : 'reel') : 'snap' });
    } catch {
      flashMsg?.('That video didn’t load. Probably evidence.');
    }
    setRec(null);
  };

  // Snap: tap = photo, hold = video.
  const holdStart = () => {
    holdRef.current = setTimeout(() => {
      holdRef.current = 'rec';
      recordLive();
    }, 320);
  };
  const holdEnd = () => {
    if (holdRef.current !== 'rec') {
      clearTimeout(holdRef.current);
      shoot();
    }
    holdRef.current = null;
  };

  const flip = () => {
    setLive(false);
    setFacing((f) => (f === 'user' ? 'environment' : 'user'));
    play('tap', 0.25);
  };

  const pickFilter = (i) => {
    setFilterIdx(i);
    setNameFlash((n) => n + 1);
    play('tap', 0.2);
  };

  const videoFilter = [gram ? filter.css : lens.filter, night ? 'brightness(1.45) contrast(.9) saturate(.8)' : ''].filter((x) => x && x !== 'none').join(' ') || 'none';

  const noSignal = !live && (
    <div className="cam-nosignal">
      {error ? (
        <>
          <b>NO SIGNAL</b>
          <span>
            {error === 'NotAllowedError'
              ? 'VCPD confiscated your camera. Allow it in the address bar (iPhone/iPad: Settings › Safari › Camera), or use a photo.'
              : error === 'insecure'
                ? 'The camera only works over HTTPS. Leonida has standards, apparently.'
                : 'No camera found. Probably pawned.'}
          </span>
          {error !== 'insecure' && <button onClick={() => setAttempt((a) => a + 1)}>Try again</button>}
          <button onClick={() => setTray(true)}>Use a photo instead</button>
        </>
      ) : (
        <>
          <span className="cam-waking">Waking up the camera… (allow access, we promise it’s only for crimes against fashion)</span>
          <button onClick={() => setAttempt((a) => a + 1)}>Tap to allow camera</button>
          <button onClick={() => setTray(true)}>Use a photo instead</button>
        </>
      )}
    </div>
  );

  const trayEl = tray && (
    <div className="cam-tray">
      <div className="cam-tray-head">
        <b>{gram ? 'Recents' : 'Memories'}</b>
        <button onClick={() => setTray(false)}>
          <Close size={18} />
        </button>
      </div>
      <div className="cam-tray-grid">
        <button className="cam-import" onClick={() => fileRef.current.click()}>
          <span>＋</span>Photo or 5s video
        </button>
        {STOCK.map((s) => (
          <button key={s.id} onClick={() => fromSrc(s.src)} title={s.label}>
            <img src={s.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.type.startsWith('video/')) fromVideoFile(f);
          else fromSrc(await fileToDataUrl(f));
        }}
      />
    </div>
  );

  const recUI = rec != null && (
    <div className="cam-rec">
      <i /> REC {Math.ceil(CLIP_SECONDS * (1 - rec))}s
    </div>
  );
  const ring = (
    <svg className="rec-ring" viewBox="0 0 100 100" style={{ opacity: rec != null ? 1 : 0 }}>
      <circle cx="50" cy="50" r="46" pathLength="100" strokeDasharray={`${(rec || 0) * 100} 100`} />
    </svg>
  );

  const video = (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      onPlaying={() => setLive(true)}
      style={{ filter: videoFilter, transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
    />
  );

  if (gram)
    return (
      <div className="cam cam--gram">
        <div className="cam-stage">
          <div className={`cam-view ${gmode === 'POST' ? '' : 'cam-view--tall'}`} ref={viewRef}>
            {video}
            {filter.tint && <i className="cam-tint" style={{ background: filter.tint[0], mixBlendMode: filter.tint[1], opacity: filter.tint[2] }} />}
            {noSignal}
            <div className="gram-grid" />
            <div className="gram-top">
              <button onClick={onClose} aria-label="Close">
                <Close />
              </button>
              <button onClick={() => setFlashOn((f) => !f)} aria-label="Flash">
                <Flash on={flashOn} />
              </button>
              <button onClick={flip} aria-label="Flip">
                <Flip />
              </button>
            </div>
            <span key={nameFlash} className="filter-name">
              {filter.name}
            </span>
            <div className="gram-filters">
              {GRAM_FILTERS.map((f, i) => (
                <button key={f.id} className={i === filterIdx ? 'on' : ''} onClick={() => pickFilter(i)}>
                  <span style={{ backgroundImage: `url(${SWATCH})`, filter: f.css }}>
                    {f.tint && <i style={{ background: f.tint[0], mixBlendMode: f.tint[1], opacity: f.tint[2] }} />}
                  </span>
                  <small>{f.name}</small>
                </button>
              ))}
            </div>
            <i key={`w${white}`} className={white ? 'cam-flash' : ''} />
            {recUI}
          </div>
        </div>
        <div className="gram-bottom">
          <button className="gram-gallery" onClick={() => setTray(true)} style={{ backgroundImage: `url(${POSTS[7].image})` }} aria-label="Gallery" />
          <button
            className={`shutter shutter--gram ${gmode === 'REEL' ? 'is-reel' : ''} ${gmode === 'STORY' ? 'is-story' : ''}`}
            onClick={gmode === 'REEL' ? recordLive : gmode === 'POST' ? shoot : undefined}
            onPointerDown={gmode === 'STORY' ? holdStart : undefined}
            onPointerUp={gmode === 'STORY' ? holdEnd : undefined}
            onContextMenu={(e) => e.preventDefault()}
            disabled={busy || rec != null}
            aria-label={gmode === 'STORY' ? 'Tap for photo, hold for video' : 'Capture'}
          >
            <i />
            {ring}
          </button>
          <button className="gram-flip" onClick={flip} aria-label="Flip">
            <Flip />
          </button>
        </div>
        <div className="gram-modes">
          {['POST', 'STORY', 'REEL'].map((m) => (
            <button
              key={m}
              className={gmode === m ? 'on' : ''}
              onClick={() => {
                setGmode(m);
                if (m === 'STORY') flashMsg?.('STORY: tap for a photo, hold for a 5s clip. Gone in 24 game hours (screenshots aren’t).');
                if (m === 'REEL') flashMsg?.(`REEL: tap the red button for a ${CLIP_SECONDS}s clip (or upload one from Recents).`);
              }}
            >
              {m}
            </button>
          ))}
        </div>
        {trayEl}
      </div>
    );

  // SusChat
  const around = [-2, -1, 0, 1, 2].map((d) => (lensIdx + d + LENSES.length) % LENSES.length);
  return (
    <div className="cam cam--sus">
      <div className="cam-stage">
        <div className="cam-view" ref={viewRef}>
          {video}
          {noSignal}
          <canvas ref={gradeRef} className="cam-overlay" style={{ mixBlendMode: lens.blend || 'normal' }} />
          <canvas ref={overlayRef} className="cam-overlay" />
          {top}
          <div className="sus-tools">
            <button onClick={flip} aria-label="Flip">
              <Flip size={22} />
            </button>
            <button className={flashOn ? 'on' : ''} onClick={() => setFlashOn((f) => !f)} aria-label="Flash">
              <Flash size={22} on={flashOn} />
            </button>
            <button
              className={night ? 'on' : ''}
              onClick={() => {
                setNight((n) => !n);
                if (!night) flashMsg?.('Night mode: ON. Now everyone can see your apartment.');
              }}
              aria-label="Night mode"
            >
              <Moon size={22} />
            </button>
            <button onClick={() => setSeed(rollSeed())} aria-label="Re-roll roast">
              🎲
            </button>
          </div>
          <div className="sus-lens-bar">
            <span className="sus-lens-name">{rec != null ? 'Recording…' : `${lens.name} · hold for video`}</span>
            <div className="sus-lens-row">
              <button className="sus-mem" onClick={() => setTray(true)} aria-label="Memories">
                🖼️
              </button>
              {around.map((i, k) =>
                k === 2 ? (
                  <button
                    key={`s${i}`}
                    className={`shutter shutter--sus ${rec != null ? 'is-rec' : ''}`}
                    onPointerDown={holdStart}
                    onPointerUp={holdEnd}
                    onPointerLeave={() => holdRef.current !== 'rec' && clearTimeout(holdRef.current)}
                    onContextMenu={(e) => e.preventDefault()}
                    disabled={busy}
                    aria-label="Tap for photo, hold for video"
                  >
                    <span>{LENSES[i].icon}</span>
                    {ring}
                  </button>
                ) : (
                  <button key={`l${i}-${k}`} className="sus-lens" onClick={() => setLensIdx(i)}>
                    {LENSES[i].icon}
                  </button>
                ),
              )}
            </div>
          </div>
          <i key={`w${white}`} className={white ? 'cam-flash' : ''} />
          {recUI}
        </div>
      </div>
      {trayEl}
    </div>
  );
}
