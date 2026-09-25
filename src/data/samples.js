// Self-contained SVG "photos" so the demo works with zero external image
// requests (and zero CORS taint on the editor's canvas export).
export const svg = (inner, w = 720, h = 1280) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`
  )}`;

export const SAMPLES = [
  {
    id: 'gator-pool',
    label: 'Gator in the pool again',
    src: svg(`
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff9f5a"/>
          <stop offset="0.5" stop-color="#ff5f8f"/>
          <stop offset="1" stop-color="#2b1750"/>
        </linearGradient>
      </defs>
      <rect width="720" height="1280" fill="url(#g1)"/>
      <ellipse cx="360" cy="980" rx="420" ry="160" fill="#1fb6c9" opacity="0.85"/>
      <ellipse cx="220" cy="960" rx="150" ry="34" fill="#2f5d34"/>
      <ellipse cx="120" cy="955" rx="40" ry="18" fill="#264b28"/>
      <circle cx="95" cy="948" r="6" fill="#fff"/>
      <circle cx="115" cy="948" r="6" fill="#fff"/>
      <rect x="0" y="1040" width="720" height="240" fill="#3a2a1a"/>
      <circle cx="600" cy="220" r="90" fill="#fff4c2"/>
    `),
  },
  {
    id: 'strip-mall',
    label: 'Strip mall at golden hour',
    src: svg(`
      <rect width="720" height="1280" fill="#3a1650"/>
      <rect width="720" height="500" fill="#ff8a3d"/>
      <rect x="0" y="500" width="720" height="780" fill="#1a1030"/>
      <rect x="60" y="560" width="600" height="220" fill="#241a3d" stroke="#00f0ff" stroke-width="4"/>
      <rect x="90" y="600" width="150" height="140" fill="#ff2e88" opacity="0.7"/>
      <rect x="280" y="600" width="150" height="140" fill="#00f0ff" opacity="0.5"/>
      <rect x="470" y="600" width="150" height="140" fill="#ffd23f" opacity="0.6"/>
      <circle cx="600" cy="260" r="110" fill="#ffe08a"/>
    `),
  },
  {
    id: 'boat',
    label: 'Repo\u2019d cigarette boat',
    src: svg(`
      <rect width="720" height="1280" fill="#0f2b4a"/>
      <rect y="820" width="720" height="460" fill="#123a63"/>
      <path d="M100 900 L620 900 L520 1040 L200 1040 Z" fill="#e8e2d6"/>
      <rect x="260" y="760" width="200" height="150" fill="#f4f0ff"/>
      <circle cx="580" cy="240" r="90" fill="#ffd23f"/>
      <path d="M0 900 Q180 860 360 900 T720 900 L720 1280 L0 1280 Z" fill="#0a2038" opacity="0.6"/>
    `),
  },
];

SAMPLES.push(
  {
    id: 'gas-station',
    label: 'Florida Man, 2:47 AM',
    src: svg(`
      <rect width="720" height="1280" fill="#0b0a1f"/>
      <rect y="760" width="720" height="520" fill="#1c1a2b"/>
      <rect x="40" y="300" width="640" height="90" fill="#ff2e88"/>
      <text x="360" y="365" font-family="Impact,sans-serif" font-size="64" fill="#fff" text-anchor="middle">GAS · BAIT · LOTTO</text>
      <rect x="60" y="390" width="600" height="30" fill="#ffd23f"/>
      <rect x="120" y="560" width="90" height="200" rx="10" fill="#e8e2d6"/><rect x="135" y="590" width="60" height="50" fill="#00f0ff"/>
      <rect x="510" y="560" width="90" height="200" rx="10" fill="#e8e2d6"/><rect x="525" y="590" width="60" height="50" fill="#00f0ff"/>
      <ellipse cx="360" cy="980" rx="160" ry="40" fill="#2f5d34"/><ellipse cx="220" cy="975" rx="55" ry="22" fill="#264b28"/>
      <circle cx="200" cy="962" r="7" fill="#ffd23f"/><circle cx="222" cy="962" r="7" fill="#ffd23f"/>
      <rect x="330" y="760" width="60" height="150" fill="#ff9f5a"/><circle cx="360" cy="730" r="40" fill="#c98b62"/>
      <rect x="318" y="715" width="84" height="16" fill="#111"/>
    `),
  },
  {
    id: 'yacht',
    label: "A yacht you'll never own",
    src: svg(`
      <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fb8ff"/><stop offset="1" stop-color="#bff1ff"/></linearGradient></defs>
      <rect width="720" height="1280" fill="url(#s)"/>
      <rect y="760" width="720" height="520" fill="#0f7fb5"/>
      <path d="M80 760 L640 760 L580 860 L150 860Z" fill="#fff"/>
      <rect x="200" y="660" width="330" height="100" fill="#f4f4f4"/><rect x="230" y="680" width="270" height="30" fill="#123a63"/>
      <rect x="290" y="600" width="170" height="60" fill="#fafafa"/>
      <text x="360" y="835" font-family="Georgia,serif" font-size="36" fill="#123a63" text-anchor="middle">NOT YOURS II</text>
      <circle cx="120" cy="180" r="80" fill="#fff8d0"/>
    `),
  },
  {
    id: 'club',
    label: 'VIP line (you are not VIP)',
    src: svg(`
      <rect width="720" height="1280" fill="#12051f"/>
      <text x="360" y="300" font-family="Brush Script MT,cursive" font-size="120" fill="none" stroke="#ff2e88" stroke-width="6" text-anchor="middle">Mango's</text>
      <text x="360" y="380" font-family="Arial" font-size="40" fill="#00f0ff" text-anchor="middle" letter-spacing="14">NIGHT CLUB</text>
      <rect x="0" y="820" width="720" height="460" fill="#1d0b33"/>
      ${[...Array(7)].map((_, i) => `<rect x="${60 + i * 90}" y="${640 - (i % 3) * 20}" width="60" height="${180 + (i % 3) * 20}" rx="28" fill="#${['ff2e88', '7b2ff7', '00f0ff'][i % 3]}" opacity=".75"/><circle cx="${90 + i * 90}" cy="${610 - (i % 3) * 20}" r="32" fill="#c98b62"/>`).join('')}
      <rect x="40" y="820" width="640" height="10" fill="#ffd23f"/>
    `),
  },
);


export const sample = (id) => SAMPLES.find((s) => s.id === id)?.src;
