import { useEffect, useState } from 'react';

// GTA time: 1 in-game minute = 2 real seconds. The epoch persists so story
// expiry ("24 game hours") survives reloads. Starts the world at Fri 21:00.
const REAL_MS_PER_GAME_MIN = 2000;
const START = 5 * 1440 + 21 * 60; // Friday 21:00 (day 0 = Sunday)
const epoch = Number(localStorage.getItem('vyral:epoch')) || Date.now();
localStorage.setItem('vyral:epoch', String(epoch));

export const gameMinutes = () => START + Math.floor((Date.now() - epoch) / REAL_MS_PER_GAME_MIN);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function describe(total) {
  const day = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  const date = new Date(2026, 10, 15 + day); // week of Nov 19 2026, naturally
  return {
    total,
    h,
    m,
    hhmm: `${h % 12 || 12}:${String(m).padStart(2, '0')}`,
    ampm: h < 12 ? 'AM' : 'PM',
    day: DAYS[day % 7],
    date: `${DAYS[day % 7]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`,
  };
}

export default function useGameClock() {
  const [t, setT] = useState(gameMinutes);
  useEffect(() => {
    const id = setInterval(() => setT(gameMinutes()), 500);
    return () => clearInterval(id);
  }, []);
  return describe(t);
}

export function ago(minutes) {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} game min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} game hr ago`;
  return `${Math.floor(minutes / 1440)} game days ago`;
}
