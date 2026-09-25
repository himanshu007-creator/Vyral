import { useEffect, useRef, useState } from 'react';
import ImageEditor from '@unlayer/react-image-editor';
import { SKINS } from './skins';
import { play } from '../lib/sfx';
import { unlayer } from '../ui/links';
import { Back, Close } from '../ui/icons';
import { ReelgramLogo, SusChatLogo, ITextLogo, FruitRollLogo } from '../phone/Icons';
import './studio.css';

const LOGO = { gram: ReelgramLogo, sus: SusChatLogo, text: ITextLogo, roll: FruitRollLogo };
const LOADING = ['Applying Leonida humidity…', 'Calibrating ring light…', 'Removing evidence…', 'Lowering expectations…'];

export default function Studio({ skin = 'gram', image, onDone, onBack, guide, guideVideo, busy }) {
  const ref = useRef(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const cfg = SKINS[skin];
  const Logo = LOGO[skin];

  // Video mode: find the image's on-screen rect by scanning Unlayer's canvas for the invisible
  // 1/255 marker pixels, then pin the clip's frame exactly underneath (follows zoom/resize too).
  const bodyRef = useRef(null);
  useEffect(() => {
    if (!guide || status !== 'ready') return;
    const id = setInterval(() => {
      const cv = bodyRef.current?.querySelector('.lower-canvas');
      const cc = bodyRef.current?.querySelector('.canvas-container');
      if (!cv || !cc || !cv.width) return;
      const { data } = cv.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, cv.width, cv.height);
      let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
      for (let y = 0; y < cv.height; y += 2)
        for (let x = 0; x < cv.width; x += 2) {
          const a = data[(y * cv.width + x) * 4 + 3];
          if (a >= 1 && a <= 3) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      if (x1 < 0) return;
      const k = cv.clientWidth / cv.width;
      const [l, t, w, h] = [x0 * k, y0 * k, (x1 - x0 + 2) * k, (y1 - y0 + 2) * k];
      cc.style.background = `url(${guide}) ${l}px ${t}px / ${w}px ${h}px no-repeat`;
      // The clip itself loops underneath while you edit (poster stays as a fallback).
      if (guideVideo) {
        let v = cc.querySelector('video.studio-guide-video');
        if (!v) {
          v = document.createElement('video');
          v.className = 'studio-guide-video';
          v.muted = true;
          v.loop = true;
          v.playsInline = true;
          v.setAttribute('muted', '');
          v.setAttribute('playsinline', '');
          v.src = guideVideo;
          cc.prepend(v);
          v.play().catch(() => {});
        }
        Object.assign(v.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px` });
      }
    }, 350);
    return () => clearInterval(id);
  }, [guide, guideVideo, status]);

  const finish = (dataUrl) => {
    const ed = ref.current?.editor;
    play('shutter', 0.4);
    onDone(dataUrl || ed?.getImage() || image, { edited: !!ed?.hasChanges?.() || !!dataUrl });
  };

  return (
    <div className={`studio studio--${skin} ${guide ? 'studio--guide' : ''}`} style={guide ? { '--guide': `url(${guide})` } : undefined}>
      <header className="studio-head">
        <button className="studio-back" onClick={onBack} aria-label="Back">
          {skin === 'sus' ? <Close /> : <Back />}
        </button>
        <a className="studio-badge" href={unlayer(`studio-${skin}`)} target="_blank" rel="noreferrer" title="The editor inside this app is Unlayer React Image Editor">
          <span className="studio-logo">
            <Logo />
          </span>
          <span>
            <b>{guide ? `${cfg.sub} · 5s clip` : cfg.sub}</b>
            <small>✦ powered by Unlayer ↗</small>
          </span>
        </a>
        <button className="studio-go" onClick={() => finish()} disabled={status !== 'ready' || busy != null}>
          {cfg.done}
        </button>
      </header>
      {guide && <p className="studio-guide-tip">🎬 Draw, caption & sticker over your clip — Unlayer layers get burned into every frame.</p>}
      <div className="studio-body" ref={bodyRef}>
        {busy != null && (
          <div className="studio-overlay studio-overlay--render">
            <i className="studio-spinner" />
            <b>Burning your edits into the footage… {Math.round(busy * 100)}%</b>
            <small>Unlayer overlay → every frame. Real-time, because crime doesn’t wait.</small>
          </div>
        )}
        {status === 'loading' && (
          <div className="studio-overlay">
            <i className="studio-spinner" />
            {LOADING[attempt % LOADING.length]}
            <small>{cfg.tip}</small>
          </div>
        )}
        {status === 'error' && (
          <div className="studio-overlay">
            <b>No signal in the Everglades.</b>
            <span>The Edit Studio couldn’t load (it lives on the internet, unlike your self-esteem).</span>
            <button
              className="studio-go"
              onClick={() => {
                setStatus('loading');
                setAttempt((a) => a + 1);
              }}
            >
              Retry
            </button>
          </div>
        )}
        <ImageEditor
          key={attempt}
          ref={ref}
          image={image}
          options={guide ? cfg.videoOptions : cfg.options}
          minHeight="100%"
          style={{ height: '100%', width: '100%' }}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
          onLoadError={() => setStatus('error')}
          onSave={({ dataUrl }) => finish(dataUrl)}
          onCancel={onBack}
        />
      </div>
    </div>
  );
}
