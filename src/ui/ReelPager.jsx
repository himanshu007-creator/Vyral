import { useRef, useState } from 'react';
import { play } from '../lib/sfx';

const mod = (n, m) => ((n % m) + m) % m;

/**
 * TikTok-style pager: infinite in both directions (loops the list), renders only the
 * previous/current/next slide so memory stays flat, and only the current one is `active`.
 */
export default function ReelPager({ items, start = 0, render, onChange, className = '' }) {
  const [idx, setIdx] = useState(start);
  const idxRef = useRef(start);
  const [dy, setDy] = useState(0);
  const [anim, setAnim] = useState(false);
  const box = useRef(null);
  const drag = useRef(null);
  const busy = useRef(false);

  const go = (dir) => {
    if (busy.current || !items.length) return;
    busy.current = true;
    play('swipe', 0.25);
    setAnim(true);
    setDy(-dir * box.current.clientHeight);
    setTimeout(() => {
      setAnim(false);
      setDy(0);
      idxRef.current += dir;
      setIdx(idxRef.current);
      onChange?.(idxRef.current);
      busy.current = false;
    }, 280);
  };

  if (!items.length) return null;
  return (
    <div
      ref={box}
      className={`reel-pager ${className}`}
      onWheel={(e) => Math.abs(e.deltaY) > 25 && go(e.deltaY > 0 ? 1 : -1)}
      onPointerDown={(e) => {
        drag.current = e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => drag.current != null && !busy.current && setDy(e.clientY - drag.current)}
      onPointerUp={(e) => {
        if (drag.current == null) return;
        const d = e.clientY - drag.current;
        drag.current = null;
        if (Math.abs(d) > box.current.clientHeight * 0.15) go(d < 0 ? 1 : -1);
        else {
          setAnim(true);
          setDy(0);
          setTimeout(() => setAnim(false), 250);
        }
      }}
      onKeyDown={(e) => (e.key === 'j' ? go(1) : e.key === 'k' && go(-1))}
      tabIndex={0}
    >
      {[-1, 0, 1].map((o) => {
        const item = items[mod(idx + o, items.length)];
        return (
          <section key={idx + o} className="reel-slide" style={{ transform: `translateY(calc(${o * 100}% + ${dy}px))`, transition: anim ? 'transform .28s ease-out' : 'none' }}>
            {render(item, o === 0)}
          </section>
        );
      })}
    </div>
  );
}
