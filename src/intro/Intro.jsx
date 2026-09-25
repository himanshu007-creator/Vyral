import { useEffect, useState } from 'react';
import Leonida from '../scene/Leonida';
import { TIPS } from '../data/roasts';
import { play } from '../lib/sfx';
import './intro.css';

const P = (n) => `/media/posts/${n}.webp`;
const PANELS = [
  { img: P('passenger-princess'), label: 'Passenger Princess', tint: '#ff4f9a' },
  { img: P('mudbog-selfie'), label: 'Florida Man', tint: '#ffb36b', wide: true },
  { img: P('fence-mugshot'), label: 'The Suspect', tint: '#3a6bff' },
  { img: P('couple-sunset'), label: 'Ride or Die', tint: '#ff7a59', wide: true },
  { img: P('bank-job'), label: 'Finance Bro', tint: '#00e5ff' },
];

export function Logo({ small = false }) {
  return (
    <div className={`vy-logo ${small ? 'vy-logo--small' : ''}`}>
      <span className="vy-kicker">Grand Theft Attention</span>
      <span className="vy-word">VYRAL</span>
      <span className="vy-sub">Leonida · in your pocket</span>
    </div>
  );
}

export default function Intro({ onDone }) {
  const [phase, setPhase] = useState('card'); // card → zoom → loading → ready
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    play('intro', 0.5);
    const a = setTimeout(() => setPhase((p) => (p === 'card' ? 'zoom' : p)), 2600);
    const b = setTimeout(() => setPhase((p) => (p === 'zoom' ? 'loading' : p)), 9000);
    return () => [a, b].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setPhase('ready');
          return 100;
        }
        return p + 1.4 + Math.random() * 2;
      });
    }, 70);
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 2600);
    return () => {
      clearInterval(id);
      clearInterval(t);
    };
  }, [phase]);

  useEffect(() => {
    const next = () => {
      if (phase === 'ready') onDone();
      else if (phase === 'loading') setProgress(100);
      else setPhase('loading');
    };
    addEventListener('keydown', next);
    addEventListener('pointerdown', next);
    return () => {
      removeEventListener('keydown', next);
      removeEventListener('pointerdown', next);
    };
  }, [phase, onDone]);

  return (
    <div className={`intro intro--${phase}`}>
      {phase === 'card' && (
        <div className="intro-card">
          <span>a</span>
          <b className="sunset-text">VYRAL</b>
          <span>production</span>
        </div>
      )}
      {phase === 'zoom' && (
        <div className="intro-zoom">
          <div className="intro-zoom-scene">
            <Leonida />
          </div>
          <div className="intro-bars" />
          <Logo />
        </div>
      )}
      {(phase === 'loading' || phase === 'ready') && (
        <div className="intro-loading">
          <div className="cover-grid">
            {PANELS.map((p, i) => (
              <div key={p.label} className={`cover-panel ${p.wide ? 'wide' : ''}`} style={{ '--tint': p.tint, animationDelay: `${i * 0.12}s` }}>
                <img src={p.img} alt="" />
                <span className="cover-label gta-title">{p.label}</span>
              </div>
            ))}
            <div className="cover-panel cover-logo">
              <Logo small />
            </div>
          </div>
          <div className="loading-bar">
            <p className="loading-tip">{TIPS[tip]}</p>
            {phase === 'ready' ? (
              <p className="press-any">PRESS ANY KEY TO CONTINUE</p>
            ) : (
              <div className="loading-right">
                <i className="loading-spin" />
                <span>{Math.min(100, Math.floor(progress))}%</span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="intro-legal">Fan parody · not affiliated with Rockstar Games / Take-Two · stills © @r3spawnhere · tap to skip</div>
    </div>
  );
}
