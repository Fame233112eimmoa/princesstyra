import { esc, formatLongDate } from './util.js';

// Fills {age} and {name} in chapter titles and lines.
const fmt = (c, str) => String(str ?? '').replace(/\{age\}/g, c.age).replace(/\{name\}/g, c.herName);

const heart = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 4.5 6.8 4.5c2.1 0 3.5 1.1 4.2 2.4h2c.7-1.3 2.1-2.4 4.2-2.4 3.8 0 5.9 4 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>`;

// focus: { x, y, zoom } crops in on a point of the photo (x/y in % of the photo).
function cropStyle(focus) {
  if (!focus) return '';
  const z = Math.max(1, focus.zoom || 1);
  const fx = (focus.x ?? 50) / 100;
  const fy = (focus.y ?? 50) / 100;
  const w = 100 * z;
  const h = 116 * z;
  return `style="width:${w}%;height:${h}%;left:${(-(w - 100) * fx).toFixed(2)}%;top:${(-8 - (h - 116) * fy).toFixed(2)}%"`;
}

function media(src, alt, extraClass = '', eager = false, focus = null) {
  return `
    <div class="media ${extraClass}" data-reveal>
      <div class="media__mask"><div class="media__inner">
        <img src="${esc(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-parallax ${cropStyle(focus)} />
      </div></div>
    </div>`;
}

function hero(c) {
  const letters = [...c.herName].map((ch) => `<span class="word"><span>${ch === ' ' ? '&nbsp;' : esc(ch)}</span></span>`).join('');
  const badge = `Happy birthday · ${c.herName} · Turning ${c.age} · `;
  return `
  <section class="section hero" id="hero" data-tone="white" aria-labelledby="hero-title">
    <div class="container hero__wrap">
      <div class="hero__meta" data-hero-fade>
        <span class="label">${esc(formatLongDate(c.birthday))}</span>
        <span class="hero__dot" aria-hidden="true"></span>
        <span class="label label--accent">Turning ${esc(c.age)}</span>
      </div>
      <p class="hero__kicker" aria-hidden="true" data-hero-split>Happy birthday,</p>
      <div class="hero__visual">
        <span class="hero__arch-line" aria-hidden="true" data-hero-fade></span>
        ${media(c.hero.photo, c.hero.alt, 'hero__arch', true, c.hero.focus)}
        <div class="hero__badge" aria-hidden="true" data-hero-fade>
          <svg class="hero__badge-ring" viewBox="0 0 120 120">
            <defs><path id="badge-path" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs>
            <text><textPath href="#badge-path" textLength="282">${esc(badge.toUpperCase())}</textPath></text>
          </svg>
          <span class="hero__badge-heart">${heart}</span>
        </div>
      </div>
      <h1 class="hero__name" id="hero-title"><span class="sr-only">Happy birthday, </span><span data-hero-split data-split-done="1">${letters}</span></h1>
      <p class="hero__line" data-hero-fade>${esc(c.hero.line)}</p>
      <div class="scroll-cue" data-hero-fade><span class="scroll-cue__line"></span><span class="label">Scroll slowly</span></div>
    </div>
  </section>`;
}

function statement(c) {
  const words = c.statement
    .split(/\s+/)
    .map((w) => `<span class="w">${esc(w)}</span>`)
    .join(' ');
  return `
  <section class="section statement" data-tone="tint" aria-label="A note">
    <div class="container">
      <p class="label label--accent" data-fade style="margin-bottom:var(--s-6)">For you</p>
      <p class="statement__text" data-statement>${words}</p>
    </div>
  </section>`;
}

function reasons(c) {
  const count = Math.min(Number(c.age) || c.reasons.list.length, c.reasons.list.length);
  const cards = c.reasons.list
    .slice(0, count)
    .map(
      (r, i) => `
      <button class="reason" type="button" aria-pressed="false" aria-label="Reason ${i + 1}">
        <span class="reason__inner">
          <span class="reason__face"><span class="reason__num">${String(i + 1).padStart(2, '0')}</span><span class="label">Tap</span></span>
          <span class="reason__face reason__face--back"><span class="reason__text">${esc(r)}</span></span>
        </span>
      </button>`,
    )
    .join('');
  return `
  <section class="section reasons" id="reasons" data-tone="white" aria-labelledby="reasons-title">
    <div class="container">
      <header class="section-head">
        <span class="label" data-fade>${count} reasons</span>
        <h2 class="title" id="reasons-title" data-split>${esc(c.reasons.title)}</h2>
        <p class="lede" data-fade>${esc(c.reasons.intro)}</p>
      </header>
      <div class="reasons__grid">${cards}</div>
    </div>
  </section>`;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
const HEART = `<svg class="ls-heart" viewBox="0 0 24 24" aria-label="love" role="img"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 4.5 6.8 4.5c2.1 0 3.5 1.1 4.2 2.4h2c.7-1.3 2.1-2.4 4.2-2.4 3.8 0 5.9 4 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>`;

// Escapes letter text, then turns **words** into a sage highlight and ❤️ into a small heart.
const rich = (t) =>
  esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<em class="ls-em">$1</em>')
    .replace(/\u2764\uFE0F?/g, HEART);
const LEAF = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4C11 4 5 8.5 5 15c0 1.6.4 3 1 4.2C7.5 14 11 10.5 15 8.5 11.5 11 9 14.3 7.6 19.4 8.8 20.4 10.3 21 12 21c6 0 8-7.5 8-17z"/></svg>`;

// Turns the marked-up letter text in config into parts made of blocks.
function parseLetter(text) {
  const parts = [];
  let part = null;
  const group = (type) => {
    const last = part.blocks[part.blocks.length - 1];
    if (last?.type === type) return last;
    const g = { type, items: [] };
    part.blocks.push(g);
    return g;
  };
  String(text)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (line.startsWith('# ')) {
        part = { title: line.slice(2).trim(), blocks: [] };
        parts.push(part);
        return;
      }
      if (!part) {
        part = { title: '', blocks: [] };
        parts.push(part);
      }
      const mark = line[0];
      const body = line.slice(1).trim();
      if (mark === '-' && line[1] === ' ') group('list').items.push(body);
      else if (mark === '*' && line[1] === ' ') group('loves').items.push(body);
      else if (mark === '+' && line[1] === ' ') group('wishes').items.push(body);
      else if (mark === '~') part.blocks.push({ type: 'line', text: body });
      else if (mark === '!') part.blocks.push({ type: 'big', text: body });
      else if (mark === '"') part.blocks.push({ type: 'quote', text: body });
      else if (mark === '@') {
        const [src, caption = '', shape = ''] = body.split('|').map((x) => x.trim());
        part.blocks.push({ type: 'media', src, caption, round: shape === 'round' });
      }
      else part.blocks.push({ type: 'p', text: line });
    });
  return parts;
}

function letterBlock(b) {
  const words = (t) => String(t).split(/\s+/).map((w) => `<span class="w">${rich(w)}</span>`).join(' ');
  switch (b.type) {
    case 'line':
      return `<p class="ls-line" data-fade>${rich(b.text)}</p>`;
    case 'big':
      return `<p class="ls-big" data-brighten>${words(b.text)}</p>`;
    case 'media': {
      const clip = /\.(mp4|mov|m4v)$/i.test(b.src);
      const inner = clip
        ? `<div class="media"><video data-loop-clip muted loop playsinline preload="metadata" src="${esc(b.src)}" poster="${esc(b.src.replace(/\.\w+$/, '.jpg'))}" aria-hidden="true"></video></div>`
        : `<div class="media"><img src="${esc(b.src)}" alt="${esc(b.caption || 'Tyra')}" loading="lazy" decoding="async" /></div>`;
      return `<figure class="ls-media${b.round ? ' ls-media--round' : ''}" data-fade>${inner}${b.caption ? `<figcaption class="serif-italic">${rich(b.caption)}</figcaption>` : ''}</figure>`;
    }
    case 'quote':
      return `<blockquote class="ls-quote" data-fade><p>${rich(b.text)}</p></blockquote>`;
    case 'list':
      return `<ul class="ls-list" data-stagger>${b.items.map((t) => `<li>${rich(t)}</li>`).join('')}</ul>`;
    case 'loves':
      return `<ul class="ls-loves" data-stagger>${b.items.map((t) => `<li><span class="word"><span>${rich(t)}</span></span></li>`).join('')}</ul>`;
    case 'wishes':
      return `<ul class="ls-wishes" data-stagger>${b.items.map((t) => `<li><span class="ls-wishes__leaf">${LEAF}</span><span>${rich(t)}</span></li>`).join('')}</ul>`;
    default:
      return `<p class="ls-p" data-fade>${rich(b.text)}</p>`;
  }
}

function letterStory(c) {
  const parts = parseLetter(c.letter.text);
  const html = parts
    .map(
      (part, i) => `
  <section class="section ls-part" data-tone="${i % 2 ? 'tint' : 'white'}" aria-labelledby="ls-${i}">
    <div class="ls-col">
      <header class="ls-head" data-fade>
        <span class="label label--accent">Part ${ROMAN[i] || i + 1}<span class="ls-of"> of ${ROMAN[parts.length - 1] || parts.length}</span></span>
        <span class="ls-head__rule" aria-hidden="true"></span>
        <h2 class="ls-title" id="ls-${i}">${esc(part.title)}</h2>
      </header>
      <div class="ls-body">
        ${part.blocks.map(letterBlock).join('\n        ')}
      </div>
    </div>
  </section>`,
    )
    .join('');
  return `${html}
  <section class="section ls-part ls-end" data-tone="white" aria-label="Signed">
    <div class="ls-col">
      <p class="ls-big ls-big--end" data-brighten>${String(c.letter.signoff)
        .split(/\s+/)
        .map((w) => `<span class="w">${rich(w)}</span>`)
        .join(' ')}</p>
      ${c.letter.finalLine ? `<p class="ls-line ls-final" data-fade>${rich(c.letter.finalLine)}</p>` : ''}
      <p class="ls-sign" data-fade>${esc(c.letter.closing)}<strong>${esc(c.letter.signature || c.myName)}</strong></p>
    </div>
  </section>`;
}

// Your video wish: plays by itself, inside the arched frame, once the celebration settles.
function cakeVideo(c) {
  const v = c.cake.afterVideo;
  if (!v?.video) return '';
  const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${d}</svg>`;
  return `
    <div class="cake-video" data-cake-video hidden>
      <span class="label label--accent">${esc(v.label)}</span>
      <h3 class="cake-video__title">${esc(v.title)}</h3>
      <p class="cake-video__line">${esc(v.line)}</p>
      <div class="cake-video__frame" data-cv-frame>
        <span class="cake-video__initial" aria-hidden="true">${esc(c.myName.charAt(0))}</span>
        <video class="cake-video__video" playsinline preload="none" data-cv-video aria-label="${esc(v.title)}"></video>
        <button class="cake-video__play" type="button" data-cv-play aria-label="Play: ${esc(v.title)}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>
        </button>
        <div class="cake-video__controls">
          <button class="cake-video__btn cake-video__btn--sound" type="button" data-cv-sound hidden>
            ${icon('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/>')}<span>Tap for sound</span>
          </button>
          <button class="cake-video__btn" type="button" data-cv-full aria-label="Watch full screen">
            ${icon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>')}
          </button>
        </div>
      </div>
      <span class="cake-video__state" data-cv-state></span>
    </div>`;
}

function cake(c) {
  return `
  <section class="section cake-section" id="cake" data-tone="white" aria-labelledby="cake-title">
    <span class="label" data-fade>A wish</span>
    <h2 class="cake-section__line" id="cake-title" data-split>${esc(c.cake.line)}</h2>
    <div class="cake" data-cake>
      <div class="blast" data-blast aria-hidden="true"></div>
      <img class="cake__img" src="${esc(c.cake.image)}" alt="${esc(c.cake.imageAlt)}" width="900" height="1002" decoding="async" />
      <div class="cake__candles" data-candles></div>
    </div>
    <div class="cake__controls" data-cake-controls>
      <button class="btn btn--solid" type="button" data-cake-start>Tap to begin</button>
      <div class="breath" data-breath aria-hidden="true"><span></span></div>
      <p class="cake__status" data-cake-status aria-live="polite">You will blow gently into your phone's microphone. Nothing is recorded.</p>
      <button class="link-btn" type="button" data-cake-tap>Can't blow? Tap instead</button>
    </div>
    <div class="cake__finale" data-cake-finale hidden>
      <span class="label label--accent" data-f-label>Your wish is on its way</span>
      <p class="display finale__title" data-f-title>Happy Birthday,<br /><em>${esc(c.herName)}</em></p>
      <span class="finale__rule" data-f-rule aria-hidden="true"></span>
      <p class="finale__line" data-f-line>${esc((c.cake.finaleLine || '').replace('{age}', c.age))}</p>
      <button class="link-btn" type="button" data-celebrate-again>Celebrate again</button>
    </div>
    ${cakeVideo(c)}
  </section>`;
}

function wishes(c) {
  return `
  <section class="section wishes" id="wishes" data-tone="tint" aria-labelledby="wishes-title">
    <div class="container">
      <header class="section-head">
        <span class="label" data-fade>Messages</span>
        <h2 class="title" id="wishes-title" data-split>${esc(c.wishes.title)}</h2>
        <p class="lede" data-fade>${esc(c.wishes.intro)}</p>
      </header>
      <div class="wishes__grid" data-wishes="friends"></div>
      <div class="wish-note" data-wish-note hidden></div>
      ${lovedPhotos(c)}
    </div>
  </section>`;
}

// A short clip that loops silently among the photos; tapping it plays it with sound.
function lovedVideo(p) {
  return `
            <div class="media lo-video" role="button" tabindex="0" data-lo-video="${esc(p.video)}" data-poster="${esc(p.poster || '')}" data-title="${esc(p.caption || '')}" aria-label="Play ${esc(p.caption || 'video')}, with sound">
              <video muted loop playsinline preload="metadata" ${p.poster ? `poster="${esc(p.poster)}"` : ''} aria-hidden="true"></video>
              <span class="lo-video__badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>
                Tap for sound
              </span>
            </div>`;
}

function lovedPhotos(c) {
  const photos = c.wishes.photos || [];
  if (!photos.length) return '';
  return `
      <div class="lo-photos">
        <h3 class="lo-photos__title" data-split>${esc(c.wishes.photosTitle || '')}</h3>
        <div class="lo-photos__grid">
          ${photos
            .map(
              (p) => `
          <figure class="lo-photo ${p.wide ? 'lo-photo--wide' : ''} ${p.video ? 'lo-photo--video' : ''}">
            ${p.video ? lovedVideo(p) : media(p.src, p.alt)}
            ${p.caption ? `<figcaption class="serif-italic">${esc(p.caption)}</figcaption>` : ''}
          </figure>`,
            )
            .join('')}
        </div>
      </div>`;
}

function fromMe(c) {
  return `
  <section class="section wishes wishes--me" id="from-me" data-tone="tint" aria-labelledby="me-title">
    <div class="container">
      <header class="section-head">
        <span class="label" data-fade>From ${esc(c.myName)}</span>
        <h2 class="title" id="me-title" data-split>${esc(c.fromMe.title)}</h2>
        <p class="lede" data-fade>${esc(c.fromMe.intro)}</p>
      </header>
      <div class="wish-note" data-wish-note hidden></div>
      <div class="wishes__grid wishes__grid--me" data-wishes="me"></div>
    </div>
  </section>`;
}

function jar(c) {
  return `
  <section class="section" id="jar" data-tone="white" aria-labelledby="jar-title">
    <div class="container jar">
      <header class="section-head" style="justify-items:center;margin-bottom:0">
        <span class="label" data-fade>Let it go</span>
        <h2 class="title" id="jar-title" data-split>${esc(c.wishJar.title)}</h2>
        <p class="lede" data-fade>${esc(c.wishJar.intro)}</p>
      </header>
      <div class="jar__vessel" data-jar data-fade>
        <svg viewBox="0 0 140 180" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
          <rect x="46" y="8" width="48" height="14" rx="3"/>
          <path d="M50 22 V34 C50 40 24 46 24 74 V160 C24 170 32 174 42 174 H98 C108 174 116 170 116 160 V74 C116 46 90 40 90 34 V22"/>
          <path d="M34 120 C60 112 80 128 106 118" stroke-opacity=".35"/>
        </svg>
      </div>
      <form class="jar__form" data-jar-form data-fade>
        <label class="sr-only" for="wish-input">Your wish</label>
        <input class="field" id="wish-input" name="wish" maxlength="80" autocomplete="off" placeholder="I wish..." required />
        <button class="btn" type="submit">Send the wish</button>
        <p class="form-note" data-jar-note aria-live="polite"></p>
      </form>
    </div>
  </section>`;
}

// A promise ring: a silver band with a faceted diamond and one soft glint.
const RING = `
  <svg class="ring" viewBox="0 0 120 112" role="img" aria-label="A ring">
    <defs>
      <linearGradient id="ring-band" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.45" stop-color="#d9dfdb" />
        <stop offset="0.7" stop-color="#9ea8a1" />
        <stop offset="1" stop-color="#e9ece9" />
      </linearGradient>
      <linearGradient id="ring-gem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="1" stop-color="#dfe8ec" />
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="74" rx="33" ry="29" fill="none" stroke="url(#ring-band)" stroke-width="7" />
    <ellipse cx="60" cy="74" rx="33" ry="29" fill="none" stroke="rgba(38,48,42,.18)" stroke-width="0.8" />
    <path d="M52 47 L55 41 M68 47 L65 41" stroke="#9ea8a1" stroke-width="2.4" stroke-linecap="round" />
    <g class="ring__gem">
      <polygon points="45,29 75,29 84,39 60,60 36,39" fill="url(#ring-gem)" stroke="var(--accent-700)" stroke-width="0.9" stroke-linejoin="round" />
      <path d="M36 39 H84 M45 29 L52 39 L60 29 L68 39 L75 29 M52 39 L60 60 L68 39" fill="none" stroke="var(--accent-700)" stroke-width="0.7" stroke-linejoin="round" opacity=".7" />
    </g>
    <path class="ring__glint" d="M88 16 L90 22 L96 24 L90 26 L88 32 L86 26 L80 24 L86 22 Z" fill="#ffffff" stroke="var(--accent-500)" stroke-width="0.6" />
  </svg>`;

// Each word rises in on reveal; the last word ("promise?") is set in italics with a drawn underline.
function promiseWords(title) {
  const words = String(title).split(/\s+/);
  return words
    .map((w, i) => `<span class="pw${i === words.length - 1 ? ' pw--accent' : ''}" aria-hidden="true"><span>${esc(w)}</span></span>`)
    .join(' ');
}

// Small hearts that drift up from the ring, each with its own position, size and timing.
function promiseHearts() {
  const hearts = [
    [22, 0, 10, -14],
    [70, 0.7, 13, 12],
    [40, 1.4, 9, -6],
    [84, 2.0, 10, 18],
    [12, 2.5, 12, -18],
  ];
  return `<span class="promise-hearts" aria-hidden="true">${hearts
    .map(([x, d, size, r]) => `<span style="--x:${x}%;--d:${d}s;--size:${size}px;--r:${r}deg">${heart}</span>`)
    .join('')}</span>`;
}

function scratch(c) {
  return `
  <section class="section" id="surprise" data-tone="tint" aria-labelledby="surprise-title">
    <div class="container">
      <header class="section-head" style="justify-items:center;text-align:center">
        <span class="label" data-fade>A surprise</span>
        <h2 class="title" id="surprise-title" data-split>${esc(c.scratch.title)}</h2>
        <p class="lede" data-fade>${esc(c.scratch.intro)}</p>
      </header>
      <div class="scratch-wrap" data-fade>
        <div class="scratch" data-scratch>
          <div class="scratch__reveal" aria-live="polite">
            ${c.scratch.ring ? `<span class="ring-wrap">${RING}${promiseHearts()}</span>` : ''}
            <h3 class="promise" aria-label="${esc(c.scratch.surpriseTitle)}">${promiseWords(c.scratch.surpriseTitle)}</h3>
            ${c.scratch.surpriseText ? `<p>${esc(c.scratch.surpriseText)}</p>` : ''}
          </div>
          <canvas class="scratch__canvas" data-scratch-canvas data-lenis-prevent aria-hidden="true"></canvas>
        </div>
        <button class="link-btn" type="button" data-scratch-reveal>Reveal without scratching</button>
      </div>
    </div>
  </section>`;
}

function closing(c) {
  return `
  <section class="section" id="closing" data-tone="white" aria-label="Closing">
    <div class="container closing">
      ${c.closing.photo ? media(c.closing.photo, c.closing.alt, 'closing__media') : ''}
      <h2 class="title" data-split>${esc(c.closing.line)}</h2>
      <p class="label">With love, ${esc(c.myName)}</p>
    </div>
  </section>`;
}

function footer(c) {
  return `
  <footer class="footer">
    <button class="egg-trigger" type="button" data-egg aria-label="A small secret">${heart}</button>
    <span class="label footer__label">Made for ${esc(c.herFullName || c.herName).replace(/-/g, '\u2011')}</span>
    <span class="label footer__label">With love, ${esc(c.myFullName || c.myName)}</span>
  </footer>`;
}

const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;

// Table of contents on the home page.
function chapters(c) {
  const items = c.chapters
    .filter((ch) => ch.page !== 'home')
    .map(
      (ch) => `
      <li>
        <a class="toc__link" href="${esc(ch.file)}" data-nav>
          <span class="label label--accent">${esc(ch.numeral)}</span>
          <span class="toc__title">${esc(fmt(c, ch.title))}</span>
          <span class="toc__line">${esc(fmt(c, ch.line))}</span>
          <span class="toc__arrow">${arrow}</span>
        </a>
      </li>`,
    )
    .join('');
  return `
  <section class="section toc" id="chapters" data-tone="white" aria-labelledby="toc-title">
    <div class="container">
      <header class="section-head">
        <span class="label" data-fade>Read in order</span>
        <h2 class="title" id="toc-title" data-split>The chapters</h2>
      </header>
      <ol class="toc__list" data-fade>${items}</ol>
    </div>
  </section>`;
}

// Large link to the following chapter at the end of each page.
function nextChapter(c, page) {
  const i = c.chapters.findIndex((ch) => ch.page === page);
  const next = c.chapters[i + 1];
  const target = next || c.chapters[0];
  return `
  <section class="section next" data-tone="white" aria-label="Next chapter">
    <div class="container">
      <a class="next__link" href="${esc(target.file)}" data-nav>
        <span class="label">${next ? 'Next' : 'Back to the beginning'} · ${esc(target.numeral)}</span>
        <span class="next__title">${esc(fmt(c, target.title))}</span>
        <span class="next__arrow">${arrow}</span>
      </a>
    </div>
  </section>`;
}

function chapterHead(c, page) {
  const ch = c.chapters.find((x) => x.page === page);
  return `
  <header class="section chapter-head" data-tone="white">
    <div class="container">
      <div class="chapter-head__meta" data-hero-fade>
        <span class="label label--accent">${esc(ch.numeral)}</span>
        <span class="label">${esc(c.herName)} turns ${esc(c.age)}</span>
      </div>
      <h1 class="display chapter-head__title" data-hero-split>${esc(fmt(c, ch.title))}</h1>
      <p class="lede" data-hero-fade>${esc(fmt(c, ch.line))}</p>
    </div>
  </header>`;
}

// Fixed "Chapters" button and the full-screen menu it opens.
export function renderNav(c, page) {
  const el = document.getElementById('nav');
  const links = c.chapters
    .map(
      (ch) => `
      <li><a class="menu__link" href="${esc(ch.file)}" data-nav ${ch.page === page ? 'aria-current="page"' : ''}>
        <span class="label ${ch.page === page ? 'label--accent' : ''}">${esc(ch.numeral)}</span>
        <span class="menu__title">${esc(fmt(c, ch.title))}</span>
      </a></li>`,
    )
    .join('');
  el.innerHTML = `
    <button class="nav__toggle" type="button" aria-haspopup="dialog" aria-controls="menu" data-menu-open>Chapters</button>
    <div class="overlay menu" id="menu" hidden>
      <div class="overlay__backdrop"></div>
      <button class="icon-btn overlay__close" type="button" data-close aria-label="Close menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <nav class="menu__inner" aria-label="Chapters" data-dismiss data-lenis-prevent>
        <span class="label">For ${esc(c.herName)}</span>
        <ol class="menu__list">${links}</ol>
      </nav>
    </div>`;
}

const PAGES = {
  home: (c) => [hero(c), cake(c), statement(c), chapters(c)],
  letter: (c) => [chapterHead(c, 'letter'), letterStory(c)],
  love: (c) => [chapterHead(c, 'love'), reasons(c)],
  friends: (c) => [chapterHead(c, 'friends'), wishes(c)],
  me: (c) => [chapterHead(c, 'me'), fromMe(c), jar(c), scratch(c), closing(c)],
};

export function renderPage(c, page) {
  const ch = c.chapters.find((x) => x.page === page);
  document.title = page === 'home' ? c.meta.title : `${fmt(c, ch.title)} · ${c.meta.title}`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', c.meta.description);
  const sections = PAGES[page](c);
  if (page !== 'home') sections.push(nextChapter(c, page));
  sections.push(footer(c));
  document.getElementById('main').innerHTML = sections.join('');
  renderNav(c, page);
}
