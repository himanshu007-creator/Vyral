import Leonida from '../scene/Leonida';

// Brand-free wallpaper with a savage caption baked in, like every 2013 lock screen.
const LINES = {
  lock: ['DIABOLICAL.', 'unhinged behaviour, respectfully'],
  home: ['NO THOUGHTS', 'just clout'],
};

export default function Wallpaper({ variant = 'lock' }) {
  const [big, small] = LINES[variant];
  return (
    <div className={`wallpaper wallpaper--parallax wallpaper--${variant}`}>
      <Leonida billboards={false} />
      <div className="wall-text">
        <b>{big}</b>
        <small>{small}</small>
      </div>
    </div>
  );
}
