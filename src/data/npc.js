import { sample } from './samples';

const av = (id) => `/media/avatars/${id}.webp`;

// Original cast. No Rockstar characters — just the people every Leonida resident has in their phone.
export const NPCS = {
  mom: { name: 'Brenda (Mom)', handle: 'blessed_brenda_62', color: ['#ff9fc9', '#a26bff'], photo: av('mom') },
  unknown: { name: 'Unknown Number', handle: 'unknown', color: ['#333', '#000'], photo: av('unknown') },
  malone: { name: 'Det. Malone', handle: 'vcpd_malone', color: ['#1c2b4a', '#4d6a9a'], photo: av('malone') },
  dwayne: { name: 'Cousin Dwayne', handle: 'dwayne.flips.cars', color: ['#ffd23f', '#ff5f8f'], photo: av('dwayne') },
  kayleigh: { name: 'Kayleigh 🚫', handle: 'kayleigh.heals', color: ['#ff9f5a', '#ff2e88'], photo: av('kayleigh') },
  linda: { name: 'Aunt Linda', handle: 'linda_lives_laughs', color: ['#40e0d0', '#ff7f50'], photo: av('linda') },
  chad: { name: 'Crypto Chad', handle: 'chad.eth', color: ['#00f0a0', '#0b7a5a'], photo: av('chad') },
  pruitt: { name: 'Mr. Pruitt (Landlord)', handle: 'pruitt_properties', color: ['#b0a18a', '#5b4a36'], photo: av('pruitt') },
};

export const initials = (id) =>
  NPCS[id].name
    .replace(/\(.*\)|[^\w\s.]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

// ---------- iCall ----------
export const CALLS = [
  { who: 'mom', type: 'missed', when: '9:41 PM', count: 3 },
  { who: 'unknown', type: 'missed', when: '9:12 PM' },
  { who: 'pruitt', type: 'missed', when: '8:00 PM', note: 'Rent reminder (automated) (angry)' },
  { who: 'dwayne', type: 'incoming', when: '6:17 PM', note: '2 sec — "u up? need $40"' },
  { who: 'malone', type: 'missed', when: 'Yesterday', note: 'Left no voicemail. Suspicious.' },
  { who: 'kayleigh', type: 'outgoing', when: 'Yesterday', note: '1:58 AM. We don’t talk about it.' },
  { who: 'chad', type: 'incoming', when: 'Tuesday', note: '47 min about a coin called $GATOR' },
  { who: 'linda', type: 'incoming', when: 'Monday', note: 'Butt dial. 38 minutes of Zumba.' },
];

export const VOICEMAILS = {
  mom: 'Hi sweetie it’s Mom. If this is about money, no. Call me. Love you. Also no.',
  unknown: '[heavy breathing] …you know what you did. [a gator hisses]',
  pruitt: 'This is Pruitt Properties. Rent is late. The pool gator is not our responsibility.',
  dwayne: 'Yo it’s Dwayne leave a message. Unless it’s the cops. Then I’m not Dwayne.',
  malone: 'This mailbox belongs to the Vice City PD. Please hold. Forever.',
  kayleigh: 'The number you have dialed has blocked you. Healing is not linear.',
  chad: 'GM. Can’t talk, market’s pumping. It’s not. Leave a message.',
  linda: 'You’ve reached Linda!!! Live Laugh Leonida!!! 💅🌴',
};

// ---------- iText ----------
// Threads: base messages + messages unlocked by progress. `request` = a photo they want you to edit.
export const THREADS = {
  mom: {
    base: [
      { from: 'mom', text: 'Are you eating' },
      { from: 'mom', text: 'Call me back' },
      { from: 'mom', text: 'Can you fix this pic of me for the church group 🙏 make it look nice, Pastor Ron is in the group', request: av('mom') },
    ],
    onEdited: 'why is there a police sign on me. I love it. sending to Pastor Ron',
  },
  linda: {
    base: [
      { from: 'linda', text: 'Hiiii it’s Aunt Linda!!! 💅' },
      { from: 'linda', text: 'Make me look like a BOSS for my LinkedOut. I’m a CEO now (of my own Etsy)', request: av('linda') },
    ],
    onEdited: 'OMG YES. 47 people liked it. 46 are from my MLM. SLAY',
  },
  dwayne: {
    base: [
      { from: 'dwayne', text: 'u up' },
      { from: 'dwayne', text: 'need $40 for gas' },
      { from: 'me', text: 'you don’t have a car' },
      { from: 'dwayne', text: 'exactly thats why its urgent' },
    ],
  },
  unknown: {
    base: [{ from: 'unknown', text: 'You better answer this.' }, { from: 'unknown', text: 'I saw what you posted.' }],
  },
  kayleigh: {
    base: [
      { from: 'me', text: 'hey' },
      { from: 'me', text: 'hey' },
      { from: 'me', text: 'u up' },
    ],
    receipt: 'Read 3:12 AM',
  },
  malone: { base: [] },
  chad: {
    base: [
      { from: 'chad', text: 'bro $GATOR just 10x’d' },
      { from: 'chad', text: 'nvm it rugged' },
      { from: 'chad', text: 'we’re so early' },
    ],
  },
};

// Progress unlocks → new texts (+ push banner).
export const UNLOCK_TEXTS = {
  firstPost: [
    { thread: 'mom', text: 'saw ur post. who is that man with you' },
    { thread: 'dwayne', text: 'yo ur famous now?? lend me 40' },
  ],
  firstSnap: [{ thread: 'kayleigh', text: 'why did u send me a mugshot of yourself at 3am. don’t answer that' }],
  star2: [{ thread: 'chad', text: 'bro ur engagement is pumping harder than $GATOR ever did. collab?' }],
  star3: [
    { thread: 'malone', text: 'Nice post. Quick question — is that the same car from the 7-Eleven thing?' },
    { thread: 'unknown', text: 'Everyone’s watching now. Smile.' },
  ],
  star5: [{ thread: 'malone', text: 'VCPD has been notified of your engagement. Please remain viral.' }],
};

// ---------- Reelgram ----------
export const GRAM_POSTS = [
  {
    id: 'g1', who: 'dwayne', image: sample('gas-station'), loc: 'Gas · Bait · Lotto, Grassrivers',
    caption: 'met a local legend tonight. he said the gator is "emotional support" 🐊 #OnlyInLeonida',
    likes: 48213, comments: ['ratio', 'is that your uncle', 'the gator has more followers than you'],
  },
  {
    id: 'g2', who: 'linda', image: sample('yacht'), loc: 'Vice City Marina',
    caption: 'Manifesting ✨🛥️ (not my boat) (the owner asked me to leave) #Blessed',
    likes: 1204, comments: ['Linda get off the boat', 'security has entered the chat', 'queen of trespassing'],
  },
  {
    id: 'g3', who: 'chad', image: sample('club'), loc: "Mango's, Vice Beach",
    caption: 'bottle service with the boys 🍾 (the boys: me) (the bottle: tap water) #WAGMI',
    likes: 312, comments: ['who is paying for this', 'bro is in the line not the club', 'NGMI'],
  },
  {
    id: 'g4', who: 'kayleigh', image: sample('strip-mall'), loc: 'Leonida Keys',
    caption: 'healing era 🌅 protecting my peace 🧘‍♀️ (posted 11 times today)',
    likes: 9120, comments: ['who hurt you', 'this is about me isn’t it', 'peace? at a strip mall?'],
  },
  {
    id: 'g5', who: 'pruitt', image: sample('gator-pool'), loc: 'Pruitt Properties Unit 4B',
    caption: 'Pool is OPEN 🏊 (gator is a feature, not a bug) Units available!',
    likes: 88, comments: ['sir that is a crime', 'my deposit??', 'the gator pays more rent than me'],
  },
];

export const GRAM_COMMENTS = [
  'this you in the Vice City Herald mugshot section?',
  'bro posted a W2 and called it a vibe',
  'suffering, yet pretending. relatable',
  'ratio + L + humid',
  'mom come pick me up I’m scared',
  'the lighting is doing SO much work',
  'not the Leonida filter 💀',
  'I’m calling Det. Malone',
  'finally, content',
  'who asked (me, I asked, post more)',
];

export const REELS = [
  { who: 'dwayne', image: sample('gas-station'), text: 'POV: you asked the gator guy for directions', audio: '♫ original audio — some Florida man' },
  { who: 'linda', image: sample('yacht'), text: '5 signs you’re the main character (#3 will get you arrested)', audio: '♫ Vice FM — Sunset Drive (sped up)' },
  { who: 'chad', image: sample('club'), text: 'how I made $4M in crypto (I did not)', audio: '♫ motivational speech over sad piano' },
  { who: 'kayleigh', image: sample('strip-mall'), text: 'a day in my life as a healing girlie 🌸 (it’s 3 minutes of me crying in a Kia)', audio: '♫ acoustic cover of a breakup' },
  { who: 'pruitt', image: sample('gator-pool'), text: 'HOUSE TOUR 🏠 (the gator stays)', audio: '♫ luxury real estate music (royalty free)' },
];

export const STORIES = ['kayleigh', 'dwayne', 'linda', 'chad', 'mom', 'pruitt'];

// ---------- SusChat ----------
export const SUS_FRIENDS = [
  { id: 'kayleigh', streak: 211, status: 'Opened 3 hrs ago (did not reply)' },
  { id: 'dwayne', streak: 48, status: 'New Snap', snap: { image: sample('gas-station'), caption: 'my new business partner 🐊' } },
  { id: 'unknown', streak: 0, status: 'New Snap', snap: { image: sample('club'), caption: 'I see you.' } },
  { id: 'chad', streak: 12, status: 'New Snap', snap: { image: sample('yacht'), caption: 'my yacht (a guy let me stand on it)' } },
  { id: 'mom', streak: 3, status: 'Received — she’s typing… (for 2 days)' },
  { id: 'malone', streak: 0, status: 'Screenshotted your story 📸' },
];

export const SNAP_REPLIES = {
  kayleigh: 'why are you like this',
  dwayne: 'bro that’s hard. can I borrow it',
  unknown: 'Nice lighting. Nice address, too.',
  chad: 'mint that as an NFT immediately',
  mom: 'Who is this',
  malone: '📸 Det. Malone took a screenshot.',
  linda: '💅💅💅 SLAY (what is this app)',
};

// ---------- Lock screen ----------
export const LOCK_NOTES = [
  { app: 'icall', title: 'MOM', text: '3 missed calls' },
  { app: 'itext', id: 'unknown', title: 'Unknown Number', text: 'You better answer this.' },
  { app: 'suschat', title: 'SusChat', text: '17 new snaps (all from your ex)' },
  { app: 'reelgram', title: 'Reelgram', text: 'someone viewed your story 41 times' },
];
