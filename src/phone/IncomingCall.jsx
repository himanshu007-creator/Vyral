import { useEffect, useState } from 'react';
import { useGame } from '../game';
import { NPCS } from '../data/npc';
import { play, buzz } from '../lib/sfx';

const SCRIPTS = {
  mom: ['Hi sweetie!', 'I saw your post.', 'Who is that man.', 'Also are you eating?', 'Love you. Call me back. You won’t.'],
  malone: ['This is Detective Malone.', 'Love the content.', 'Quick question about the timestamp on your last post…', 'Don’t leave Leonida.'],
  dwayne: ['yo', 'so about that $40', 'actually make it $60', 'gators got expenses'],
  unknown: ['…', '[heavy breathing]', 'nice filter.', '[a gator hisses. the line goes dead]'],
  pruitt: ['Pruitt Properties.', 'Rent was due Tuesday.', 'Also stop posting my ATV.'],
};

export default function IncomingCall() {
  const { ringing, setRinging, push } = useGame();
  const [live, setLive] = useState(0); // 0 ringing, >0 = lines shown
  const who = ringing?.who;

  useEffect(() => {
    if (!who || live) return;
    const stop = play('ring', 0.7, { loop: true });
    const id = setInterval(() => buzz([200, 100, 200]), 1600);
    return () => {
      stop();
      clearInterval(id);
    };
  }, [who, live]);

  useEffect(() => {
    if (!live || !who) return;
    const lines = SCRIPTS[who] || SCRIPTS.unknown;
    if (live > lines.length) {
      const t = setTimeout(() => {
        setLive(0);
        setRinging(null);
      }, 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLive((l) => l + 1), 1500);
    return () => clearTimeout(t);
  }, [live, who, setRinging]);

  if (!who) return null;
  const npc = NPCS[who];
  const lines = SCRIPTS[who] || SCRIPTS.unknown;
  const decline = () => {
    setRinging(null);
    setLive(0);
    push({ app: 'icall', view: 'detail', target: who, kind: 'call', who, title: 'Missed Call', text: npc.name, avatar: npc.photo, silent: true });
    setTimeout(
      () => push({ app: 'itext', view: 'thread', target: who, kind: 'text', from: who, text: who === 'mom' ? 'Did you just decline me??' : 'u declined me. noted.', title: npc.name, avatar: npc.photo }),
      3500,
    );
  };

  return (
    <div className="call-takeover">
      <img className="call-bg" src={npc.photo} alt="" />
      <div className="call-top">
        <b>{npc.name}</b>
        <span>{live ? `${String(Math.floor(live * 1.5)).padStart(2, '0')}:00 — call in progress` : 'Leonida mobile · calling…'}</span>
      </div>
      <img className="call-face" src={npc.photo} alt="" />
      {live ? (
        <div className="call-lines">
          {lines.slice(0, live).map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      ) : (
        <p className="call-quip">{who === 'malone' ? 'Declining a detective looks great, by the way.' : 'You can’t ignore this forever.'}</p>
      )}
      <div className="call-btns">
        <button className="decline" onClick={decline}>
          Decline
        </button>
        {!live && (
          <button className="answer" onClick={() => setLive(1)}>
            Answer
          </button>
        )}
      </div>
    </div>
  );
}
