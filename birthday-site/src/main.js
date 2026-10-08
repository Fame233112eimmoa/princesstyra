import 'lenis/dist/lenis.css';
import './styles/main.css';
import config from '../config.js';
import { renderPage } from './modules/render.js';
import { createScroll } from './modules/scroll.js';
import { createPetals } from './modules/petals.js';
import { createMusic } from './modules/music.js';
import { initAnimations } from './modules/animations.js';
import { runLock, runPassword, runIntro } from './modules/gates.js';
import { initNav } from './modules/nav.js';
import { initCake } from './modules/cake.js';
import { initWishes } from './modules/wishes.js';
import { createPlayer } from './modules/player.js';
import { initLightbox, initReasons, initWishJar, initScratch, initEasterEgg } from './modules/features.js';
import { session } from './modules/util.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const page = document.body.dataset.page || 'home';

Object.entries(config.theme || {}).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));

renderPage(config, page);

const scroll = createScroll({ reduced });
const petals = createPetals(document.querySelector('.petals'), { reduced });
const music = createMusic(config);
const nav = initNav({ scroll, music, reduced });
const player = createPlayer({ scroll, music });

if (document.querySelector('[data-cake]')) initCake(config, { petals, music, scroll, reduced });
const wishGrid = document.querySelector('[data-wishes]');
if (wishGrid) initWishes(config, { player, petals, mode: wishGrid.dataset.wishes });
initLightbox(config, { scroll, reduced });
initReasons();
initWishJar({ reduced, petals });
initScratch({ petals });
initEasterEgg(config, { scroll, petals });

const motion = initAnimations({ reduced });

(async () => {
  await runLock(config, { reduced });
  await runPassword(config, { reduced });

  // The name intro plays once per visit, on the home page. Every other arrival lifts the curtain.
  const intro = document.getElementById('intro');
  let introDrift;
  if (page === 'home' && session.get('bday-opened') !== '1') {
    nav.hideCurtain();
    await runIntro(config, {
      reduced,
      onShow() {
        petals.shower(40);
        // Keep a gentle drift going for as long as she stays on the opening screen.
        introDrift = setInterval(() => petals.shower(5), 1600);
      },
      onOpen() {
        clearInterval(introDrift);
        session.set('bday-opened', '1');
        music.startFromGesture();
        motion.playHero();
        petals.shower(36);
      },
    });
  } else {
    intro?.remove();
    motion.playHero(0.35);
    await nav.reveal();
  }

  scroll.open();
  document.getElementById('main').focus({ preventScroll: true });
})();
