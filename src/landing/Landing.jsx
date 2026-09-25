import { useEffect, useState } from 'react';
import Leonida from '../scene/Leonida';
import { Logo } from '../intro/Intro';
import { ReelgramLogo, SusChatLogo, MangoLogo } from '../phone/Icons';
import { LENSES, bake } from '../camera/lenses';
import { loadImage } from '../lib/image';
import { NPCS } from '../data/npc';
import { POSTS, REELS, ACCOUNTS } from '../data/media';
import Video from '../ui/Video';
import Legal from '../ui/Legal';
import { unlayer, EDITOR_REPO, CREATOR, ASSETS_BY } from '../ui/links';
import Support from './Support';
import '../intro/intro.css';
import './landing.css';

const STEPS = [
  'Downloading 43 GB of Florida…',
  'Applying humidity patch…',
  'Bypassing Leonida DMV…',
  'Lowering self-esteem…',
  'Syncing with Mom’s Facebook…',
  'Installing Reelgram & SusChat…',
  'Done. Suffering, yet pretending.',
];

const FILTERS = ["Vice '86", 'Court Photo', 'Censored by VCPD', 'Gas Station CCTV', 'Beer Goggles', 'Pawn Shop Polaroid', 'Everglades Humid', 'Old Money', 'Hungover'];
const TOOLS = ['Hide the Mess', 'Vandalize', 'Caption', 'Censor', 'Evidence', 'Mugshot'];

const LOCALS = [
  ['mom', '“Who is that man in your post.”'],
  ['malone', '“Nice post. Is that the car from the 7-Eleven thing?”'],
  ['dwayne', '“u famous now? lend me 40”'],
  ['kayleigh', '“Healing era. (Posted 11 times today.)”'],
  ['linda', '“Make me look like a BOSS. CEO of my own Etsy.”'],
];

const REVIEWS = [
  ['★☆☆☆☆', 'Ruined my life. 10/10.', 'Aunt Linda'],
  ['★★★★★', 'Posted a mugshot lens by accident. Got a record deal and an actual record.', 'Cousin Dwayne'],
  ['★★☆☆☆', 'My ex watched my story 41 times. I watched her watch it 41 times.', 'You, probably'],
];

function Installer({ onClose }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= STEPS.length - 1) {
      const t = setTimeout(() => (location.href = '/app'), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 650 + Math.random() * 500);
    return () => clearTimeout(t);
  }, [step]);
  return (
    <div className="lp-modal" onClick={onClose}>
      <div className="lp-install" onClick={(e) => e.stopPropagation()}>
        <MangoLogo size={54} />
        <h3>Installing VYRAL for iFrute</h3>
        <div className="lp-bar">
          <i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <p>{STEPS[step]}</p>
        <small>Not a real install — this just opens the web demo. Your actual phone is safe. Your dignity is not.</small>
      </div>
    </div>
  );
}

function LensCards() {
  const [cards, setCards] = useState([]);
  useEffect(() => {
    const shots = [2, 4, 1, 7, 6, 0].map((i) => POSTS[i].image);
    const lenses = LENSES.filter((l) => l.id !== 'none').slice(0, 6);
    Promise.all(
      lenses.map(async (l, i) => {
        const img = await loadImage(shots[i]);
        return { name: l.name, src: await bake(img, img.naturalWidth, img.naturalHeight, { aspect: 0.8, lens: l, seed: i * 7 + 3 }) };
      }),
    ).then(setCards);
  }, []);
  return (
    <div className="lp-lenses">
      {cards.map((c, i) => (
        <figure key={c.name} style={{ '--r': `${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg` }}>
          <img src={c.src} alt={`${c.name} lens`} />
          <figcaption>{c.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function Countdown() {
  const target = new Date('2026-11-19T00:00:00').getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const d = Math.max(0, target - now);
  const parts = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
  return (
    <div className="lp-count">
      <span>Install before Nov 19</span>
      {parts.map((v, i) => (
        <b key={i}>
          {String(v).padStart(2, '0')}
          <small>{['days', 'hrs', 'min', 'sec'][i]}</small>
        </b>
      ))}
      <em>(or don’t, it’s a website)</em>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="lp-phone">
      <div className="lp-phone-screen">
        <div className="lp-mock-head">
          <b>Reelgram</b>
          <span>★★★☆☆</span>
        </div>
        <img src={POSTS[7].image} alt="" />
        <div className="lp-mock-cap">
          <b>♥ Liked by aunt_linda and 48,213 others</b>
          <p>
            <b>newinleonida</b> Suffering, yet pretending ✨ <span>#OnlyInLeonida</span>
          </p>
          <p className="dim">vcpd_malone: nice boat. whose is it</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [installing, setInstalling] = useState(false);
  const install = () => setInstalling(true);

  return (
    <div className="lp">
      <nav className="lp-nav">
        <a href="/" className="lp-nav-logo">
          VYRAL
        </a>
        <span className="lp-nav-links">
          <a href="#reelgram">Reelgram</a>
          <a href="#suschat">SusChat</a>
          <a href="#lenses">Lenses</a>
          <a href="#locals">Locals</a>
        </span>
        <button className="lp-pill" onClick={install}>
          Install
        </button>
      </nav>

      <header className="lp-hero">
        <div className="lp-scene">
          <Leonida ads />
          <div className="lp-hero-shade" />
        </div>
        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <Logo />
            <p className="lp-tag">The in-game phone Leonida deserves. Shoot yourself, roast it in the Edit Studio, post it, and watch strangers validate you at GTA speed.</p>
            <p className="lp-must">👇 You have to install it. That’s the whole point.</p>
            <div className="lp-ctas">
              <button className="lp-install-btn lp-install-btn--hero" onClick={install}>
                <MangoLogo size={30} /> INSTALL ON iFRUTE
                <i className="lp-shine" />
              </button>
              <a className="lp-ghost" href="/app?phone=up&app=home">
                Skip the intro →
              </a>
            </div>
            <Countdown />
            <small className="lp-fine">No actual installation — the button opens the web demo. Works best with a webcam and low self-esteem.</small>
          </div>
          <PhoneMock />
        </div>
      </header>

      <div className="lp-marquee">
        <span>
          YOU HAVE TO INSTALL IT · THAT’S THE WHOLE POINT · SUFFERING, YET PRETENDING · 4.9★ FROM PEOPLE WHO HATE IT · MOM HAS SEEN YOUR POST ·
          YOU HAVE TO INSTALL IT · THAT’S THE WHOLE POINT · SUFFERING, YET PRETENDING · 4.9★ FROM PEOPLE WHO HATE IT · MOM HAS SEEN YOUR POST ·
        </span>
      </div>

      <section className="lp-app" id="reelgram">
        <div className="lp-app-logo lp-app-logo--gram">
          <ReelgramLogo />
        </div>
        <div className="lp-app-copy">
          <h2 className="lp-script">Reelgram</h2>
          <p className="lp-quote">“Because apparently 10 seconds is too long.”</p>
          <ul>
            <li>
              <b>Edit Studio</b> built in — filters renamed for your actual life.
            </li>
            <li>
              <b>Roast chips</b> write the caption you were too proud to write.
            </li>
            <li>
              <b>Clout stars</b> — a wanted level, but for validation. Five stars and VCPD gets involved.
            </li>
          </ul>
          <div className="lp-chips">
            {FILTERS.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-app lp-app--flip" id="suschat">
        <div className="lp-app-logo lp-app-logo--sus">
          <SusChatLogo bubble animated />
        </div>
        <div className="lp-app-copy">
          <h2 className="lp-bold">SusChat</h2>
          <p className="lp-quote">“For conversations you’ll deny later.”</p>
          <ul>
            <li>
              <b>Lenses you’ll regret</b> — Mugshot, Breaking News, Most Wanted, Delusional.
            </li>
            <li>
              <b>Evidence Studio</b> — vandalize, censor, caption. Then send it to your ex at 3 AM.
            </li>
            <li>
              <b>Stories expire</b> after 24 in-game hours. Det. Malone’s screenshots don’t.
            </li>
          </ul>
          <div className="lp-chips lp-chips--sus">
            {TOOLS.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-sec lp-sec--dark" id="reels">
        <h2 className="lp-h gta-title">Now trending in Leonida</h2>
        <p className="lp-sub">Reels loop in Reelgram. Same clips show up in SusChat Nearby. Scroll responsibly (you won’t).</p>
        <div className="lp-reels">
          {REELS.map((r) => (
            <figure key={r.id}>
              <Video src={r.src} poster={r.poster} className="lp-reel-video" threshold={0.3} />
              <figcaption>
                <b>@{ACCOUNTS[r.acct].handle}</b>
                <span>{r.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="lp-wall">
          {POSTS.map((p) => (
            <figure key={p.id}>
              <img src={p.image} alt="" loading="lazy" />
              <figcaption>
                ♥ {(p.likes / 1000).toFixed(0)}K · {p.caption.slice(0, 60)}…
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="lp-credit">
          Stills by{' '}
          <a href={ASSETS_BY} target="_blank" rel="noreferrer">
            @r3spawnhere
          </a>{' '}
          · clips: fan/concept footage, © their creators
        </p>
      </section>

      <section className="lp-sec" id="lenses">
        <h2 className="lp-h gta-title">Lenses you’ll regret</h2>
        <p className="lp-sub">Real renders from the app’s lens painter. Your face goes here.</p>
        <LensCards />
      </section>

      <section className="lp-sec lp-sec--dark" id="locals">
        <h2 className="lp-h gta-title">Meet the locals</h2>
        <p className="lp-sub">They’re already in your phone. They have opinions.</p>
        <div className="lp-locals">
          {LOCALS.map(([id, q]) => (
            <figure key={id}>
              <img src={NPCS[id].photo} alt={NPCS[id].name} />
              <figcaption>
                <b className="gta-title">{NPCS[id].name}</b>
                <span>{q}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="lp-sec">
        <h2 className="lp-h gta-title">Reviews</h2>
        <div className="lp-reviews">
          {REVIEWS.map(([s, t, who]) => (
            <blockquote key={who}>
              <span>{s}</span>
              <p>{t}</p>
              <cite>— {who}</cite>
            </blockquote>
          ))}
        </div>
        <div className="lp-reqs">
          <h3>System requirements</h3>
          <p>A face · a webcam (optional, cowards may use stock shots) · an internet connection · low self-esteem · 12% battery</p>
        </div>
      </section>

      <section className="lp-final">
        <div className="lp-scene">
          <Leonida ads phase="night" />
        </div>
        <div className="lp-final-inner">
          <h2 className="gta-title">Pull out your phone.</h2>
          <button className="lp-install-btn lp-install-btn--hero" onClick={install}>
            <MangoLogo size={26} /> Install on iFrute
          </button>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="lp-credits">
          <a href={unlayer('landing-footer')} target="_blank" rel="noreferrer">
            <img src="/brand/unlayer-mark.svg" alt="" /> Powered by <b>Unlayer</b>
          </a>
          <a href={CREATOR} target="_blank" rel="noreferrer">
            🛠 Built by <b>himanshu007-creator</b>
          </a>
          <a href={ASSETS_BY} target="_blank" rel="noreferrer">
            📸 Stills by <b>@r3spawnhere</b>
          </a>
          <a href={EDITOR_REPO} target="_blank" rel="noreferrer">
            ⭐ React Image Editor on GitHub
          </a>
        </div>
        <p>
          <b>No actual installation:</b> the install button just opens the web demo at <code>/app</code>. Everything you shoot stays in your browser (IndexedDB). #BuiltWithImageEditor
        </p>
        <Legal />
      </footer>

      <div className="lp-sticky">
        <span>You have to install it.</span>
        <button onClick={install}>Install</button>
      </div>
      <Support onInstall={install} />
      {installing && <Installer onClose={() => setInstalling(false)} />}
    </div>
  );
}
