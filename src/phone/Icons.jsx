// App logos, all original SVG. Sized by the parent (width/height 100%).

export function ReelgramLogo({ bg = true }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="rg-bg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ffcc4d" />
          <stop offset=".35" stopColor="#ff6a3d" />
          <stop offset=".65" stopColor="#ff2e88" />
          <stop offset="1" stopColor="#7b2ff7" />
        </linearGradient>
      </defs>
      {bg && <rect width="100" height="100" rx="22" fill="url(#rg-bg)" />}
      {/* camera body */}
      <rect x="18" y="18" width="64" height="64" rx="18" fill="none" stroke="#fff" strokeWidth="6" />
      <circle cx="69" cy="30" r="4" fill="#fff" />
      {/* lens = play button */}
      <circle cx="50" cy="52" r="17" fill="#fff" />
      <path d="M45 43 L59 52 L45 61 Z" fill="#ff2e88" />
      {/* infinite-scroll arrow wrapping the lens */}
      <path d="M26 58 A 25 25 0 1 0 38 30" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="4 3" />
      <path d="M33 25 L40 30 L33 35" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SusChatLogo({ bg = true, bubble = false, animated = false }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className={animated ? 'sus-anim' : ''} overflow="visible">
      {bg && <rect width="100" height="100" rx="22" fill="#fffc00" />}
      {/* phone hidden behind its back */}
      <g transform="rotate(18 74 70)">
        <rect x="66" y="52" width="16" height="26" rx="3" fill="#222" />
        <rect x="68" y="55" width="12" height="18" rx="1" fill="#4fc3ff" />
      </g>
      {/* ghost */}
      <path
        d="M28 80 V44 C28 26 38 17 50 17 C62 17 72 26 72 44 V80 L66 74 L60 80 L55 74 L50 80 L45 74 L40 80 L34 74 Z"
        fill="#fff" stroke="#111" strokeWidth="3.5" strokeLinejoin="round"
      />
      {/* arm reaching behind */}
      <path d="M70 58 Q 78 62 76 66" fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />
      {/* shifty eyes */}
      <ellipse cx="42" cy="42" rx="6" ry="4.5" fill="#fff" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="58" cy="42" rx="6" ry="4.5" fill="#fff" stroke="#111" strokeWidth="2.5" />
      <g className="sus-pupils">
        <circle cx="45" cy="42.5" r="2.4" fill="#111" />
        <circle cx="61" cy="42.5" r="2.4" fill="#111" />
      </g>
      <path d="M37 35 L47 37 M53 37 L63 35" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M45 54 Q 50 52 56 55" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      {/* "message deleted" bubble */}
      <g className="sus-bubble">
        <path d="M6 10 h32 a5 5 0 0 1 5 5 v8 a5 5 0 0 1 -5 5 h-20 l-6 5 v-5 h-6 a5 5 0 0 1 -5 -5 v-8 a5 5 0 0 1 5 -5z" fill="#fff" stroke="#111" strokeWidth="2" />
        {bubble ? (
          <text x="22" y="22" fontSize="4.6" fontFamily="Inter, sans-serif" textAnchor="middle" fill="#888" fontStyle="italic">
            message deleted
          </text>
        ) : (
          <path d="M9 19 h26" stroke="#aaa" strokeWidth="2" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
}

export function ICallLogo() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="ic-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ef07a" />
          <stop offset="1" stopColor="#1f9e2a" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#ic-bg)" />
      <path
        d="M34 24 c4 -2 7 0 9 4 l5 10 c1 3 0 6 -3 8 l-4 3 c3 7 9 13 16 16 l3 -4 c2 -3 5 -4 8 -3 l10 5 c4 2 6 5 4 9 c-3 7 -9 10 -16 8 c-17 -5 -31 -19 -36 -36 c-2 -7 1 -13 4 -20z"
        fill="#fff"
      />
      <circle cx="78" cy="24" r="11" fill="#ff3b30" stroke="#fff" strokeWidth="3" />
      <path d="M74 20 l8 8 M82 20 l-8 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ITextLogo() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="it-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ef07a" />
          <stop offset="1" stopColor="#1f9e2a" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#it-bg)" />
      <path d="M50 22 C 28 22 16 34 16 48 C 16 57 21 64 30 69 L 26 80 L 40 73 C 43 74 47 74 50 74 C 72 74 84 62 84 48 C 84 34 72 22 50 22 Z" fill="#fff" />
      <g className="typing-dots">
        <circle cx="37" cy="48" r="5" fill="#1f9e2a" />
        <circle cx="50" cy="48" r="5" fill="#1f9e2a" />
        <circle cx="63" cy="48" r="5" fill="#1f9e2a" />
      </g>
    </svg>
  );
}

export function FruitRollLogo() {
  const colors = ['#ffcc00', '#ff9500', '#ff3b30', '#ff2d92', '#af52de', '#5856d6', '#34aadc', '#4cd964'];
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="22" fill="#fdfbf5" />
      {colors.map((c, i) => (
        <path
          key={c}
          transform={`rotate(${i * 45} 50 50)`}
          d="M50 50 C 44 38 44 22 50 14 C 58 22 60 38 50 50Z"
          fill={c}
          opacity=".9"
        />
      ))}
      <circle cx="50" cy="50" r="5" fill="#fff" />
    </svg>
  );
}

// iFrute brand mark: a mango with a bite and a price tag.
export function MangoLogo({ size = 60 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs>
        <linearGradient id="mango" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe066" />
          <stop offset=".6" stopColor="#ff9f1c" />
          <stop offset="1" stopColor="#ff4f5a" />
        </linearGradient>
        <mask id="mango-bite">
          <rect width="100" height="100" fill="#fff" />
          <circle cx="84" cy="50" r="10" fill="#000" />
        </mask>
      </defs>
      <path mask="url(#mango-bite)" d="M52 24 C 30 22 16 42 20 62 C 24 82 46 92 64 84 C 82 76 86 56 80 42 C 76 32 66 25 52 24 Z" fill="url(#mango)" />
      <path d="M52 24 C 54 14 60 8 70 6 C 68 16 62 22 52 24 Z" fill="#4cd964" />
      <path d="M40 30 L 30 12" stroke="#ddd" strokeWidth="1.5" />
      <rect x="18" y="4" width="18" height="11" rx="2" transform="rotate(-20 27 10)" fill="#fff" />
      <text x="27" y="12.5" fontSize="6" textAnchor="middle" transform="rotate(-20 27 10)" fontFamily="Inter" fontWeight="800" fill="#111">$1299</text>
    </svg>
  );
}
