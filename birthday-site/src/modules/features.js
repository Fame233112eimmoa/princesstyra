import { gsap } from 'gsap';
import { esc, token, $, $$ } from './util.js';
import { createModal, CLOSE_BUTTON } from './modal.js';

const ARROW = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${d === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;

/* ---------- Gallery lightbox (FLIP from the tapped photo) ---------- */
// Uniform scale (no stretching) that centres the full image over the cropped thumbnail. Origin is top-left.
function fitTransform(full, thumb) {
  const scale = thumb.width / full.width;
  return {
    scale,
    x: thumb.left - full.left,
    y: thumb.top + thumb.height / 2 - (full.top + (full.height * scale) / 2),
  };
}

export function initLightbox(config, { scroll, reduced }) {
  if (!$('#gallery')) return;
  const photos = config.gallery.photos;
  const el = document.getElementById('lightbox');
  el.innerHTML = `
    <div class="overlay__backdrop"></div>
    ${CLOSE_BUTTON}
    <div class="lightbox__stage"><img class="lightbox__img" alt="" /></div>
    <div class="lightbox__bar">
      <button class="icon-btn" type="button" data-prev aria-label="Previous photo">${ARROW('prev')}</button>
      <p class="lightbox__caption" aria-live="polite"></p>
      <button class="icon-btn" type="button" data-next aria-label="Next photo">${ARROW('next')}</button>
    </div>`;
  const img = $('.lightbox__img', el);
  const caption = $('.lightbox__caption', el);
  const backdrop = $('.overlay__backdrop', el);
  const bar = $('.lightbox__bar', el);
  let index = 0;
  let source = null;

  const sourceImg = (i) => $(`.gallery__item[data-index="${i}"] img`);

  function flipFrom(fromEl) {
    if (reduced || !fromEl) return gsap.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    const from = fitTransform(img.getBoundingClientRect(), fromEl.getBoundingClientRect());
    return gsap.fromTo(img, { ...from, opacity: 1 }, { x: 0, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' });
  }

  function show(i) {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    img.src = p.src;
    img.alt = p.alt;
    caption.textContent = p.caption || '';
  }

  const modal = createModal(el, {
    scroll,
    label: 'Photo viewer',
    onClose: () => {
      const target = sourceImg(index);
      const tl = gsap.timeline();
      tl.to([backdrop, bar, $('[data-close]', el)], { opacity: 0, duration: 0.45, ease: 'power2.out' }, 0);
      if (!reduced && target) {
        const to = fitTransform(img.getBoundingClientRect(), target.closest('.media').getBoundingClientRect());
        tl.to(img, { ...to, duration: 0.7, ease: 'expo.inOut' }, 0)
          .to(img, { opacity: 0, duration: 0.2 }, 0.55);
      } else {
        tl.to(img, { opacity: 0, duration: 0.3 }, 0);
      }
      return tl.then(() => gsap.set([img, backdrop, bar, $('[data-close]', el)], { clearProps: 'all' }));
    },
  });

  $('#gallery').addEventListener('click', async (e) => {
    const item = e.target.closest('.gallery__item');
    if (!item) return;
    source = $('img', item);
    show(Number(item.dataset.index));
    modal.open();
    if (!img.complete) await img.decode().catch(() => {});
    gsap.fromTo([backdrop, bar], { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    flipFrom(source.closest('.media'));
  });

  const step = (d) => {
    gsap.to(img, {
      opacity: 0,
      x: -24 * d,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        show(index + d);
        gsap.fromTo(img, { opacity: 0, x: 24 * d }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
      },
    });
  };
  $('[data-prev]', el).addEventListener('click', () => step(-1));
  $('[data-next]', el).addEventListener('click', () => step(1));
  document.addEventListener('keydown', (e) => {
    if (!modal.isOpen) return;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  let touchX = null;
  el.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
  el.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX = null;
  });
}

/* ---------- Reasons: tap to flip ---------- */
export function initReasons() {
  $('.reasons__grid')?.addEventListener('click', (e) => {
    const card = e.target.closest('.reason');
    if (!card) return;
    card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
  });
}

/* ---------- Wish jar ---------- */
export function initWishJar({ reduced, petals }) {
  const form = $('[data-jar-form]');
  if (!form) return;
  const jar = $('[data-jar]');
  const note = $('[data-jar-note]');
  let count = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.elements.wish;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.blur();
    count += 1;
    note.textContent = count === 1 ? 'Your wish is on its way.' : `${count} wishes sent.`;

    const r = jar.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height * 0.45;

    const light = document.createElement('span');
    light.className = 'wish-light';
    const label = document.createElement('span');
    label.className = 'wish-text';
    label.textContent = text;
    document.body.append(light, label);

    if (reduced) {
      gsap.fromTo([light, label], { x, y, opacity: 1 }, { opacity: 0, duration: 1.6, delay: 0.4, onComplete: () => (light.remove(), label.remove()) });
      return;
    }

    const rise = Math.min(window.innerHeight * 0.85, y + 40);
    const drift = (Math.random() - 0.5) * 80;
    gsap.set(light, { x: x - 9, y: y - 9, scale: 0.4, opacity: 0 });
    gsap.set(label, { x: x - Math.min(label.offsetWidth, window.innerWidth * 0.7) / 2, y: y - 50, opacity: 0 });
    gsap
      .timeline({ onComplete: () => (light.remove(), label.remove()) })
      .to(light, { opacity: 1, scale: 1.4, duration: 0.8, ease: 'power2.out' })
      .to(label, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .to(label, { y: `-=${rise * 0.5}`, opacity: 0, duration: 2.6, ease: 'power1.in' }, 0.7)
      .to(light, { y: `-=${rise}`, x: `+=${drift}`, duration: 4.2, ease: 'power1.inOut' }, 0.4)
      .to(light, { scale: 0.6, opacity: 0, duration: 1.6, ease: 'power1.in' }, 3);
    gsap.fromTo(jar, { rotate: 0 }, { rotate: 2, duration: 0.15, yoyo: true, repeat: 3, ease: 'sine.inOut', clearProps: 'rotate' });
    if (count % 3 === 0) petals.shower(24);
  });
}

/* ---------- Scratch card ---------- */
export function initScratch({ petals }) {
  const card = $('[data-scratch]');
  if (!card) return;
  const canvas = $('[data-scratch-canvas]');
  const revealBtn = $('[data-scratch-reveal]');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let revealed = false;
  let drawing = false;
  let last = null;
  let moves = 0;

  function paint() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = card.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = token('--tint-200');
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let x = 8; x < width; x += 14) for (let y = 8; y < height; y += 14) ctx.fillRect(x, y, 1, 1);
    ctx.fillStyle = token('--accent-700');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Scratch gently', width / 2, height / 2 - 8);
    ctx.font = '500 10px "DM Sans", system-ui, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('WITH YOUR FINGER', width / 2, height / 2 + 22);
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    revealBtn.remove();
    gsap.to(canvas, { opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: () => canvas.remove() });
    gsap.from('.scratch__reveal > *', { y: 16, duration: 1.1, stagger: 0.12, ease: 'power3.out' });
    petals.shower(50);
  }

  function clearedRatio() {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) {
      total += 1;
      if (data[i] < 40) clear += 1;
    }
    return clear / total;
  }

  function scratchTo(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 36;
    ctx.beginPath();
    ctx.moveTo(last ? last.x : x, last ? last.y : y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last = { x, y };
    if (++moves % 8 === 0 && clearedRatio() > 0.5) reveal();
  }

  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (revealed) return;
    drawing = true;
    last = null;
    canvas.setPointerCapture(e.pointerId);
    const p = point(e);
    scratchTo(p.x, p.y);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing || revealed) return;
    const p = point(e);
    scratchTo(p.x, p.y);
  });
  const end = () => {
    drawing = false;
    last = null;
    if (!revealed && clearedRatio() > 0.5) reveal();
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  revealBtn.addEventListener('click', reveal);

  const fontsReady = document.fonts?.ready || Promise.resolve();
  fontsReady.then(paint);
  let lastWidth = 0;
  new ResizeObserver(([entry]) => {
    const w = Math.round(entry.contentRect.width);
    if (!revealed && w !== lastWidth) {
      lastWidth = w;
      paint();
    }
  }).observe(card);
}

/* ---------- Easter egg ---------- */
export function initEasterEgg(config, { scroll, petals }) {
  const el = document.getElementById('egg');
  el.innerHTML = `
    <div class="overlay__backdrop"></div>
    <div class="egg__card">
      ${CLOSE_BUTTON}
      <span class="label label--accent">A hidden note</span>
      <h2>${esc(config.easterEgg.title)}</h2>
      <p>${esc(config.easterEgg.message)}</p>
    </div>`;
  const modal = createModal(el, {
    scroll,
    label: 'Hidden note',
    onClose: () => gsap.to(el, { opacity: 0, duration: 0.4 }),
  });

  const open = () => {
    if (modal.isOpen) return;
    modal.open();
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo($('.egg__card', el), { y: 30, scale: 0.97 }, { y: 0, scale: 1, duration: 1, ease: 'expo.out' });
    petals.shower(40);
  };

  let taps = [];
  $('[data-egg]').addEventListener('click', () => {
    const now = Date.now();
    taps = taps.filter((t) => now - t < 2500).concat(now);
    if (taps.length >= 5) {
      taps = [];
      open();
    }
  });

  const secret = config.herName.toLowerCase().replace(/\s+/g, '');
  let typed = '';
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-secret.length);
    if (typed === secret) open();
  });
}
