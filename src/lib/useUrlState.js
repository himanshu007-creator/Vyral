import { useSyncExternalStore } from 'react';

// The URL is the source of truth for "where am I on the phone". Browser back = phone back.
const EVT = 'vyral:url';
const subscribe = (cb) => {
  addEventListener('popstate', cb);
  addEventListener(EVT, cb);
  return () => {
    removeEventListener('popstate', cb);
    removeEventListener(EVT, cb);
  };
};

export function nav(patch, { replace = false, reset = false } = {}) {
  const p = new URLSearchParams(reset ? '' : location.search);
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === '') p.delete(k);
    else p.set(k, v);
  }
  const qs = p.toString();
  const url = location.pathname + (qs ? `?${qs}` : '');
  if (url === location.pathname + location.search) return;
  history[replace ? 'replaceState' : 'pushState'](null, '', url);
  dispatchEvent(new Event(EVT));
}

export default function useUrlState() {
  const search = useSyncExternalStore(subscribe, () => location.search);
  return [Object.fromEntries(new URLSearchParams(search)), nav];
}
