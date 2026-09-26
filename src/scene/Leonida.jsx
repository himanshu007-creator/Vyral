import { unlayer, CREATOR, ASSETS_BY } from '../ui/links';
import { useSyncExternalStore } from 'react';
import useSkyPhase from '../lib/useSkyPhase';
import './leonida.css';

// Hand-built Vice City. The palette is a set of CSS custom properties that cross-fade
// between dawn → day → sunset → night (one per real minute). `ads` makes billboards clickable;
// `billboards={false}` hides them (wallpapers stay brand-free).
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const PAL = {
  dawn: { s0: '#2b2d6b', s1: '#8a5aa8', s2: '#ff9a8b', s3: '#ffd3a5', u0: '#fff6c8', u1: '#ffb38a', u2: '#ff7a8a', glow: '#ffc9a0', e0: '#7a5aa8', e1: '#1b1240', bld: '#2b1a4a', cloud: '#ffb3c7', stars: 0.25, moon: 0, sun: 1, sunY: 90, w: [0.75, 0.1, 0.06, 0.06] },
  day: { s0: '#2f8cff', s1: '#6fc0ff', s2: '#b8e4ff', s3: '#ffe9c7', u0: '#ffffff', u1: '#fff3b0', u2: '#ffd36b', glow: '#fff3b0', e0: '#1fa3d9', e1: '#0a4b8a', bld: '#2a3a66', cloud: '#ffffff', stars: 0, moon: 0, sun: 1, sunY: -200, w: [0.1, 0.06, 0.06, 0.06] },
  sunset: { s0: '#1b0f3a', s1: '#5a2a8a', s2: '#ff4f9a', s3: '#ffb36b', u0: '#fff3a8', u1: '#ffb36b', u2: '#ff4f9a', glow: '#ffcf8a', e0: '#6a2b86', e1: '#0d0726', bld: '#2a1242', cloud: '#ff8fb8', stars: 0.5, moon: 0, sun: 1, sunY: 0, w: [0.85, 0.7, 0.1, 0.06] },
  night: { s0: '#05030f', s1: '#140a2e', s2: '#2d1452', s3: '#5a2a7a', u0: '#fff6c8', u1: '#ffb38a', u2: '#ff7a8a', glow: '#7b2ff7', e0: '#2a1450', e1: '#05030f', bld: '#150a26', cloud: '#6a3d9a', stars: 0.9, moon: 0.95, sun: 0, sunY: 260, w: [0.9, 0.85, 0.75, 0.6] },
};

// x, width, height, top style. Palms own the edges; the ads live in the middle.
const TOWERS = [
  [0, 70, 170], [72, 90, 240, 'step'], [165, 60, 150], [230, 120, 260, 'antenna'], [355, 70, 210, 'tank'], [430, 110, 300, 'unlayer'],
  [545, 60, 170, 'step'], [610, 80, 90, 'creator'], [695, 70, 70], [770, 90, 60], [865, 150, 76, 'club'], [1020, 165, 200, 'hotel'],
  [1190, 100, 290, 'spire'], [1295, 110, 250, 'antenna'], [1410, 80, 190, 'tank'], [1495, 105, 230, 'step'],
];
const WINDOWS = TOWERS.flatMap(([x, w, h]) => {
  const out = [];
  for (let y = 628 - h + 16; y < 614; y += 15) for (let wx = x + 7; wx < x + w - 8; wx += 11) if (rnd() > 0.55) out.push([wx, y, Math.floor(rnd() * 4)]);
  return out;
});

function Palm({ x, y, s = 1, flip = false, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 C 12 -120, 40 -230, 70 -330" stroke="#12061f" strokeWidth="18" fill="none" strokeLinecap="round" />
      <g className="palm-top" style={{ animationDelay: `${delay}s`, transformOrigin: '70px -330px' }}>
        {[-150, -115, -80, -45, -15, 20, 50].map((a) => (
          <path key={a} transform={`translate(70 -330) rotate(${a})`} d="M0 0 Q 70 -34 150 18 Q 110 0 80 8 Q 50 -4 0 0 Z" fill="#12061f" />
        ))}
      </g>
    </g>
  );
}

// SVG <a> that doesn't bubble to the world's "pick up phone" click.
const Ad = ({ href, ads, label, children }) =>
  ads ? (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="l-ad" onClick={(e) => e.stopPropagation()}>
      {children}
    </a>
  ) : (
    children
  );

// Tall screens (phones, portrait iPad) would crop the billboards off the sides with `slice`,
// so they frame just the ad strip and pin it to the bottom; the sky colour fills above.
const TALL = '(max-aspect-ratio: 5/4)';
const useTall = () =>
  useSyncExternalStore(
    (fn) => {
      const m = matchMedia(TALL);
      m.addEventListener('change', fn);
      return () => m.removeEventListener('change', fn);
    },
    () => matchMedia(TALL).matches,
  );

export default function Leonida({ className = '', still = false, ads = false, billboards = true, phase: forced }) {
  const live = useSkyPhase();
  const framed = useTall() && billboards;
  const phase = forced || live;
  const p = PAL[phase];
  const vars = {
    '--s0': p.s0, '--s1': p.s1, '--s2': p.s2, '--s3': p.s3, '--u0': p.u0, '--u1': p.u1, '--u2': p.u2, '--glow': p.glow,
    '--e0': p.e0, '--e1': p.e1, '--bld': p.bld, '--cloud': p.cloud, '--stars': p.stars, '--moon': p.moon, '--sun': p.sun,
    '--sunY': `${p.sunY}px`, '--w0': p.w[0], '--w1': p.w[1], '--w2': p.w[2], '--w3': p.w[3],
  };
  const stop = (v) => ({ stopColor: `var(${v})` });
  return (
    <svg className={`leonida ${still ? 'leonida--still' : ''} ${className}`} data-phase={phase} style={framed ? { ...vars, background: 'var(--s0)' } : vars} viewBox={framed ? '340 0 720 900' : '0 0 1600 900'} preserveAspectRatio={framed ? 'xMidYMax meet' : 'xMidYMid slice'} aria-hidden={!ads}>
      <defs>
        <linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop('--s0')} />
          <stop offset=".35" style={stop('--s1')} />
          <stop offset=".6" style={stop('--s2')} />
          <stop offset=".78" style={stop('--s3')} />
        </linearGradient>
        <linearGradient id="lsun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop('--u0')} />
          <stop offset=".55" style={stop('--u1')} />
          <stop offset="1" style={stop('--u2')} />
        </linearGradient>
        <linearGradient id="lsea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop('--e0')} />
          <stop offset="1" style={stop('--e1')} />
        </linearGradient>
        <mask id="lsunmask">
          <rect x="500" y="100" width="600" height="700" fill="#fff" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x="500" y={470 + i * 22 + i * i} width="600" height={3 + i * 1.8} fill="#000" />
          ))}
        </mask>
        <radialGradient id="lglow" cx=".5" cy=".62" r=".5">
          <stop offset="0" style={{ stopColor: 'var(--glow)', stopOpacity: 0.6 }} />
          <stop offset="1" style={{ stopColor: 'var(--glow)', stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="lbeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="lneon" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#lsky)" />
      <rect width="1600" height="900" fill="url(#lglow)" />
      <g className="l-fade" style={{ opacity: 'var(--stars)' }}>
        {[...Array(46)].map((_, i) => (
          <circle key={i} className="l-twinkle" style={{ animationDelay: `${(i % 7) * 0.6}s` }} cx={(i * 397) % 1600} cy={(i * 131) % 300} r={i % 5 === 0 ? 1.8 : 1} fill="#fff" />
        ))}
      </g>
      <circle className="l-fade" style={{ opacity: 'var(--moon)' }} cx="1250" cy="150" r="46" fill="#fff6d8" />
      <g className="l-sunwrap" style={{ opacity: 'var(--sun)', transform: 'translateY(var(--sunY))' }}>
        <g className="l-sun">
          <circle cx="800" cy="520" r="190" fill="url(#lsun)" mask="url(#lsunmask)" />
        </g>
      </g>
      <g className="l-clouds" style={{ fill: 'var(--cloud)' }} opacity=".5">
        <rect x="140" y="300" width="360" height="10" rx="5" />
        <rect x="220" y="318" width="240" height="8" rx="4" />
        <rect x="1100" y="260" width="420" height="10" rx="5" />
        <rect x="1180" y="278" width="260" height="8" rx="4" />
      </g>

      {/* police helicopter + searchlight */}
      <g className="l-heli">
        <polygon className="l-beam" points="0,6 -120,420 120,420" fill="url(#lbeam)" />
        <path d="M-26 0 h40 a10 10 0 0 1 0 14 h-40 z M14 7 h34 M44 2 v10" fill="#0a0612" stroke="#0a0612" strokeWidth="3" />
        <path className="l-rotor" d="M-40 -6 h80" stroke="#0a0612" strokeWidth="3" />
        <circle className="l-blink" cx="-24" cy="12" r="3" fill="#ff2b2b" />
        <circle className="l-blink l-blink--b" cx="10" cy="12" r="3" fill="#2b6bff" />
      </g>

      {/* skyline */}
      <g className="l-city" style={{ fill: 'var(--bld)' }}>
        {TOWERS.map(([x, w, h, top], i) => (
          <g key={i}>
            <rect x={x} y={628 - h} width={w} height={h} />
            {top === 'step' && <path d={`M${x + 10} ${628 - h} v-20 h${w - 20} v20 M${x + 22} ${608 - h} v-18 h${w - 44} v18`} />}
            {top === 'antenna' && (
              <>
                <rect x={x + w / 2 - 2} y={628 - h - 60} width="4" height="60" />
                <circle className="l-blink" cx={x + w / 2} cy={628 - h - 62} r="4" fill="#ff2b2b" />
              </>
            )}
            {top === 'tank' && <path d={`M${x + 12} ${628 - h} v-16 h24 v16 M${x + 10} ${612 - h} q14 -14 28 0z`} />}
            {top === 'spire' && (
              <>
                <path d={`M${x + 18} ${628 - h} L${x + w / 2} ${628 - h - 90} L${x + w - 18} ${628 - h}z`} />
                <circle className="l-blink" cx={x + w / 2} cy={628 - h - 92} r="4" fill="#ff2b2b" />
              </>
            )}
            {top === 'hotel' && <path d={`M${x + 25} ${628 - h} v-30 h${w - 50} v30 M${x + 50} ${598 - h} v-24 h${w - 100} v24`} />}
            {(top === 'spire' || top === 'step') && <rect x={x + w / 2 - 2} y={628 - h + 10} width="4" height={h - 30} fill={i % 2 ? '#00e5ff' : '#ff4f9a'} opacity=".55" className="l-neon" />}
          </g>
        ))}
        {[0, 1, 2, 3].map((k) => (
          <g key={k} className="l-fade" style={{ opacity: `var(--w${k})` }}>
            {WINDOWS.filter((w) => w[2] === k).map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="5" height="7" fill={i % 9 ? '#ffcf8a' : '#00f0ff'} className={i % 13 === 0 ? 'l-flicker' : undefined} />
            ))}
          </g>
        ))}

        {/* "Vyral" hotel neon */}
        <text x="1102" y="470" textAnchor="middle" className="l-neon" fontFamily="Grand Hotel, cursive" fontSize="34" fill="#ff5fb0" filter="url(#lneon)">
          Vyral
        </text>
        <rect x="1042" y="482" width="120" height="3" fill="#00f0ff" className="l-neon" />

        {billboards && (
          <>
            {/* 1 — Unlayer rooftop billboard (the framework powering the Edit Studio) */}
            <Ad href={unlayer('skyline-billboard')} ads={ads} label="Unlayer — the image editor powering VYRAL">
              <g className="l-billboard">
                <path d="M455 328 v-12 M515 328 v-12" stroke="#0b0b12" strokeWidth="6" />
                <rect x="390" y="208" width="200" height="108" rx="4" fill="#061e33" stroke="#3aa0ff" strokeWidth="3" filter="url(#lneon)" />
                <image href="/brand/unlayer-logo-white.webp" x="413" y="220" width="154" height="44" />
                <text x="490" y="283" textAnchor="middle" fontFamily="Bebas Neue, Anton, sans-serif" fontSize="18" fill="#fff" letterSpacing="1">
                  EDIT ANYTHING. EVEN YOUR PAST.
                </text>
                <text x="490" y="304" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10.5" fill="#7cc4ff">
                  React Image Editor · unlayer.com
                </text>
                <rect className="l-scan" x="390" y="208" width="10" height="108" fill="#fff" opacity=".18" />
              </g>
            </Ad>

            {/* 2 — creator billboard */}
            <Ad href={CREATOR} ads={ads} label="himanshu007-creator on GitHub">
              <g>
                <path d="M630 538 v-10 M690 538 v-10" stroke="#0b0b12" strokeWidth="5" />
                <rect x="596" y="456" width="128" height="74" rx="3" fill="#0d1117" stroke="#ffd23f" strokeWidth="2.5" filter="url(#lneon)" />
                <text x="660" y="479" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="16" fill="#ffd23f" letterSpacing="1">
                  BUILT BY
                </text>
                <text x="660" y="499" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="11" fill="#fff">
                  himanshu007-creator
                </text>
                <text x="660" y="518" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" fill="#8b949e">
                  needs sleep · github ↗
                </text>
              </g>
            </Ad>

            {/* 3 — R3SPAWN club: shoutout to the artist behind the stills */}
            <Ad href={ASSETS_BY} ads={ads} label="@r3spawnhere on Instagram">
              <g>
                <rect x="865" y="552" width="150" height="76" fill="transparent" />
                <rect x="873" y="560" width="134" height="30" rx="3" fill="#12061f" stroke="#ff2e88" strokeWidth="2" filter="url(#lneon)" />
                <text x="940" y="582" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="19" letterSpacing="4" fill="#ff5fb0" className="l-neon">
                  R3SPAWN
                </text>
                <text x="940" y="606" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" fill="#00f0ff" className="l-flicker">
                  @r3spawnhere · assets on the house
                </text>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <circle key={i} cx={885 + i * 22} cy="620" r="2.5" fill="#ffd23f" className="l-bulb" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </g>
            </Ad>
          </>
        )}
      </g>

      {/* sea */}
      <rect y="628" width="1600" height="272" fill="url(#lsea)" />
      <g className="l-reflect l-fade" style={{ opacity: 'var(--sun)' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={800 - (170 - i * 17)} y={646 + i * 26} width={(170 - i * 17) * 2} height="5" rx="3" style={{ fill: 'var(--u1)' }} opacity={0.7 - i * 0.08} />
        ))}
      </g>
      <g>
        <rect x="0" y="664" width="1600" height="8" fill="#0d0620" />
        {[...Array(16)].map((_, i) => (
          <rect key={i} x={i * 100 + 40} y="672" width="8" height="26" fill="#0d0620" />
        ))}
        <g className="l-cars">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} style={{ animationDelay: `${-i * 2.3}s` }} className="l-car">
              <circle cx="0" cy="666" r="2.4" fill="#fff6c8" />
              <circle cx="7" cy="666" r="2.4" fill="#fff6c8" />
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} style={{ animationDelay: `${-i * 2.9}s` }} className="l-car l-car--back">
              <circle cx="0" cy="669" r="2" fill="#ff3b30" />
              <circle cx="6" cy="669" r="2" fill="#ff3b30" />
            </g>
          ))}
        </g>
      </g>
      <g className="l-jetski">
        <path d="M0 0 h40 l10 -10 h-30 l-6 -10 h-10 z" fill="#0d0726" />
        <path d="M-80 2 Q -40 -4 0 2" stroke="#fff" strokeOpacity=".6" strokeWidth="3" fill="none" />
      </g>
      <path d="M0 820 Q 400 780 800 810 T 1600 800 V900 H0Z" fill="#12061f" />
      <Palm x={70} y={900} s={1.2} />
      <Palm x={210} y={915} s={0.85} flip delay={0.8} />
      <Palm x={1530} y={905} s={1.3} flip delay={0.4} />
      <Palm x={1400} y={920} s={0.8} delay={1.2} />
      <g className="l-birds" stroke="#1a0b2a" strokeWidth="3" fill="none">
        <path d="M0 0 q8 -8 16 0 q8 -8 16 0" />
        <path d="M40 18 q6 -6 12 0 q6 -6 12 0" />
      </g>
    </svg>
  );
}
