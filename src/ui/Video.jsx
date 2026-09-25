import { useEffect } from 'react';
import useInView from '../lib/useInView';

// Lazy looping clip. Nothing is fetched until it's visible (or `active`), and it pauses when it isn't.
// `muted` is set on the element directly — iOS refuses autoplay otherwise.
export default function Video({ src, poster, className = '', threshold = 0.6, active }) {
  const [ref, inView] = useInView(threshold);
  const on = active ?? inView;
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.setAttribute('muted', '');
    if (on) {
      if (v.getAttribute('src') !== src) v.setAttribute('src', src);
      v.play().catch(() => {});
    } else v.pause();
  }, [on, src, ref]);
  return <video ref={ref} className={className} poster={poster} muted loop playsInline preload="none" />;
}
