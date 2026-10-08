import { gsap } from 'gsap';
import { esc, parseDate, formatLongDate, session } from './util.js';

const pad = (n) => String(n).padStart(2, '0');

// ?preview=1 is remembered for the rest of the visit, so it survives moving between pages.
export function isPreview() {
  if (new URLSearchParams(location.search).has('preview')) session.set('bday-preview', '1');
  return session.get('bday-preview') === '1';
}

// Countdown to local midnight on her birthday. Resolves once the time has come (or immediately in preview).
export function runLock(config, { reduced }) {
  const target = parseDate(config.birthday).getTime();
  if (config.countdown === false || isPreview() || Date.now() >= target) return Promise.resolve();

  const el = document.getElementById('lock');
  el.hidden = false;
  el.innerHTML = `
    <div class="screen__inner">
      <span class="label label--accent">Not quite yet</span>
      <h1 class="title">Something is waiting<br />for <em>${esc(config.herName)}</em></h1>
      <p class="lede">It opens at midnight, ${esc(formatLongDate(config.birthday).replace(/^The /, 'the '))}.</p>
      <div class="countdown" role="timer" aria-live="off">
        ${['days', 'hours', 'minutes', 'seconds']
          .map((u) => `<div class="countdown__cell"><span class="countdown__num" data-unit="${u}">00</span><span class="label">${u}</span></div>`)
          .join('')}
      </div>
    </div>`;

  const nums = Object.fromEntries([...el.querySelectorAll('[data-unit]')].map((n) => [n.dataset.unit, n]));
  if (!reduced) gsap.from(el.querySelectorAll('.screen__inner > *'), { y: 24, opacity: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out' });

  return new Promise((resolve) => {
    const tick = () => {
      const left = Math.max(0, target - Date.now());
      const s = Math.floor(left / 1000);
      nums.days.textContent = pad(Math.floor(s / 86400));
      nums.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      nums.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      nums.seconds.textContent = pad(s % 60);
      if (left <= 0) {
        clearInterval(timer);
        gsap.to(el, {
          opacity: 0,
          duration: 1.2,
          ease: 'power2.out',
          onComplete: () => {
            el.hidden = true;
            resolve();
          },
        });
      }
    };
    const timer = setInterval(tick, 1000);
    tick();
  });
}

export function runPassword(config, { reduced }) {
  const secret = String(config.password || '').trim().toLowerCase();
  if (!secret || session.get('bday-pass') === '1') return Promise.resolve();

  const el = document.getElementById('gate');
  el.hidden = false;
  el.innerHTML = `
    <div class="screen__inner">
      <span class="label label--accent">For ${esc(config.herName)} only</span>
      <h1 class="title">The secret word</h1>
      <form class="gate__form" novalidate>
        <label class="sr-only" for="gate-input">Secret word</label>
        <input class="field" id="gate-input" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" />
        <button class="btn btn--solid" type="submit">Enter</button>
        <p class="form-note" aria-live="polite"></p>
      </form>
    </div>`;

  const form = el.querySelector('form');
  const input = el.querySelector('input');
  const note = el.querySelector('.form-note');
  input.focus({ preventScroll: true });

  return new Promise((resolve) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value.trim().toLowerCase() === secret) {
        session.set('bday-pass', '1');
        gsap.to(el, {
          opacity: 0,
          duration: reduced ? 0.3 : 0.9,
          ease: 'power2.out',
          onComplete: () => {
            el.hidden = true;
            resolve();
          },
        });
      } else {
        note.textContent = config.passwordHint ? `Not quite. Hint: ${config.passwordHint}` : 'Not quite. Try again.';
        if (!reduced) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' });
        input.select();
      }
    });
  });
}

// Her name appears letter by letter; tapping "Open" lifts the cover upward (and counts as the gesture music needs).
export function runIntro(config, { reduced, onShow, onOpen }) {
  const el = document.getElementById('intro');
  const letters = [...config.herName].map((ch) => `<span>${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('');
  el.innerHTML = `
    <div class="screen__inner">
      <span class="label intro__label">A birthday, in a few chapters</span>
      <p class="intro__name" aria-label="${esc(config.herName)}">${letters}</p>
      <span class="intro__rule" aria-hidden="true"></span>
      <p class="intro__sub">Happy birthday</p>
      <button class="btn intro__open" type="button">Open</button>
    </div>`;

  const name = el.querySelectorAll('.intro__name span');
  const rest = el.querySelectorAll('.intro__label, .intro__sub, .intro__open');
  const rule = el.querySelector('.intro__rule');
  const btn = el.querySelector('.intro__open');

  if (reduced) {
    gsap.from(el.querySelectorAll('.screen__inner > *'), { opacity: 0, duration: 0.8, stagger: 0.1 });
    onShow?.();
  } else {
    gsap
      .timeline({ delay: 0.3 })
      .from(name, { opacity: 0, yPercent: 30, duration: 1.6, stagger: 0.12, ease: 'expo.out' })
      .add(() => onShow?.(), 0.5)
      .from(rule, { scaleX: 0, duration: 1.2, ease: 'expo.out' }, '-=0.9')
      .from(rest, { opacity: 0, y: 14, duration: 1.2, stagger: 0.12, ease: 'power3.out' }, '-=0.9');
  }

  return new Promise((resolve) => {
    btn.addEventListener(
      'click',
      () => {
        onOpen?.();
        btn.disabled = true;
        const done = () => {
          el.remove();
          resolve();
        };
        if (reduced) {
          gsap.to(el, { opacity: 0, duration: 0.6, onComplete: done });
          return;
        }
        gsap
          .timeline({ onComplete: done })
          .to(el.querySelectorAll('.screen__inner > *'), { opacity: 0, y: -24, duration: 0.7, stagger: 0.04, ease: 'power2.in' })
          .to(el, { yPercent: -100, duration: 1.4, ease: 'expo.inOut' }, '-=0.15');
      },
      { once: true },
    );
  });
}
