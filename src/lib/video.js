import { fontsReady } from '../camera/lenses';

// 5-second clips, fully in the browser: every frame is composited on a canvas
// (camera/file → filter/lens → Unlayer overlay) and captured with MediaRecorder.
export const CLIP_SECONDS = 5;

export const pickMime = () =>
  ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) =>
    window.MediaRecorder?.isTypeSupported?.(m),
  ) || '';

export const canRecord = () => !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && pickMime());

/**
 * The "transparent" canvas Unlayer edits when you decorate a video. Every pixel carries alpha 1/255 —
 * invisible, but it lets the Studio find exactly where Unlayer drew the image (see Studio.jsx).
 */
export const MARKER_ALPHA = 1;
export function blankPng(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgba(0,0,0,${MARKER_ALPHA / 255})`;
  ctx.fillRect(0, 0, w, h);
  return c.toDataURL('image/png');
}

/** Load a video Blob/URL into a muted, inline, ready-to-play element. */
export function videoFrom(src) {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = typeof src === 'string' ? src : URL.createObjectURL(src);
    v.onloadeddata = () => resolve(v);
    setTimeout(() => (v.readyState >= 2 ? resolve(v) : null), 3000);
    v.onerror = () => reject(new Error('Could not read that video'));
  });
}

export async function recordClip(source, { aspect, mirror = false, lens = null, seed = 0, filter = null, overlay = null, seconds = CLIP_SECONDS, fromStart = false, onProgress }) {
  await fontsReady;
  const sw = source.videoWidth;
  const sh = source.videoHeight;
  const a = aspect || sw / sh;
  const long = 960;
  const W = a >= 1 ? long : Math.round(long * a);
  const H = a >= 1 ? Math.round(long / a) : long;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const scale = Math.max(W / sw, H / sh);
  const css = filter ? filter.css : lens?.filter || 'none';

  const draw = () => {
    ctx.save();
    ctx.filter = css;
    if (mirror) {
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(source, (W - sw * scale) / 2, (H - sh * scale) / 2, sw * scale, sh * scale);
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
    if (overlay) ctx.drawImage(overlay, 0, 0, W, H);
  };

  if (fromStart) {
    source.currentTime = 0;
    // Don't wait forever: some browsers defer play() (background tabs, power saving).
    await Promise.race([source.play().catch(() => {}), new Promise((r) => setTimeout(r, 1200))]);
  }
  draw();
  const poster = c.toDataURL('image/jpeg', 0.82);
  const mime = pickMime();
  const stream = c.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
  const chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise((r) => (rec.onstop = r));
  rec.start(250);
  const t0 = performance.now();
  await new Promise((done) => {
    const tick = () => {
      draw();
      const el = (performance.now() - t0) / 1000;
      onProgress?.(Math.min(1, el / seconds));
      if (el >= seconds || (fromStart && source.ended)) return done();
      setTimeout(tick, 1000 / 30); // timer, not rAF: keeps rendering even if the tab loses focus
    };
    tick();
  });
  rec.stop();
  await stopped;
  stream.getTracks().forEach((t) => t.stop());
  if (fromStart) source.pause();
  return { blob: new Blob(chunks, { type: mime.split(';')[0] }), poster, w: W, h: H };
}

/** Burn an Unlayer overlay (transparent PNG) into an existing clip. */
export async function burnOverlay(clipBlob, overlayUrl, onProgress) {
  const v = await videoFrom(clipBlob);
  const img = new Image();
  img.src = overlayUrl;
  await img.decode();
  const seconds = Number.isFinite(v.duration) && v.duration > 0 ? Math.min(CLIP_SECONDS, v.duration) : CLIP_SECONDS;
  return recordClip(v, { overlay: img, seconds, fromStart: true, onProgress });
}
