// Line icons (Instagram/Snap-ish), stroke = currentColor. 24px grid.
const I = ({ children, size = 24, fill = 'none', sw = 1.9, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);

export const Heart = ({ on, ...p }) => (
  <I {...p} fill={on ? '#ff3040' : 'none'} stroke={on ? '#ff3040' : 'currentColor'}>
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.5 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
  </I>
);
export const Comment = (p) => (
  <I {...p}>
    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20l1.1-4.2A8.5 8.5 0 1 1 20.5 11.5z" />
  </I>
);
export const Send = (p) => (
  <I {...p}>
    <path d="M21.5 3 10 14.5M21.5 3 14.8 21l-3.3-7.5L3.5 10z" />
  </I>
);
export const Bookmark = ({ on, ...p }) => (
  <I {...p} fill={on ? 'currentColor' : 'none'}>
    <path d="M18.5 21 12 15.5 5.5 21V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1z" />
  </I>
);
export const Home = ({ on, ...p }) => (
  <I {...p} fill={on ? 'currentColor' : 'none'}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </I>
);
export const Search = (p) => (
  <I {...p}>
    <circle cx="10.5" cy="10.5" r="7" />
    <path d="m20.5 20.5-4.9-4.9" />
  </I>
);
export const Reels = ({ on, ...p }) => (
  <I {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" fill={on ? 'currentColor' : 'none'} />
    <path d="M3 8.5h18M8.5 3l3 5.5M14.5 3l3 5.5" stroke={on ? '#000' : 'currentColor'} />
    <path d="m10 12 5 3-5 3z" fill={on ? '#000' : 'currentColor'} stroke="none" />
  </I>
);
export const Plus = (p) => (
  <I {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M12 8v8M8 12h8" />
  </I>
);
export const Dots = (p) => (
  <I {...p} fill="currentColor" stroke="none">
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </I>
);
export const Back = (p) => (
  <I {...p}>
    <path d="M15 4 7 12l8 8" />
  </I>
);
export const Close = (p) => (
  <I {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </I>
);
export const Flash = ({ on, ...p }) => (
  <I {...p} fill={on ? 'currentColor' : 'none'}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </I>
);
export const Flip = (p) => (
  <I {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5" />
  </I>
);
export const Moon = (p) => (
  <I {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
  </I>
);
export const Chat = (p) => (
  <I {...p}>
    <path d="M4 5h16v11H9l-5 4z" />
  </I>
);
export const Pin = (p) => (
  <I {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </I>
);
export const People = (p) => (
  <I {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2" />
  </I>
);
export const Play = (p) => (
  <I {...p}>
    <path d="M7 4.5v15l12-7.5z" />
  </I>
);
export const Camera = (p) => (
  <I {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h2.5L9 4h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="13" r="4" />
  </I>
);
export const Verified = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ verticalAlign: '-2px' }}>
    <path fill="#0095f6" d="M12 1.5l2.6 1.9 3.2-.2 1 3 2.7 1.8-1 3 1 3-2.7 1.8-1 3-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3-2.7-1.8 1-3-1-3 2.7-1.8 1-3 3.2.2z" />
    <path d="m7.8 12.2 2.8 2.8 5.6-5.6" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
