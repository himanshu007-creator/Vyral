import { useEffect, useRef, useState } from 'react';
import Leonida from '../scene/Leonida';
import { useGame } from '../game';
import { fmt } from '../lib/clout';
import { setMuted, stationName, useMuted } from '../lib/sfx';
import Legal from '../ui/Legal';
import './world.css';

export function Stars({ n, className = '' }) {
  return (
    <div className={`stars ${n >= 5 ? 'stars--cops' : ''} ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i < n ? 'on' : ''}>
          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21.2l1.6-7L2 9.5l7.1-.6z" />
        </svg>
      ))}
    </div>
  );
}

// Minimap road graph (200×130 radar space). The cop does a random walk and never U-turns unless stuck.
const NODES = { A: [60, 40], B: [140, 40], C: [60, 95], D: [140, 95], l1: [0, 40], r1: [200, 40], l2: [0, 95], r2: [200, 95], t1: [60, 0], b1: [60, 130], t2: [140, 0], b2: [140, 130] };
const EDGES = { A: ['B', 'C', 'l1', 't1'], B: ['A', 'D', 'r1', 't2'], C: ['A', 'D', 'l2', 'b1'], D: ['B', 'C', 'r2', 'b2'], l1: ['A'], r1: ['B'], l2: ['C'], r2: ['D'], t1: ['A'], b1: ['C'], t2: ['B'], b2: ['D'] };

function useCopPatrol() {
  const [leg, setLeg] = useState({ at: 'A', ms: 0 });
  const prev = useRef('C');
  useEffect(() => {
    const t = setTimeout(() => {
      const options = EDGES[leg.at].filter((n) => n !== prev.current);
      const next = (options.length ? options : EDGES[leg.at])[Math.floor(Math.random() * (options.length || 1))];
      const [x1, y1] = NODES[leg.at];
      const [x2, y2] = NODES[next];
      prev.current = leg.at;
      setLeg({ at: next, ms: Math.hypot(x2 - x1, y2 - y1) * 45 });
    }, leg.ms + 120);
    return () => clearTimeout(t);
  }, [leg]);
  return leg;
}

function Radar() {
  const leg = useCopPatrol();
  const [cx, cy] = NODES[leg.at];
  return (
    <div className="radar">
      <svg viewBox="0 0 200 130" className="radar-map">
        <rect width="200" height="130" fill="#1d2a1f" />
        <path d="M0 40 H200 M0 95 H200 M60 0 V130 M140 0 V130 M0 130 L90 0" stroke="#4b5a4c" strokeWidth="7" />
        <path d="M0 40 H200 M0 95 H200 M60 0 V130 M140 0 V130" stroke="#6d7d6e" strokeWidth="1" strokeDasharray="4 4" />
        <rect x="150" y="0" width="50" height="30" fill="#1f5f8a" />
        <circle cx="30" cy="20" r="3" fill="#ff4f9a" className="blip" />
        <circle cx="170" cy="110" r="3" fill="#ff4f9a" className="blip" />
        <circle cx="120" cy="60" r="3" fill="#ffd23f" className="blip" />
        <g className="radar-cop" style={{ transform: `translate(${cx}px, ${cy}px)`, transitionDuration: `${leg.ms}ms` }}>
          <circle r="9" className="radar-cop-ring" />
          <rect x="-4" y="-3" width="8" height="6" rx="1.5" fill="#fff" stroke="#000" strokeWidth="1" />
          <rect x="-4" y="-3" width="4" height="2" className="cop-r" />
          <rect x="0" y="-3" width="4" height="2" className="cop-b" />
        </g>
      </svg>
      <svg viewBox="0 0 20 20" className="radar-me">
        <path d="M10 2 L16 17 L10 13 L4 17 Z" fill="#fff" stroke="#000" />
      </svg>
      <div className="radar-bars">
        <i className="bar-clout" title="Clout" />
        <i className="bar-esteem" title="Self-esteem" />
      </div>
    </div>
  );
}

export default function World({ up, onPickup }) {
  const { stars, totalLikes } = useGame();
  const muted = useMuted();
  return (
    <>
      <div className={`world ${up ? 'world--blur' : ''}`} onClick={onPickup}>
        <Leonida ads={!up} />
        <div className="world-vignette" />
      </div>

      <div className="hud">
        <div className="hud-tr">
          <div className="hud-cash gta-title">${fmt(12 + Math.floor(totalLikes / 1000))}</div>
          <Stars n={stars} />
          <div className="hud-likes">{fmt(totalLikes)} likes</div>
        </div>
        {!up && (
          <div className="help-box">
            Press <kbd>▲</kbd> or tap anywhere to use your phone. Billboards are clickable.
          </div>
        )}
        <Radar />
        <button
          className="hud-mute"
          title={muted ? 'Sound off' : `📻 ${stationName()} · live from Miami`}
          aria-label={muted ? 'Turn sound on' : 'Turn radio and sound off'}
          onClick={() => setMuted(!muted)}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <a className="hud-home" href="/">
          ← FruteStore
        </a>
        <Legal compact className="hud-legal" />
      </div>

      {!up && (
        <button className="phone-peek" onClick={onPickup} aria-label="Use phone">
          <span>📱</span>
        </button>
      )}
    </>
  );
}
