// Laptop-only hands. Drawn in "phone units" (the phone is a known rect inside each viewBox) and
// layered BEHIND the phone, so only the thumb pad and fingertips wrapping the edges show —
// the display is never covered. Landscape: two hands, thumbs resting on the end bezels (front layer).

function SkinDefs({ id }) {
  return (
    <defs>
      <linearGradient id={`${id}-f`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9c6443" />
        <stop offset=".35" stopColor="#d49a72" />
        <stop offset=".7" stopColor="#e7b38e" />
        <stop offset="1" stopColor="#b57a55" />
      </linearGradient>
      <linearGradient id={`${id}-fv`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b57a55" />
        <stop offset=".4" stopColor="#e2ad88" />
        <stop offset="1" stopColor="#a86e4a" />
      </linearGradient>
      <radialGradient id={`${id}-p`} cx=".45" cy=".35" r=".75">
        <stop offset="0" stopColor="#e9b893" />
        <stop offset=".6" stopColor="#cf946b" />
        <stop offset="1" stopColor="#9a6242" />
      </radialGradient>
      <linearGradient id={`${id}-nail`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6dccb" />
        <stop offset="1" stopColor="#e6b9a0" />
      </linearGradient>
      <linearGradient id={`${id}-sleeve`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#140c22" />
        <stop offset=".5" stopColor="#2c1d44" />
        <stop offset="1" stopColor="#140c22" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
  );
}

// A fingertip curling around a vertical phone edge (seen from the front: pad + knuckle crease).
const Tip = ({ x, y, w = 30, h = 36, flip = false, id }) => (
  <g transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}`}>
    <path d={`M0 0 H${w - h / 2} A${h / 2} ${h / 2} 0 0 1 ${w - h / 2} ${h} H0 Z`} fill={`url(#${id}-fv)`} />
    <path d={`M${w * 0.42} 4 Q${w * 0.36} ${h / 2} ${w * 0.42} ${h - 4}`} stroke="#8e5a3c" strokeWidth="1.3" fill="none" opacity=".55" />
    <path d={`M${w - h / 2 - 2} 5 A${h / 2 - 5} ${h / 2 - 5} 0 0 1 ${w - 6} ${h / 2}`} stroke="#fff" strokeOpacity=".22" strokeWidth="2" fill="none" />
  </g>
);

/* Portrait: phone occupies x 60–240 (=S), bottom at y 300 in a 300×400 box. */
export function Hand() {
  const id = 'hp';
  return (
    <>
      <svg className="hand hand--portrait hand--back" viewBox="0 0 300 400" aria-hidden="true">
        <SkinDefs id={id} />
        {/* sleeve + wrist */}
        <path d="M78 400 L96 338 Q150 326 206 338 L224 400Z" fill={`url(#${id}-sleeve)`} />
        <path d="M92 346 Q150 334 210 346" stroke="#ff2e88" strokeWidth="7" fill="none" opacity=".9" />
        <path d="M100 340 Q104 300 120 292 L186 292 Q200 300 204 340 Q150 330 100 340Z" fill={`url(#${id}-p)`} />
        {/* palm behind the phone (edges peek out) */}
        <path d="M58 322 Q38 290 40 238 Q42 196 60 170 L240 170 Q262 214 260 268 Q258 312 232 330 Q150 352 58 322Z" fill={`url(#${id}-p)`} />
        {/* thenar pad + thumb peeking along the left edge */}
        <path d="M48 262 Q30 214 38 160 Q42 128 58 124 Q70 124 68 146 Q62 196 66 250Z" fill={`url(#${id}-f)`} />
        <path d="M44 214 Q52 206 62 212" stroke="#8e5a3c" strokeWidth="1.4" fill="none" opacity=".5" />
        {/* four fingertips wrapping the right edge */}
        {[128, 166, 204, 242].map((y, i) => (
          <Tip key={y} x={234} y={y} w={30 - i * 2} h={34 - i * 2} id={id} />
        ))}
        <ellipse cx="150" cy="300" rx="100" ry="10" fill="#000" opacity=".25" filter={`url(#${id}-soft)`} />
      </svg>
    </>
  );
}

/* Landscape: phone occupies x 100–600 (=L), y 20–270 in a 700×360 box. Thumbs sit on the end bezels (x 100–150, 550–600). */
export function Hands() {
  const id = 'hl';
  const side = (flip) => (
    <g transform={flip ? 'translate(700 0) scale(-1 1)' : undefined}>
      <path d="M34 360 L46 300 Q90 286 136 300 L146 360Z" fill={`url(#${id}-sleeve)`} />
      <path d="M44 306 Q92 294 140 306" stroke="#ff2e88" strokeWidth="6" fill="none" opacity=".9" />
      <path d="M60 300 Q52 240 74 196 Q92 162 120 150 L170 150 L170 290 Q120 312 60 300Z" fill={`url(#${id}-p)`} />
      {/* index + middle fingertips over the top edge */}
      <g transform="translate(118 2) rotate(90 0 0)">
        <Tip x={0} y={-30} w={30} h={28} id={id} />
      </g>
      <g transform="translate(150 4) rotate(90 0 0)">
        <Tip x={0} y={-30} w={28} h={26} id={id} />
      </g>
    </g>
  );
  const thumb = (flip, gid = `${id}f`) => (
    <g transform={flip ? 'translate(700 0) scale(-1 1)' : undefined}>
      <path d="M86 262 Q96 226 112 206 Q124 192 136 196 Q146 204 140 220 Q128 244 118 270Z" fill={`url(#${gid}-f)`} />
      <path d="M118 202 Q128 194 137 199 Q141 207 136 214 Q126 210 118 202Z" fill={`url(#${gid}-nail)`} opacity=".95" />
      <path d="M104 238 Q112 232 122 238" stroke="#8e5a3c" strokeWidth="1.3" fill="none" opacity=".5" />
    </g>
  );
  return (
    <>
      <svg className="hand hand--landscape hand--back" viewBox="0 0 700 360" aria-hidden="true">
        <SkinDefs id={id} />
        {side(false)}
        {side(true)}
      </svg>
      <svg className="hand hand--landscape hand--front" viewBox="0 0 700 360" aria-hidden="true">
        <SkinDefs id={`${id}f`} />
        {thumb(false)}
        {thumb(true)}
      </svg>
    </>
  );
}

export function TapFinger() {
  return (
    <div className="tap-finger" aria-hidden="true">
      <svg viewBox="0 0 80 220">
        <defs>
          <linearGradient id="tf" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a86e4a" />
            <stop offset=".45" stopColor="#e2ad88" />
            <stop offset="1" stopColor="#b57a55" />
          </linearGradient>
        </defs>
        <path d="M18 220 L16 62 Q16 18 40 16 Q64 18 64 62 L66 220Z" fill="url(#tf)" />
        <path d="M26 42 Q40 26 54 42 L54 62 Q40 56 26 62Z" fill="#f4d9c7" opacity=".9" />
        <path d="M22 112 q18 7 36 0 M22 150 q18 7 36 0" stroke="#8e5a3c" strokeWidth="1.6" fill="none" opacity=".45" />
      </svg>
    </div>
  );
}
