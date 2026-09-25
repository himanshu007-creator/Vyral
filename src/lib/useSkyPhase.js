import { useEffect, useState } from 'react';

// Visual time-of-day: one phase per real minute, shared by every Leonida on screen.
export const PHASES = ['dawn', 'day', 'sunset', 'night'];
const now = () => PHASES[Math.floor(Date.now() / 60000) % PHASES.length];

export default function useSkyPhase() {
  const [phase, setPhase] = useState(now);
  useEffect(() => {
    const id = setInterval(() => setPhase(now()), 2000);
    return () => clearInterval(id);
  }, []);
  return phase;
}
