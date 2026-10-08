import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function createScroll({ reduced }) {
  ScrollTrigger.config({ ignoreMobileResize: true });

  const root = document.documentElement;
  let lenis = null;

  if (!reduced) {
    // Touch keeps native momentum (syncTouch off), which feels most natural on phones.
    lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  return {
    lenis,
    // First entry, after the intro screens.
    open() {
      document.body.classList.remove('is-locked');
      lenis?.start();
      ScrollTrigger.refresh();
    },
    scrollTo(el, { offset = 0 } = {}) {
      if (lenis) lenis.scrollTo(el, { offset, duration: 1 });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset });
    },
    // For modals: freeze scrolling without moving the page.
    pause() {
      lenis?.stop();
      root.style.overflow = 'hidden';
    },
    resume() {
      root.style.overflow = '';
      lenis?.start();
    },
  };
}
