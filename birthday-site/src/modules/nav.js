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
    if (!reduced) gsap.from($$('.menu__link', menuEl), { y: 30, opacity: 0, duration: 1, stagger: 0.06, ease: 'expo.out' });
  });

  let leaving = false;
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-nav]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    const href = link.getAttribute('href');
    music.save();
    if (reduced) {
      location.href = href;
      return;
    }
    gsap.set(curtain, { visibility: 'visible' });
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: 'expo.in', onComplete: () => (location.href = href) });
  });

  // Coming back with the browser's back button can restore a page with the curtain still down.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    gsap.set(curtain, { visibility: 'hidden' });
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
