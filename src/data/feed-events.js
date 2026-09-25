import { NPCS } from './npc';
import { ACCOUNTS, POSTS, SNAP_POOL } from './media';

// The "faker": every ambient notification is a real event with a side effect and a deep link.
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const uid = () => Math.random().toString(36).slice(2, 10);

const LIKERS = ['aunt_linda', 'kayleigh.heals', 'dwayne.flips.cars', 'chad.eth', 'vcpd_malone', 'mudbog_mikey', 'withdrawal.bryce', 'vicebeach.cam', 'a_gator_probably', 'your_landlord'];
const USER_COMMENTS = [
  'who is paying for this',
  'the lighting is doing SO much work',
  'this you in the Herald mugshot section?',
  'ratio + humid',
  'mom come pick me up I’m scared',
  'finally, content',
  'bro posted a W2 and called it a vibe',
  'I’m calling Det. Malone',
  'not the Leonida filter 💀',
  'suffering yet pretending. relatable',
  'edit this again but make it a crime',
];
export const TEXT_LINES = {
  mom: ['Are you wearing sunscreen', 'Pastor Ron liked your post. Explain', 'Call me back sweetie', 'Your cousin Dwayne says you owe him $40??'],
  dwayne: ['u up', 'need $40 for gas', 'got a business idea (gators)', 'dont answer if its the cops'],
  kayleigh: ['saw ur story', 'i wasn’t looking btw', 'hope ur healing', 'who is she'],
  malone: ['We should talk. Casually. At the station.', 'Nice post. Very… timestamped.', 'Don’t leave Leonida.'],
  chad: ['$GATOR to the moon 🚀', 'bro we are SO early', 'can u venmo me 0.02 ETH'],
  linda: ['Liked ur post!!! 💅', 'Want to join my business opportunity?? 💰', 'Live Laugh Leonida!!!'],
  unknown: ['I can see you.', 'Nice phone. 12% battery? Brave.', 'You better answer this.'],
  pruitt: ['Rent is due.', 'The pool gator is NOT a tenant.', 'Stop posting my ATV.'],
};
const SYSTEM = [
  ['⚠️ Weather Alert', 'Hurricane Karen approaching Vice City. She wants to speak to the manager.'],
  ['⚠️ Time to BeFake', '2 minutes to pretend you’re doing something interesting.'],
  ['iFrute Update', 'FruteOS 6.0.1 fixes a bug where you felt okay.'],
  ['Screen Time', 'Your screen time is up 312% this week. Proud of you.'],
  ['Frute Pay', 'Your card was declined at Waffle House. Again.'],
];

export function ambient(ctx) {
  const { myPosts } = ctx;
  const roll = Math.random();
  if (roll < 0.28 && myPosts.length) return gramBurstEvent(myPosts[0]);
  if (roll < 0.42) {
    const p = pick(POSTS);
    return { app: 'reelgram', view: 'feed', kind: 'gram', title: 'Reelgram', text: `${ACCOUNTS[p.acct].handle} posted: “${p.caption.slice(0, 48)}…”`, avatar: ACCOUNTS[p.acct].avatar };
  }
  if (roll < 0.62) {
    const s = pick(SNAP_POOL);
    const id = uid();
    return { app: 'suschat', view: 'viewer', target: id, kind: 'snap', snap: { id, ...s }, title: NPCS[s.from].name, text: 'sent you a Snap 🟥', avatar: NPCS[s.from].photo };
  }
  if (roll < 0.82) {
    const who = pick(Object.keys(TEXT_LINES));
    const text = pick(TEXT_LINES[who]);
    return { app: 'itext', view: 'thread', target: who, kind: 'text', from: who, text, title: NPCS[who].name, avatar: NPCS[who].photo };
  }
  if (roll < 0.9) {
    const who = pick(['mom', 'dwayne', 'pruitt', 'unknown', 'malone']);
    return { app: 'icall', view: 'detail', target: who, kind: 'call', who, title: 'Missed Call', text: NPCS[who].name, avatar: NPCS[who].photo };
  }
  const [title, text] = pick(SYSTEM);
  return { app: null, kind: 'system', title, text };
}

// After you post: likes / follows / real comments on *your* post.
export function gramBurstEvent(post) {
  const r = Math.random();
  const who = pick(LIKERS);
  if (r < 0.4) return { app: 'reelgram', view: 'post', target: post.id, kind: 'like', title: 'Reelgram', text: `${who} and ${2 + Math.floor(Math.random() * 90)} others liked your post ❤️` };
  if (r < 0.75) {
    const text = pick(USER_COMMENTS);
    return { app: 'reelgram', view: 'post', target: post.id, kind: 'comment', who, comment: text, title: 'Reelgram', text: `${who} commented: ${text}` };
  }
  return { app: 'reelgram', view: 'activity', kind: 'follow', title: 'Reelgram', text: `${who} started following you. (they want something)` };
}

// Initial unread notifications (what's waiting when you first pick the phone up).
export const SEED = [
  { app: 'icall', view: 'detail', target: 'mom', kind: 'call', title: 'MOM', text: '3 missed calls', avatar: NPCS.mom.photo, silent: true },
  { app: 'itext', view: 'thread', target: 'unknown', kind: 'seed', title: 'Unknown Number', text: 'You better answer this.', avatar: NPCS.unknown.photo },
  { app: 'suschat', view: 'chats', kind: 'seed', title: 'SusChat', text: '3 new snaps (all from people who owe you money)' },
  { app: 'reelgram', view: 'activity', kind: 'seed', title: 'Reelgram', text: 'someone viewed your profile 41 times (it was Kayleigh)' },
  { app: 'itext', view: 'thread', target: 'mom', kind: 'seed', title: 'Brenda (Mom)', text: 'Can you fix this pic of me for the church group 🙏', avatar: NPCS.mom.photo },
];
