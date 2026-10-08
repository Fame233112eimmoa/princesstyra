import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitWords } from './split.js';
import { $, $$ } from './util.js';

gsap.registerPlugin(ScrollTrigger);

function ambient() {
  gsap.to('.progress span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });

  const tone = $('.tone');
  $$('[data-tone]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (!self.isActive) return;
        gsap.to(tone, { opacity: sec.dataset.tone === 'tint' ? 1 : 0, duration: 1.4, ease: 'power2.out', overwrite: true });
      },
    });
  });

  $$('.story__item').forEach((item) => {
    ScrollTrigger.create({ trigger: item, start: 'top 60%', onEnter: () => item.classList.add('is-active') });
  });
}

function reducedMotion() {
  ambient();
  $$('[data-fade], [data-split], [data-reveal], [data-brighten], [data-stagger], .reason, .wish').forEach((el) => {
    gsap.from(el, { opacity: 0, duration: 0.8, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  if ($('.story__line')) gsap.set('.story__line span', { scaleY: 1 });
  return { playHero() {} };
}

function revealMedia(frame, { delay = 0, immediate = false } = {}) {
  const mask = $('.media__mask', frame);
  const inner = $('.media__inner', frame);
  const img = $('img', frame);
  const tl = gsap.timeline({
    paused: immediate,
    delay,
    scrollTrigger: immediate ? undefined : { trigger: frame, start: 'top 88%', once: true },
  });
  tl.fromTo(mask, { yPercent: 100 }, { yPercent: 0, duration: 1.5, ease: 'expo.out', immediateRender: true })
    .fromTo(inner, { yPercent: -100 }, { yPercent: 0, duration: 1.5, ease: 'expo.out', immediateRender: true }, 0)
    .fromTo(img, { scale: 1.32 }, { scale: 1.06, duration: 2.8, ease: 'power2.out', immediateRender: true }, 0);
  return tl;
}

function parallax(frame) {
  const img = $('img', frame);
  gsap.fromTo(
    img,
    { yPercent: -6 },
    { yPercent: 6, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
  );
}

function fullMotion() {
  ambient();

  // Generic fades and split headlines.
  $$('[data-fade]').forEach((el) => {
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  $$('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 110,
      duration: 1.3,
      stagger: 0.06,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Photos: mask wipe, slow settle, gentle parallax.
  $$('[data-reveal]')
    .filter((f) => !f.closest('#hero'))
    .forEach((frame) => {
      revealMedia(frame);
      parallax(frame);
    });

  // Statement: words brighten as she scrolls.
  const statementWords = $$('[data-statement] .w');
  if (statementWords.length) {
    gsap.fromTo(
      statementWords,
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-statement]', start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
      },
    );
  }

  // Letter: big moments brighten word by word as she scrolls through them.
  $$('[data-brighten]').forEach((el) => {
    gsap.fromTo(
      $$('.w', el),
      { opacity: 0.1 },
      { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 50%', scrub: 0.6 } },
    );
  });

  // Letter: lists arrive one line at a time; the "things I love" rise out of a mask.
  $$('[data-stagger]').forEach((list) => {
    const masked = $$('.word > span', list);
    const tween = masked.length
      ? { targets: masked, from: { yPercent: 110 }, stagger: 0.18, duration: 1.4, ease: 'expo.out' }
      : { targets: list.children, from: { opacity: 0, y: 26 }, stagger: 0.16, duration: 1.2, ease: 'power3.out' };
    gsap.from(tween.targets, {
      ...tween.from,
      stagger: tween.stagger,
      duration: tween.duration,
      ease: tween.ease,
      scrollTrigger: { trigger: list, start: 'top 82%', once: true },
    });
  });

  // Letter: each part's hairline draws in.
  $$('.ls-head__rule').forEach((rule) => {
    gsap.from(rule, { scaleX: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: rule, start: 'top 88%', once: true } });
  });

  // Timeline line draws with scroll.
  if ($('.story__list')) gsap.fromTo(
    '.story__line span',
    { scaleY: 0 },
    { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.story__list', start: 'top 60%', end: 'bottom 60%', scrub: 0.5 } },
  );

  // Gallery: pinned horizontal scroll with inner parallax.
  const section = $('#gallery');
  const track = $('.gallery__track');
  if (section && track) {
    const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    $$('.gallery__item', track).forEach((item) => {
      gsap.fromTo(
        $('img', item),
        { xPercent: 6 },
        {
          xPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: item, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
        },
      );
    });
    gsap.from($$('.gallery__item', track).slice(0, 3), {
      y: 60,
      opacity: 0,
      duration: 1.4,
      stagger: 0.12,
      ease: 'expo.out',
      scrollTrigger: { trigger: section, start: 'top 70%', once: true },
    });
  }

  // Reason cards arrive in soft batches.
  if ($('.reason')) gsap.set('.reason', { opacity: 0, y: 40 });
  ScrollTrigger.batch('.reason', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, ease: 'power3.out' }),
  });

  // Cake rises, then the candles appear one by one.
  if ($('[data-cake]')) gsap.from('[data-cake]', {
    y: 60,
    opacity: 0,
    duration: 1.6,
    ease: 'expo.out',
    scrollTrigger: { trigger: '[data-cake]', start: 'top 85%', once: true },
  });
  if ($('[data-cake]')) ScrollTrigger.create({
    trigger: '[data-cake]',
    start: 'top 80%',
    once: true,
    onEnter: () =>
      gsap.from('.candle', { y: 18, opacity: 0, duration: 0.9, stagger: 0.04, ease: 'power3.out', delay: 0.4, clearProps: 'opacity' }),
  });

  if ($('.wish')) gsap.set('.wish', { opacity: 0, y: 30 });
  ScrollTrigger.batch('.wish', {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out' }),
  });


  // The page's first headline (hero or chapter title) waits for the intro or curtain to lift.
  const heroWords = $$('[data-hero-split]').flatMap((el) => splitWords(el));
  const heroFades = $$('[data-hero-fade]');
  const heroFrame = $('#hero [data-reveal]');
  gsap.set(heroWords, { yPercent: 110 });
  gsap.set(heroFades, { opacity: 0, y: 24 });
  const heroReveal = heroFrame ? revealMedia(heroFrame, { immediate: true }) : null;
  if (heroFrame) parallax(heroFrame);

  return {
    playHero(delay = 0.55) {
      gsap
        .timeline({ delay })
        .to(heroWords, { yPercent: 0, duration: 1.6, stagger: 0.09, ease: 'expo.out' })
        .add(() => heroReveal?.play(), 0.25)
        .to(heroFades, { opacity: 1, y: 0, duration: 1.4, stagger: 0.15, ease: 'power3.out' }, 0.6);
    },
  };
}

export function initAnimations({ reduced }) {
  document.body.classList.toggle('is-reduced', reduced);
  const api = reduced ? reducedMotion() : fullMotion();
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
  return api;
}
