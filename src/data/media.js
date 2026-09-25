// Real media: stills courtesy @r3spawnhere, clips are fan/concept footage (credited in-app).
// Captions/likes/comments written per image. Handles are original parody accounts.
const post = (s) => `/media/posts/${s}.webp`;
const thumb = (s) => `/media/posts/${s}-thumb.webp`;
const reel = (s) => ({ src: `/media/reels/${s}.mp4`, poster: `/media/reels/${s}.webp` });

export const CREDIT = { handle: '@r3spawnhere', url: 'https://www.instagram.com/r3spawnhere/' };

export const ACCOUNTS = {
  rideordie: { handle: 'ride.or.die.leonida', name: 'Ride or Die 💕🔫', avatar: thumb('passenger-princess'), verified: true, followers: '4.8M' },
  mudbog: { handle: 'mudbog_mikey', name: 'Mikey (Mud Certified)', avatar: thumb('mudbog-selfie'), followers: '212K' },
  booking: { handle: 'vcpd.booking.daily', name: 'VCPD Booking Daily', avatar: thumb('fence-mugshot'), verified: true, followers: '9.1M' },
  bryce: { handle: 'withdrawal.bryce', name: 'Bryce | Finance Bro', avatar: thumb('bank-job'), followers: '61K' },
  neon: { handle: 'vice.after.dark', name: 'Vice After Dark', avatar: reel('neon-strip-nights').poster, followers: '1.3M' },
  beach: { handle: 'vicebeach.cam', name: 'Vice Beach Live', avatar: reel('beach-truck-chaos').poster, followers: '802K' },
  swamp: { handle: 'grassrivers.tours', name: 'Airboat Andy', avatar: reel('swamp-airboat').poster, followers: '44K' },
  cars: { handle: 'puddle.supercars', name: 'Puddle Supercars', avatar: reel('rainy-supercar').poster, followers: '2.2M' },
};

export const POSTS = [
  {
    id: 'p-couple', acct: 'rideordie', image: post('couple-sunset'), loc: 'Vice City Causeway',
    caption: 'robbed a bank and each other’s hearts 💕 anniversary #3 (of not getting caught) #CoupleGoals',
    likes: 1204331,
    comments: [['blessed_brenda_62', 'Beautiful!! Is he a doctor?'], ['vcpd_malone', 'Nice sunset. Where were you both at 4:15 PM?'], ['kayleigh.heals', 'some of us are healing'], ['mudbog_mikey', 'goals fr 🥹']],
  },
  {
    id: 'p-mud', acct: 'mudbog', image: post('mudbog-selfie'), loc: 'Grassrivers Mud Bog',
    caption: 'skipped therapy for this 🤠🍺 mud is just earth’s hug. certified 40% mud 60% beer',
    likes: 88410,
    comments: [['linda_lives_laughs', 'Mikey your mother is calling'], ['dwayne.flips.cars', 'is that mud or'], ['grassrivers.tours', 'the gators are filing a noise complaint']],
  },
  {
    id: 'p-fence', acct: 'booking', image: post('fence-mugshot'), loc: 'Vice City PD — Holding',
    caption: 'Today’s booking: “I was just vibing” 🔒 Charge: Grand Theft Vibes. Bail: $3.50 + a Denny’s coupon. Rate his jawline 1–10 👇',
    likes: 2410988,
    comments: [['kayleigh.heals', '10. I’d post his bail'], ['blessed_brenda_62', 'Is this the man from your post'], ['withdrawal.bryce', 'bro is serving looks and time'], ['chad.eth', 'NFT this']],
  },
  {
    id: 'p-atv', acct: 'rideordie', image: post('atv-date'), loc: 'Leonida Keys',
    caption: 'date night: borrowing this ATV 🏍️ (we’re returning it) (we are not returning it)',
    likes: 733204,
    comments: [['pruitt_properties', 'That is MY ATV'], ['vicebeach.cam', 'spotted on cam 3 lol'], ['mudbog_mikey', 'bring it to the bog']],
  },
  {
    id: 'p-bank', acct: 'bryce', image: post('bank-job'), loc: 'Leonida Savings & Loan',
    caption: 'Monday: making a big withdrawal 💼📉 (all of it) (everyone’s) #Hustle #FinanceTok',
    likes: 61203,
    comments: [['chad.eth', 'bullish'], ['vcpd_malone', 'Hey Bryce. Quick question.'], ['linda_lives_laughs', 'Is this legal?? Asking for my MLM']],
  },
  {
    id: 'p-duo', acct: 'rideordie', image: post('scheme-duo'), loc: 'Port Gellhorn',
    caption: 'couples who scheme together stay together 🫶 (also: we have a plan) (the plan is bad)',
    likes: 980122,
    comments: [['blessed_brenda_62', 'Why does he have that'], ['vcpd.booking.daily', 'see you both soon 😊'], ['kayleigh.heals', 'manifesting a man who plans']],
  },
  {
    id: 'p-garage', acct: 'rideordie', image: post('garage-pov'), loc: 'Parking Garage, Vice City',
    caption: 'POV: you owe us $40 and you’ve been “busy” 🙂 #GentleReminder',
    likes: 1540320,
    comments: [['dwayne.flips.cars', 'I’ll pay u back tuesday'], ['chad.eth', 'accept crypto?'], ['withdrawal.bryce', 'this is literally my loan officer']],
  },
  {
    id: 'p-princess', acct: 'rideordie', image: post('passenger-princess'), loc: 'Vice Beach',
    caption: 'passenger princess with a rap sheet 🚗💅 he drives, I decide. Life’s a heist ✨',
    likes: 2011870,
    comments: [['linda_lives_laughs', 'QUEEN 👑'], ['vcpd_malone', 'Nice car. Registered to who?'], ['kayleigh.heals', 'the tattoos… healing era core'], ['puddle.supercars', 'mid car, elite vibes']],
  },
];

export const REELS = [
  { id: 'r-neon', acct: 'neon', ...reel('neon-strip-nights'), text: 'Vice City after 2 AM hits different 🌴💜 (so does my credit score)', audio: '♫ Vice FM — Night Drive (slowed + reverb)', likes: 402311, place: 'Ocean View Strip', mi: '0.3' },
  { id: 'r-beach', acct: 'beach', ...reel('beach-truck-chaos'), text: 'POV: you parked on the beach “for 5 minutes” 🚙🏖️', audio: '♫ original audio — somebody’s uncle', likes: 118902, place: 'Vice Beach', mi: '0.8' },
  { id: 'r-swamp', acct: 'swamp', ...reel('swamp-airboat'), text: 'Airboat tour $20. Gator encounter free. Refunds: no. 🐊', audio: '♫ banjo but it’s drill', likes: 50231, place: 'Grassrivers', mi: '4.2' },
  { id: 'r-cars', acct: 'cars', ...reel('rainy-supercar'), text: 'He parked it in a puddle on purpose. For the reflections. For the content. 🏎️💧', audio: '♫ luxury car music (royalty free)', likes: 890344, place: 'Palm Row', mi: '1.1' },
];

// Snaps NPCs send you (the notifier drops these in your SusChat inbox).
export const SNAP_POOL = [
  { from: 'dwayne', image: post('fence-mugshot'), caption: 'guess who’s back in holding 😎 bail me out' },
  { from: 'chad', image: post('bank-job'), caption: 'networking event 💼' },
  { from: 'unknown', image: post('garage-pov'), caption: 'We need to talk.' },
  { from: 'kayleigh', image: post('couple-sunset'), caption: 'this could’ve been us but u played' },
  { from: 'linda', image: post('mudbog-selfie'), caption: 'met a nice man at the bog 🥰' },
  { from: 'malone', image: post('passenger-princess'), caption: 'Do you know these people? Asking officially.' },
  { from: 'dwayne', image: post('atv-date'), caption: 'new ride 🏍️ don’t ask' },
];

export const CREDITS_TEXT = 'Stills © @r3spawnhere (used with credit). Clips: fan/concept footage, © their creators.';
