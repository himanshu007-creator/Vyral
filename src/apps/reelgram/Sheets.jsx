import { useState } from 'react';
import { useGame } from '../../game';
import { NPCS } from '../../data/npc';
import { ACCOUNTS } from '../../data/media';
import { shareFile, shareImage, toBlob } from '../../lib/image';
import { gameMinutes } from '../../lib/useGameClock';
import { play } from '../../lib/sfx';
import { Close } from '../../ui/icons';

const EMOJI = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'];
const ME = '/media/avatars/me.webp';
// Real avatar for a handle: NPC → parody account → generic silhouette.
export const avatarFor = (h) =>
  h === 'newinleonida'
    ? ME
    : Object.values(NPCS).find((n) => n.handle === h)?.photo || Object.values(ACCOUNTS).find((a) => a.handle === h)?.avatar || (h === 'aunt_linda' ? NPCS.linda.photo : '/media/avatars/unknown.webp');

function Sheet({ title, onClose, children, dark }) {
  return (
    <div className="rg-sheet-veil" onClick={onClose}>
      <div className={`rg-sheet ${dark ? 'rg-sheet--dark' : ''}`} onClick={(e) => e.stopPropagation()}>
        <i className="rg-sheet-grab" />
        <header>
          <b>{title}</b>
          <button onClick={onClose} aria-label="Close">
            <Close size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function CommentsSheet({ post, seed = [], onClose, dark }) {
  const { state, addComment } = useGame();
  const [text, setText] = useState('');
  const list = [...seed.map(([who, t]) => ({ who, text: t })), ...(state.comments[post.id] || [])];
  const send = (t) => {
    if (!t.trim()) return;
    addComment(post.id, t.trim());
    setText('');
    play('tap', 0.3);
  };
  return (
    <Sheet title="Comments" onClose={onClose} dark={dark}>
      <div className="rg-comments">
        {list.length === 0 && <p className="rg-dim rg-pad">No comments yet. Be the first to be wrong.</p>}
        {list.map((c, i) => (
          <div key={i} className={`rg-comment ${c.mine ? 'mine' : ''}`}>
            <img src={avatarFor(c.who)} alt="" />
            <p>
              <b>{c.who}</b> {c.text}
              <small>{i % 3 === 0 ? '2h' : `${4 + i}m`} · {3 + i * 7} likes · Reply</small>
            </p>
          </div>
        ))}
      </div>
      <div className="rg-emoji">
        {EMOJI.map((e) => (
          <button key={e} onClick={() => send(e)}>
            {e}
          </button>
        ))}
      </div>
      <form
        className="rg-comment-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <img src={ME} alt="" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment… (be mean, it’s free)" />
        <button disabled={!text.trim()}>Post</button>
      </form>
    </Sheet>
  );
}

export function ShareSheet({ post, image, blob, onClose, dark }) {
  const { addText, addMedia, push, alert } = useGame();
  const [sent, setSent] = useState({});
  const link = `${location.origin}/app?phone=up&app=reelgram&view=post&id=${post.id}`;
  const sendTo = (id) => {
    setSent((s) => ({ ...s, [id]: true }));
    addText(id, { from: 'me', text: '📎 shared a Reelgram post', image });
    play('send', 0.4);
    setTimeout(
      () =>
        push({
          app: 'itext', view: 'thread', target: id, kind: 'text', from: id,
          text: { mom: 'Who is this', dwayne: 'lmaooo', kayleigh: 'why are you sending me this', malone: 'Saved for the file. Thanks.', chad: 'mint it', linda: 'SLAY 💅' }[id] || 'ok',
          title: NPCS[id].name, avatar: NPCS[id].photo,
        }),
      4000,
    );
  };
  return (
    <Sheet title="Share" onClose={onClose} dark={dark}>
      <div className="rg-share-grid">
        {['mom', 'kayleigh', 'dwayne', 'malone', 'chad', 'linda'].map((id) => (
          <button key={id} onClick={() => sendTo(id)}>
            <img src={NPCS[id].photo} alt="" />
            <small>{NPCS[id].name.split(' ')[0]}</small>
            <em className={sent[id] ? 'sent' : ''}>{sent[id] ? 'Sent' : 'Send'}</em>
          </button>
        ))}
      </div>
      <div className="rg-share-actions">
        <button
          onClick={async () => {
            await addMedia({ app: 'suschat', blob: blob || (await toBlob(image)), story: true, to: ['story'], expiresAt: gameMinutes() + 1440, ...(blob ? { kind: 'video', poster: image } : {}) });
            onClose();
            alert({ title: 'Added to story', text: 'Posted to your SusChat story. Expires in 24 game hours. Your ex will see it in 24 seconds.' });
          }}
        >
          ⊕<small>Add to story</small>
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(link);
            alert({ title: 'Link copied', text: 'Deep link copied. Paste it anywhere to open this exact post in the phone.' });
          }}
        >
          🔗<small>Copy link</small>
        </button>
        <button onClick={() => (blob ? shareFile(blob, `reelgram-${post.id}`) : shareImage(image, `reelgram-${post.id}`))}>
          ⤴<small>Share to…</small>
        </button>
        <button onClick={() => (blob ? shareFile(blob, `reelgram-${post.id}`) : shareImage(image, `reelgram-${post.id}`))}>
          ⬇<small>Download</small>
        </button>
      </div>
    </Sheet>
  );
}
