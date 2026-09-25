// Sound effects via Web Audio: every clip is fetched + decoded once, then plays instantly (and can overlap).
// Only a handful of real files exist; everything else maps onto them.
const FILES = ['notify', 'tap', 'shutter', 'passed', 'ring', 'typing', 'unlock'];
const ALIAS = {
  // micro-interactions → tap
  'screen-tap': 'tap', heart: 'tap', swipe: 'tap', siri: 'tap', flip: 'tap', pickup: 'tap', whoosh: 'tap',
  // camera
  'rec-start': 'shutter', 'rec-stop': 'shutter',
  // wins
  star: 'passed', cops: 'passed', 'burn-done': 'notify',
  // everything else that "happens" → notify
  send: 'notify', 'snap-sent': 'notify', 'low-battery': 'notify', intro: 'notify',
  'notify-reelgram': 'notify', 'notify-suschat': 'notify', 'notify-itext': 'notify', 'notify-icall': 'notify', 'notify-roll': 'notify', 'notify-system': 'notify',
};

let muted = localStorage.getItem('vyral:muted') === '1';
let ctx = null;
const buffers = {};

function context() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    FILES.forEach((n) =>
      fetch(`/sfx/${n}.mp3`)
        .then((r) => r.arrayBuffer())
        .then((b) => ctx.decodeAudioData(b))
        .then((buf) => (buffers[n] = buf))
        .catch(() => {}),
    );
  }
  return ctx;
}
// Browsers only allow audio after a user gesture — unlock (and start decoding) on the first one.
['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
  addEventListener(ev, () => context()?.state === 'suspended' && ctx.resume(), { passive: true }),
);
addEventListener('pointerdown', () => context(), { once: true, passive: true });

// Live Miami radio as the soundtrack (via radio-browser.info). Next station on error.
const STATIONS = [
  { name: 'MundoRadio', url: 'https://radio.mundoradio.fm/listen/mundoradio/radio.mp3' },
  { name: 'Miami Beach Radio', url: 'https://streaming.radiostreamlive.com/miamibeachradio_devices' },
  { name: 'Yacht Rock Miami', url: 'https://anchor.yachtrock.miami/listen/yacht_rock_miami/perignon.mp3' },
];
let radio = null;
let station = 0;
function tune() {
  radio.src = STATIONS[station].url; // fresh src = live edge, not stale buffer
  radio.play().catch(() => {
    // Autoplay blocked until the first gesture on this page.
    const go = () => !muted && radio.paused && radio.play().catch(() => {});
    ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, go, { once: true, passive: true }));
  });
}
export function startRadio() {
  if (radio) return;
  radio = new Audio();
  radio.volume = 0.35;
  radio.addEventListener('error', () => {
    if (++station < STATIONS.length && !muted) tune();
  });
  if (!muted) tune();
}
export const stationName = () => STATIONS[station]?.name;

const live = new Set(); // playing sfx sources, so mute can cut them (e.g. a ringing phone)
export const isMuted = () => muted;
export function setMuted(v) {
  muted = v;
  localStorage.setItem('vyral:muted', v ? '1' : '0');
  if (v) {
    radio?.pause();
    live.forEach((stop) => stop());
  } else if (radio) tune();
}

/** Play a sound. Returns a stop() function (used for the looping ringtone). */
export function play(name, volume = 0.6, { loop = false } = {}) {
  const key = FILES.includes(name) ? name : ALIAS[name];
  const c = context();
  if (muted || !key || !c) return () => {};
  const buf = buffers[key];
  if (!buf) return () => {};
  const src = c.createBufferSource();
  const g = c.createGain();
  g.gain.value = volume;
  src.buffer = buf;
  src.loop = loop;
  src.connect(g).connect(c.destination);
  src.start(0);
  const stop = () => {
    live.delete(stop);
    try {
      src.stop();
    } catch {
      /* already stopped */
    }
  };
  live.add(stop);
  src.onended = () => live.delete(stop);
  return stop;
}

export const buzz = (ms = 20) => navigator.vibrate?.(ms);
