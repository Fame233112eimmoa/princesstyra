import { gsap } from 'gsap';
import { $, $$ } from './util.js';
import { createModal } from './modal.js';

// Page-to-page transitions: a paper curtain rises over the page before leaving and lifts off the next one.
export function initNav({ scroll, music, reduced }) {
  const curtain = $('.curtain');
  const menuEl = document.getElementById('menu');

  const modal = createModal(menuEl, {
    scroll,
    label: 'Chapters',
    onClose: () => gsap.to(menuEl, { opacity: 0, duration: 0.35, ease: 'power2.out' }),
  });

  $('[data-menu-open]').addEventListener('click', () => {
    modal.open();
    gsap.fromTo(menuEl, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' });
    if (!reduced) gsap.fromTo($$('.menu__list li', menuEl), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out' });
  });

  // The Chapters button slides away while she scrolls down to read, and returns when she scrolls up.
  const toggle = $('[data-menu-open]');
  let lastY = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      const nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 240;
      toggle.classList.toggle('is-tucked', y > 160 && y > lastY && !nearEnd);
      lastY = y;
    },
    { passive: true },
  );
  toggle.addEventListener('focus', () => toggle.classList.remove('is-tucked'));

  let leaving = false;
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-nav]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    if (leaving) return;

    // Choosing the chapter you're already on just closes the menu and goes back to the top.
    if (link.getAttribute('aria-current') === 'page') {
      modal.close();
      setTimeout(() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }), 400);
      return;
    }

    leaving = true;
    const href = link.getAttribute('href');
    music.save();
    if (reduced) {
      location.href = href;
      return;
    }
    // Rise above the open menu so the transition is visible.
    gsap.set(curtain, { visibility: 'visible', zIndex: 400 });
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.in', onComplete: () => (location.href = href) });
  });

  // Coming back with the browser's Back button restores the page as it was left:
  // put the curtain away, close the menu and let the page scroll again.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    gsap.set(curtain, { visibility: 'hidden', clearProps: 'zIndex' });
    modal.reset();
  });

  return {
    hideCurtain() {
      gsap.set(curtain, { visibility: 'hidden' });
    },
    reveal() {
      if (reduced) return gsap.to(curtain, { opacity: 0, duration: 0.4 }).then(() => gsap.set(curtain, { visibility: 'hidden', opacity: 1 }));
      return gsap
        .fromTo(curtain, { yPercent: 0 }, { yPercent: -100, duration: 1.2, ease: 'expo.inOut', delay: 0.1 })
        .then(() => gsap.set(curtain, { visibility: 'hidden' }));
    },
  };
}
