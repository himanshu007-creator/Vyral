import { useEffect, useRef, useState } from 'react';
import { play } from '../lib/sfx';

// "Leonida Support" — definitely a real human, definitely not a scam, only knows one answer.
const SCRIPT = [
  'hi 👋 this is Tony from Leonida Support (not a bot)',
  'have u tried installing',
  'the app. install the app',
  'i can see ur IP is 127.0.0.1 😳',
  'install now or the gator gets it 🐊',
  'my manager says if u install i get a sandwich',
  'ok i installed it for u. jk. u have to press the button',
];
const QUICK = ['Install', 'Install now', 'Install (enthusiastically)', 'Is this a scam?'];

export default function Support({ onInstall }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const step = useRef(0);
  const endRef = useRef(null);
  const [nudge, setNudge] = useState(false);

  const tonySays = (t, delay = 1100) => {
    setTyping(true);
    play('typing', 0.3);
    setTimeout(() => {
      setTyping(false);
      play('notify', 0.4);
      setMsgs((m) => [...m, { from: 'tony', text: t }]);
    }, delay);
  };

  useEffect(() => {
    const t = setTimeout(() => setNudge(true), 6000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!open || msgs.length) return;
    tonySays(SCRIPT[0], 700);
    const t = setTimeout(() => tonySays(SCRIPT[1]), 2000);
    step.current = 2;
    return () => clearTimeout(t);
  }, [open, msgs.length]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [msgs, typing]);

  const reply = (t) => {
    if (!t.trim()) return;
    setMsgs((m) => [...m, { from: 'me', text: t }]);
    setText('');
    if (/install/i.test(t)) {
      tonySays('omg yes. installing… 🙏', 800);
      setTimeout(onInstall, 1900);
      return;
    }
    tonySays(/scam/i.test(t) ? 'lol no. install now' : SCRIPT[Math.min(step.current++, SCRIPT.length - 1)] || 'install now');
  };

  return (
    <div className={`sup ${open ? 'sup--open' : ''}`}>
      {open && (
        <div className="sup-panel">
          <header>
            <img src="/media/avatars/dwayne.webp" alt="" />
            <span>
              <b>Leonida Support 🟢</b>
              <small>Tony · definitely not a scam · replies instantly (suspicious)</small>
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </header>
          <div className="sup-msgs">
            {msgs.map((m, i) => (
              <p key={i} className={m.from}>
                {m.text}
              </p>
            ))}
            {typing && (
              <p className="tony sup-typing">
                <i />
                <i />
                <i />
              </p>
            )}
            <div ref={endRef} />
          </div>
          <div className="sup-quick">
            {QUICK.map((q) => (
              <button key={q} onClick={() => reply(q)}>
                {q}
              </button>
            ))}
          </div>
          <form
            className="sup-input"
            onSubmit={(e) => {
              e.preventDefault();
              reply(text);
            }}
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type anything (the answer is install)" />
            <button>➤</button>
          </form>
          <small className="sup-fine">Fake support widget. No human, no install, no data collected. Tony isn’t real. Neither is the sandwich.</small>
        </div>
      )}
      <button
        className="sup-fab"
        onClick={() => {
          setOpen((o) => !o);
          setNudge(false);
        }}
        aria-label="Support chat"
      >
        {open ? '✕' : '💬'}
        {nudge && !open && <span className="sup-nudge">psst… install now 👀</span>}
        {!open && <i className="sup-badge">1</i>}
      </button>
    </div>
  );
}
