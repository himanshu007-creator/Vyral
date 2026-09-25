import { CHARGES, HEADLINES, ROASTS, WASTED } from '../data/roasts';

// Lens = a CSS/canvas filter for the video + a painter that draws the overlay.
// The same painter draws the live preview and gets baked into the capture, so
// what the editor receives is already a piece of Leonida.

const pick = (list, seed) => list[Math.abs(seed) % list.length];

function fit(ctx, text, maxW, size, family, weight = '') {
  let s = size;
  do ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && (s -= 1) > 6);
  return s;
}

function stroked(ctx, text, x, y, fill, stroke, lw) {
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

export const LENSES = [
  { id: 'none', name: 'No Lens', icon: '○', filter: 'none', draw() {} },
  {
    id: 'mugshot',
    name: 'Mugshot',
    icon: '🚔',
    filter: 'contrast(1.1) saturate(.75) brightness(1.06)',
    draw(ctx, w, h, seed) {
      const u = Math.min(w, h) / 100;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = ctx.fillStyle = '#fff';
      ctx.lineWidth = u * 0.3;
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= 12; i++) {
        const y = h * 0.06 + (i * h * 0.6) / 12;
        const len = i % 2 ? 0.06 : 0.11;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w * len, y);
        ctx.moveTo(w, y);
        ctx.lineTo(w * (1 - len), y);
        ctx.stroke();
        if (i % 2 === 0) {
          const inches = 84 - i * 3;
          ctx.font = `${u * 3}px Anton`;
          ctx.textAlign = 'left';
          ctx.fillText(`${Math.floor(inches / 12)}'${inches % 12}"`, w * 0.12, y);
          ctx.textAlign = 'right';
          ctx.fillText(`${Math.floor(inches / 12)}'${inches % 12}"`, w * 0.88, y);
        }
      }
      ctx.restore();
      // placard
      const pw = Math.min(w * 0.7, u * 90);
      const ph = u * 26;
      const px = (w - pw) / 2;
      const py = h - ph - u * 6;
      ctx.fillStyle = '#111';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = u * 0.6;
      ctx.strokeRect(px + u, py + u, pw - 2 * u, ph - 2 * u);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      fit(ctx, 'LEONIDA CO. SHERIFF', pw * 0.85, u * 5, 'Anton');
      ctx.fillText('LEONIDA CO. SHERIFF', w / 2, py + u * 7.5);
      ctx.font = `${u * 5.5}px VT323`;
      ctx.fillText(`BOOKING # ${100000 + ((seed * 7919) % 900000)}`, w / 2, py + u * 13.5);
      const charge = `CHARGE: ${pick(CHARGES, seed)}`;
      fit(ctx, charge, pw * 0.9, u * 4, 'Anton');
      ctx.fillStyle = '#ffd23f';
      ctx.fillText(charge, w / 2, py + u * 19);
      ctx.fillStyle = '#aaa';
      ctx.font = `${u * 3}px VT323`;
      ctx.fillText('11 · 19 · 26   VICE CITY PD', w / 2, py + u * 23.2);
    },
  },
  {
    id: 'breaking',
    name: 'Breaking',
    icon: '📺',
    filter: 'contrast(1.05) saturate(1.1)',
    draw(ctx, w, h, seed) {
      const u = Math.min(w, h) / 100;
      // station bug
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.fillRect(u * 4, u * 4, u * 30, u * 9);
      ctx.fillStyle = '#e11d2a';
      ctx.beginPath();
      ctx.arc(u * 8, u * 8.5, u * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${u * 5.5}px Anton`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('WVCN 6 LIVE', u * 11, u * 8.8);
      // lower third
      const y = h - u * 30;
      ctx.fillStyle = '#e11d2a';
      ctx.fillRect(0, y, w * 0.55, u * 8);
      ctx.fillStyle = '#fff';
      fit(ctx, 'BREAKING NEWS', w * 0.5, u * 5.5, 'Anton');
      ctx.fillText('BREAKING NEWS', u * 3, y + u * 4.2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, y + u * 8, w, u * 12);
      ctx.fillStyle = '#0b1640';
      const hl = pick(HEADLINES, seed);
      fit(ctx, hl, w - u * 6, u * 6.5, 'Anton');
      ctx.fillText(hl, u * 3, y + u * 14.2);
      // ticker
      ctx.fillStyle = '#0b1640';
      ctx.fillRect(0, y + u * 20, w, u * 7);
      ctx.fillStyle = '#ffd23f';
      ctx.font = `${u * 3.6}px 'Bebas Neue'`;
      ctx.fillText('VICE CITY 92°F · HUMIDITY 400% · $GATOR ▼97% · FLORIDA MAN STILL AT LARGE · RENT ▲ AGAIN', u * 3, y + u * 23.6);
    },
  },
  {
    id: 'wanted',
    name: 'Most Wanted',
    icon: '🤠',
    filter: 'sepia(.85) contrast(1.15) brightness(.95)',
    draw(ctx, w, h, seed) {
      const u = Math.min(w, h) / 100;
      const paper = '#ecd9ad';
      const b = u * 5;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, w, b);
      ctx.fillRect(0, 0, b, h);
      ctx.fillRect(w - b, 0, b, h);
      ctx.fillRect(0, h - b, w, b);
      const top = h * 0.2;
      const bot = h * 0.22;
      ctx.fillRect(0, 0, w, top);
      ctx.fillRect(0, h - bot, w, bot);
      ctx.strokeStyle = '#5a3a1a';
      ctx.lineWidth = u * 0.8;
      ctx.strokeRect(b, top, w - 2 * b, h - top - bot);
      ctx.fillStyle = '#3b2412';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      fit(ctx, 'WANTED', w * 0.8, top * 0.62, 'Rye');
      ctx.fillText('WANTED', w / 2, top * 0.66);
      fit(ctx, 'DEAD OR ALIVE (PREFERABLY ONLINE)', w * 0.84, u * 4, 'Rye');
      ctx.fillText('DEAD OR ALIVE (PREFERABLY ONLINE)', w / 2, top * 0.9);
      fit(ctx, 'REWARD: $3.50 + A DENNY’S COUPON', w * 0.84, u * 5.5, 'Rye');
      ctx.fillText('REWARD: $3.50 + A DENNY’S COUPON', w / 2, h - bot + bot * 0.38);
      const f = `FOR: ${pick(CHARGES, seed)}`;
      fit(ctx, f, w * 0.84, u * 4, 'Rye');
      ctx.fillText(f, w / 2, h - bot + bot * 0.7);
    },
  },
  {
    id: 'cover',
    name: 'Cover Art',
    icon: '🎮',
    filter: 'contrast(1.25) saturate(1.35)',
    draw(ctx, w, h, seed) {
      const u = Math.min(w, h) / 100;
      const b = u * 3;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = b * 2;
      ctx.strokeRect(0, 0, w, h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = u * 0.5;
      ctx.strokeRect(b + u, b + u, w - 2 * (b + u), h - 2 * (b + u));
      const label = pick(['THE MAIN CHARACTER', 'THE INFLUENCER', 'FLORIDA MAN', 'THE HUSTLER', 'THE EX'], seed);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const s = fit(ctx, label, w * 0.8, u * 9, 'Anton');
      stroked(ctx, label, b + u * 3, b + u * 3, '#fff', '#000', s * 0.18);
      // logo tile
      const t = u * 24;
      const x = w - t - b - u * 3;
      const y = h - t - b - u * 3;
      const g = ctx.createLinearGradient(x, y, x + t, y + t);
      g.addColorStop(0, '#ffb36b');
      g.addColorStop(0.5, '#ff4f9a');
      g.addColorStop(1, '#7b2ff7');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, t, t);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = `${t * 0.42}px Anton`;
      ctx.fillText('VY', x + t / 2, y + t * 0.06);
      ctx.fillText('RAL', x + t / 2, y + t * 0.5);
    },
  },
  {
    id: 'wasted',
    name: 'Delusional',
    icon: '💀',
    filter: 'grayscale(1) contrast(1.2) brightness(.72)',
    draw(ctx, w, h, seed) {
      const u = Math.min(w, h) / 100;
      const cy = h * 0.5;
      const g = ctx.createLinearGradient(0, cy - u * 14, 0, cy + u * 14);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.3, 'rgba(0,0,0,.75)');
      g.addColorStop(0.7, 'rgba(0,0,0,.75)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, cy - u * 14, w, u * 28);
      const word = pick(WASTED, seed);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const s = fit(ctx, word, w * 0.86, u * 17, "Pricedown, Anton");
      stroked(ctx, word, w / 2, cy, '#c8262e', '#000', s * 0.12);
      ctx.fillStyle = '#ddd';
      ctx.font = `italic ${u * 3.4}px Inter`;
      ctx.fillText('respawning at mom’s house…', w / 2, cy + u * 11);
    },
  },
  {
    id: 'suffering',
    name: 'Suffering',
    icon: '✨',
    filter: 'saturate(1.35) sepia(.22) brightness(1.08) contrast(.95)',
    blend: 'screen',
    grade(ctx, w, h) {
      let g = ctx.createRadialGradient(w, 0, 0, w, 0, Math.max(w, h) * 0.7);
      g.addColorStop(0, 'rgba(255,170,80,.75)');
      g.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      g = ctx.createRadialGradient(0, h, 0, 0, h, Math.max(w, h) * 0.6);
      g.addColorStop(0, 'rgba(255,60,150,.55)');
      g.addColorStop(1, 'rgba(255,60,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    draw(ctx, w, h, seed) {
      const u = Math.min(w, h) / 100;
      const line = pick(ROASTS, seed);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const s = fit(ctx, line, w * 0.88, u * 10, "'Grand Hotel'");
      ctx.shadowColor = 'rgba(0,0,0,.6)';
      ctx.shadowBlur = u * 2;
      ctx.fillStyle = '#fff';
      ctx.fillText(line, w / 2, h - u * 9);
      ctx.shadowBlur = 0;
      ctx.font = `${s * 0.6}px serif`;
      ctx.fillText('✨', w * 0.12, h * 0.14);
      ctx.fillText('✨', w * 0.86, h * 0.3);
    },
  },
  {
    id: 'vice86',
    name: "Vice '86",
    icon: '📼',
    filter: 'saturate(1.7) hue-rotate(-18deg) contrast(1.12)',
    blend: 'soft-light',
    grade(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#ff2e88');
      g.addColorStop(1, '#00e5ff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    draw(ctx, w, h) {
      const u = Math.min(w, h) / 100;
      ctx.fillStyle = 'rgba(0,0,0,.14)';
      for (let y = 0; y < h; y += Math.max(2, u * 0.7)) ctx.fillRect(0, y, w, Math.max(1, u * 0.25));
      ctx.font = `${u * 7}px VT323`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = u;
      ctx.fillText('PLAY ▶', u * 5, u * 5);
      ctx.fillStyle = '#ff3b30';
      ctx.fillText('● REC', w - u * 25, u * 5);
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('NOV. 19 1986', u * 5, h - u * 5);
      ctx.textAlign = 'right';
      ctx.fillText('SP 0:04:20', w - u * 5, h - u * 5);
      ctx.shadowBlur = 0;
    },
  },
];

export const fontsReady = Promise.all(
  ['40px Anton', '40px Rye', '40px VT323', '40px "Grand Hotel"', '40px "Bebas Neue"', '40px Pricedown'].map((f) =>
    document.fonts.load(f).catch(() => {}),
  ),
);

// Crop `source` to the viewfinder aspect, apply the lens filter, paint the lens. Returns a JPEG data URL.
// Reelgram filters: pure colour grades (CSS filter + a blended tint) — deliberately unlike SusChat's lenses.
export const GRAM_FILTERS = [
  { id: 'normal', name: 'Normal', css: 'none' },
  { id: 'cloutendon', name: 'Clout-endon', css: 'contrast(1.15) saturate(1.35) brightness(1.05)', tint: ['#7fd3ff', 'soft-light', 0.35] },
  { id: 'junodebt', name: 'Juno Debt', css: 'saturate(1.4) contrast(1.1) hue-rotate(-8deg)', tint: ['#ff9d4d', 'overlay', 0.2] },
  { id: 'vicelencia', name: 'Vice-lencia', css: 'sepia(.25) saturate(1.3) brightness(1.08) contrast(.95)', tint: ['#ff5fa2', 'soft-light', 0.4] },
  { id: 'larceny', name: 'Larceny', css: 'brightness(1.12) contrast(.9) saturate(.85)', tint: ['#e8f3ff', 'screen', 0.14] },
  { id: 'gangham', name: 'Gang-ham', css: 'brightness(1.05) contrast(.85) saturate(.6) sepia(.15)', tint: ['#f0e6d0', 'multiply', 0.18] },
  { id: 'lawsuit', name: 'Lawsuit', css: 'contrast(1.2) saturate(.8)', tint: ['#2a1a40', 'soft-light', 0.35] },
  { id: 'perpetua', name: 'Perp-etua', css: 'saturate(1.2) hue-rotate(12deg) brightness(1.04)', tint: ['#00e5c0', 'soft-light', 0.3] },
  { id: 'hurricane', name: 'Hurricane Karen', css: 'contrast(1.3) saturate(1.5) hue-rotate(-20deg)', tint: ['#7b2ff7', 'soft-light', 0.35] },
  { id: 'court', name: 'Moon (Court)', css: 'grayscale(1) contrast(1.15) brightness(1.05)' },
];

export async function bake(source, sw, sh, { aspect, mirror = false, lens, seed, filter }) {
  await fontsReady;
  const long = 1440;
  const W = aspect >= 1 ? long : Math.round(long * aspect);
  const H = aspect >= 1 ? Math.round(long / aspect) : long;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const scale = Math.max(W / sw, H / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.save();
  // ponytail: ctx.filter is a no-op in Safari, so lens colour grading is skipped there (overlay still bakes).
  ctx.filter = filter ? filter.css : lens.filter;
  if (mirror) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.restore();
  const tint = filter?.tint;
  if (tint) {
    ctx.save();
    ctx.globalCompositeOperation = tint[1];
    ctx.globalAlpha = tint[2];
    ctx.fillStyle = tint[0];
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (lens) {
    if (lens.grade) {
      ctx.save();
      ctx.globalCompositeOperation = lens.blend;
      lens.grade(ctx, W, H, seed);
      ctx.restore();
    }
    lens.draw(ctx, W, H, seed);
  }
  return c.toDataURL('image/jpeg', 0.92);
}
