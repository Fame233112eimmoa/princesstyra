import { gsap } from 'gsap';
import { esc, fileExists, imageExists, storage, $, $$ } from './util.js';

const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>`;
const LOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;
const KEY = 'bday-watched';
const MIC = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>`;
const PAUSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>`;

const fileFor = (config, page) => config.chapters.find((c) => c.page === page)?.file || 'index.html';

// Video cards for either chapter: mode "friends" (wishes from friends) or "me" (your own videos).
export function initWishes(config, { player, petals, music, mode }) {
  const grid = $(`[data-wishes="${mode}"]`);
  const note = $('[data-wish-note]', grid.closest('section'));
  // "Your twin" reads as "From your twin" and "Baby sister Jo" as "From your baby sister Jo" in the player.
  const from = (name) => {
    if (/^Your\s/.test(name)) return `From y${name.slice(1)}`;
    if (/^Baby\s/.test(name)) return `From your b${name.slice(1)}`;
    if (/^(All|A)\s/.test(name)) return `From a${name.slice(1)}`;
    return `From ${name}`;
  };
  const friends = config.wishes.friends.map((f, i) => ({ ...f, id: `friend-${i}`, label: f.relation, heading: f.name, playerTitle: from(f.name) }));
  const mine = config.fromMe.videos.map((v, i) => ({ ...v, id: `me-${i}`, label: v.note, heading: v.title, playerTitle: v.title, initial: config.myName }));
  const entries = mode === 'me' ? mine : friends;
  const lockMine = mode === 'me' && config.fromMe.lockUntilFriendsWatched;

  const watched = new Set(storage.get(KEY, []));
  const available = new Map();

  grid.innerHTML = entries
    .map(
      (e, i) => `
      <button class="wish ${mode === 'me' ? 'wish--feature' : ''} ${e.audio ? 'wish--voice' : ''}" type="button" data-wish="${e.id}" disabled>
        <span class="wish__thumb">${e.audio ? `<span class="wish__mic">${MIC}</span><span class="wish__wave" aria-hidden="true">${'<i></i>'.repeat(5)}</span>` : `<span class="wish__initial" aria-hidden="true">${esc((e.initial || e.heading).charAt(0))}</span>`}</span>
        <span class="wish__body">
          <span class="label ${mode === 'me' ? 'label--accent' : ''}">${mode === 'me' ? (entries.length > 1 ? `Video ${String(i + 1).padStart(2, '0')}` : 'For you') : esc(e.label || '')}</span>
          <span class="wish__name">${esc(e.heading)}</span>
          ${mode === 'me' && e.label ? `<span class="wish__note">${esc(e.label)}</span>` : ''}
          <span class="wish__state">Checking...</span>
          ${e.audio ? '<span class="wish__progress" aria-hidden="true"><span></span></span>' : ''}
        </span>
      </button>`,
    )
    .join('');

  const card = (id) => $(`[data-wish="${id}"]`, grid);

  function friendProgress() {
    const list = friends.filter((f) => available.get(f.id));
    return { done: list.filter((f) => watched.has(f.id)).length, total: list.length };
  }

  function showNote(html) {
    note.innerHTML = html;
    note.hidden = false;
  }

  function refresh() {
    const { done, total } = friendProgress();
    const locked = lockMine && done < total;

    entries.forEach((e) => {
      const el = card(e.id);
      const has = available.get(e.id);
      const state = $('.wish__state', el);
      el.classList.toggle('wish--missing', !has);
      el.classList.toggle('is-watched', watched.has(e.id));
      el.classList.toggle('is-locked', has && locked);
      el.disabled = !has || locked;
      if (!has) state.textContent = 'Coming soon';
      else if (locked) state.innerHTML = `<span class="wish__lock">${LOCK}Locked for now</span>`;
      else if (e.audio) state.textContent = watched.has(e.id) ? 'Listened · tap to hear again' : 'Tap to listen';
      else state.textContent = watched.has(e.id) ? 'Watched · tap to replay' : 'Tap to play';
      el.setAttribute('aria-label', `${e.playerTitle}. ${state.textContent}`);
    });

    if (mode === 'me' && locked) {
      showNote(`
        <span class="wish__lock">${LOCK}<span class="label label--accent">${esc(config.fromMe.lockedText)}</span></span>
        <p>${done} of ${total} watched. These open as soon as you have seen them all.</p>
        <a class="next__inline" href="${esc(fileFor(config, 'friends'))}" data-nav>Go to Your loved ones ${ARROW}</a>`);
    } else if (mode === 'me') {
      note.hidden = true;
    }

    if (mode === 'friends' && total > 0 && done >= total) {
      showNote(`
        <span class="label label--accent">That is everyone</span>
        <p>Every wish from your loved ones, watched. Now there are a few from me.</p>
        <a class="next__inline" href="${esc(fileFor(config, 'me'))}" data-nav>Watch my wishes for you ${ARROW}</a>`);
    }
  }

  function markWatched(id) {
    if (watched.has(id)) return;
    const before = friendProgress();
    watched.add(id);
    storage.set(KEY, [...watched]);
    refresh();
    const after = friendProgress();
    if (mode === 'friends' && before.done < before.total && after.done >= after.total) {
      petals.shower(22);
      gsap.from(note, { y: 20, opacity: 0, duration: 1.2, ease: 'power3.out' });
    }
  }

  async function addThumb(e) {
    if (e.audio) {
      available.set(e.id, await fileExists(e.audio, 'audio'));
      return;
    }
    const [hasVideo, hasPoster] = await Promise.all([fileExists(e.video, 'video'), imageExists(e.poster)]);
    available.set(e.id, hasVideo);
    const el = card(e.id);
    if (!el) return;
    const thumb = $('.wish__thumb', el);
    if (hasPoster) {
      thumb.insertAdjacentHTML('afterbegin', `<img src="${esc(e.poster)}" alt="" loading="lazy" decoding="async" />`);
      $('.wish__initial', thumb)?.remove();
      const img = $('img', thumb);
      const mark = () => el.classList.toggle('wish--landscape', img.naturalWidth > img.naturalHeight);
      img.complete ? mark() : img.addEventListener('load', mark, { once: true });
    }
    if (hasVideo) thumb.insertAdjacentHTML('beforeend', `<span class="wish__play">${PLAY}</span>`);
  }

  // My chapter also needs to know which friend videos exist, to decide whether it is unlocked.
  const checks = entries.map(addThumb);
  if (mode === 'me') checks.push(...friends.map(async (f) => available.set(f.id, await fileExists(f.video, 'video'))));
  Promise.all(checks).then(refresh);

  grid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-wish]');
    if (!btn || btn.disabled) return;
    const entry = entries.find((e) => e.id === btn.dataset.wish);
    if (entry.audio) return toggleVoice(entry, btn);
    stopVoice();
    player.play({
      src: entry.video,
      poster: $('.wish__thumb img', btn) ? entry.poster : '',
      heading: entry.playerTitle,
      done: () => markWatched(entry.id),
    });
  });

  // Voice notes play right on their card, with a progress bar; background music pauses meanwhile.
  const voice = new Audio();
  voice.preload = 'none';
  let voiceCard = null;
  let voiceEntry = null;

  function setVoiceUi(playing) {
    if (!voiceCard) return;
    voiceCard.classList.toggle('is-playing', playing);
    $('.wish__mic', voiceCard).innerHTML = playing ? PAUSE : MIC;
    if (playing) $('.wish__state', voiceCard).textContent = 'Playing…';
  }

  function stopVoice() {
    if (!voiceCard) return;
    voice.pause();
    setVoiceUi(false);
    music.unduck();
  }

  function toggleVoice(entry, btn) {
    if (voiceCard === btn && !voice.paused) return stopVoice();
    if (voiceCard !== btn) {
      stopVoice();
      voiceCard = btn;
      voiceEntry = entry;
      voice.src = entry.audio;
    }
    music.duck();
    voice.play().then(() => setVoiceUi(true)).catch(() => {});
  }

  voice.addEventListener('pause', () => {
    if (voiceCard && !voice.ended && voice.currentTime > 0) $('.wish__state', voiceCard).textContent = 'Paused · tap to continue';
  });
  voice.addEventListener('timeupdate', () => {
    if (!voiceCard || !voice.duration || voice.paused) return;
    $('.wish__progress span', voiceCard).style.transform = `scaleX(${voice.currentTime / voice.duration})`;
    const left = Math.max(0, Math.ceil(voice.duration - voice.currentTime));
    $('.wish__state', voiceCard).textContent = `Playing · 0:${String(left).padStart(2, '0')}`;
  });
  voice.addEventListener('ended', () => {
    $('.wish__progress span', voiceCard).style.transform = 'scaleX(0)';
    setVoiceUi(false);
    music.unduck();
    markWatched(voiceEntry.id);
    refresh();
  });
  window.addEventListener('pagehide', () => voice.pause());

  // Videos inside the photo collage: silent loop while visible, full player with sound on tap.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('[data-lo-video]').forEach((tile) => {
    const clip = $('video', tile);
    clip.src = tile.dataset.loVideo;
    if (!reduced) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? clip.play().catch(() => {}) : clip.pause()), { threshold: 0.3 }).observe(tile);
    }
    const open = () => {
      clip.pause();
      player.play({ src: tile.dataset.loVideo, poster: tile.dataset.poster, heading: from(tile.dataset.title || 'All of us') });
    };
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open()));
  });

  return { entries: () => $$('.wish', grid) };
}
