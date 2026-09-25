// Small canvas helpers shared by camera, studio and share.
export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const toBlob = (dataUrl) => fetch(dataUrl).then((r) => r.blob());

export const fileToDataUrl = (file) =>
  new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });

// Watermark + share sheet (falls back to a download).
export async function shareImage(src, name = 'vyral') {
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const u = Math.min(c.width, c.height) / 1000;
  ctx.font = `600 ${18 * u}px Inter, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  const text = 'Shot on iFrute · VYRAL · #BuiltWithImageEditor';
  const tw = ctx.measureText(text).width;
  ctx.fillRect(c.width - tw - 34 * u, c.height - 48 * u, tw + 24 * u, 34 * u);
  ctx.fillStyle = '#fff';
  ctx.fillText(text, c.width - 22 * u, c.height - 24 * u);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
  const file = new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: 'Suffering, yet pretending. #OnlyInLeonida #BuiltWithImageEditor' });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return; // user closed the share sheet
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// Share a video (or any Blob) — share sheet if available, else download.
export async function shareFile(blob, name = 'vyral') {
  const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('webm') ? 'webm' : 'jpg';
  const file = new File([blob], `${name}.${ext}`, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: 'Suffering, yet pretending. #OnlyInLeonida #BuiltWithImageEditor' });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
