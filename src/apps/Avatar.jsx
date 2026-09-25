import { NPCS, initials } from '../data/npc';

export default function Avatar({ id, size = 36, ring = false }) {
  const n = NPCS[id];
  const style = { width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${n?.color[0] || '#999'}, ${n?.color[1] || '#333'})` };
  return (
    <span className={`avatar ${ring ? 'avatar--ring' : ''}`} style={style}>
      {n?.photo ? <img src={n.photo} alt="" /> : n ? initials(id) : '?'}
    </span>
  );
}
