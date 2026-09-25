import { MangoLogo } from './Icons';

// The back of the iFrute: Frute's "Hexa-Cam™" — six lenses in a hexagon ring, zero good angles.
const LENSES = [0, 60, 120, 180, 240, 300].map((a) => {
  const r = (a * Math.PI) / 180;
  return [50 + 30 * Math.cos(r), 50 + 30 * Math.sin(r)];
});
const LABELS = ['ULTRA WIDE', 'ULTRA NARROW', 'SELFIE (BACK)', 'MUGSHOT', 'NIGHT (DAY)', 'DECORATIVE'];

export default function PhoneBack() {
  return (
    <div className="phone-back" aria-hidden="true">
      <div className="pb-cams">
        <svg viewBox="0 0 100 100">
          <rect x="4" y="4" width="92" height="92" rx="26" className="pb-bump" />
          {LENSES.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="13" className="pb-ring" />
              <circle cx={x} cy={y} r="9" className="pb-glass" />
              <circle cx={x - 3} cy={y - 3} r="2.4" fill="#fff" opacity=".55" />
            </g>
          ))}
          <circle cx="50" cy="50" r="6" className="pb-flash" />
        </svg>
        <span className="pb-lidar">LiDAR · Lies Detection And Ranging</span>
      </div>
      <div className="pb-logo">
        <MangoLogo size={86} />
        <b>iFrute</b>
        <small>Pro Max Ultra Plus Air</small>
      </div>
      <ul className="pb-specs">
        {LABELS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p className="pb-fine">
        Designed by Frute in Leonida. Assembled by Cousin Dwayne.
        <br />
        Model A1299 · FCC ID: SUS-420 · 6 cameras, 0 good angles
      </p>
    </div>
  );
}
