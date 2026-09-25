import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import { useGame } from '../game';
import { CALLS, NPCS, VOICEMAILS } from '../data/npc';
import './apps.css';

function Calling({ id, onEnd }) {
  const [vm, setVm] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVm(true), 2400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="calling">
      <Avatar id={id} size={110} />
      <b>{NPCS[id].name}</b>
      <span>{vm ? 'Voicemail' : 'calling…'}</span>
      {vm && <p className="calling-vm">“{VOICEMAILS[id]}”</p>}
      <button className="calling-end" onClick={onEnd}>
        End
      </button>
    </div>
  );
}

export default function ICall({ q, nav, home }) {
  const { alert, state, clock } = useGame();
  const [tab, setTab] = useState('all');
  const [calling, setCalling] = useState(false);

  if (q.view === 'detail' && NPCS[q.id]) {
    const id = q.id;
    if (calling) return <Calling id={id} onEnd={() => setCalling(false)} />;
    return (
      <div className="ios-app">
        <div className="ios-nav">
          <button className="back" onClick={() => nav({ view: null, id: null })}>
            Recents
          </button>
          Info
        </div>
        <div className="ios-list call-detail">
          <div className="call-card">
            <Avatar id={id} size={72} />
            <span>
              <b>{NPCS[id].name}</b>
              <small>mobile · Leonida</small>
            </span>
          </div>
          {CALLS.filter((c) => c.who === id).map((c, i) => (
            <p key={i} className="call-note">
              {c.when} — {c.type}
              {c.count ? ` (${c.count})` : ''}
              {c.note ? ` · ${c.note}` : ''}
            </p>
          ))}
          <div className="call-btns">
            <button onClick={() => setCalling(true)}>📞 Call</button>
            <button onClick={() => alert({ title: 'FaceTime', text: 'FaceTime unavailable. Have you seen your face right now?', buttons: [{ label: 'Rude' }] })}>🎥 FaceTime</button>
            <button onClick={() => nav({ app: 'itext', view: 'thread', id })}>💬 Message</button>
          </div>
        </div>
      </div>
    );
  }

  const live = (state.calls || []).map((c) => ({ ...c, when: c.at > clock.total - 60 ? `${Math.max(1, clock.total - c.at)}m ago` : 'Earlier' }));
  const rows = [...live, ...CALLS].filter((c) => tab === 'all' || c.type === 'missed');
  return (
    <div className="ios-app">
      <div className="ios-nav">
        <button className="back" onClick={home}>
          Home
        </button>
        <span className="seg">
          <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>
            All
          </button>
          <button className={tab === 'missed' ? 'on' : ''} onClick={() => setTab('missed')}>
            Missed
          </button>
        </span>
      </div>
      <div className="ios-list">
        {rows.map((c, i) => (
          <button key={i} className="ios-row" onClick={() => nav({ view: 'detail', id: c.who })}>
            <Avatar id={c.who} size={36} />
            <span className="ios-row-body">
              <b className={c.type === 'missed' ? 'missed' : ''}>
                {NPCS[c.who].name}
                {c.count ? ` (${c.count})` : ''}
              </b>
              <small>{c.type === 'outgoing' ? '↗ outgoing' : c.type === 'missed' ? '✕ missed' : '↙ incoming'} · {c.note || 'mobile'}</small>
            </span>
            <small className="when">{c.when}</small>
            <span className="info">ⓘ</span>
          </button>
        ))}
      </div>
    </div>
  );
}
