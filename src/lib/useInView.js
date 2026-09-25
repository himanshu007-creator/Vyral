import { useEffect, useRef, useState } from 'react';

// true while the element is (mostly) on screen — used to play only the visible video.
export default function useInView(threshold = 0.6) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}
