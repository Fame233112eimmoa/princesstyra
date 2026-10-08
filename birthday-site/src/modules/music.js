import { esc, fileExists, session, $ } from './util.js';

const icons = {
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>`,
};

export function createMusic(config) {
  const cfg = config.music || {};
  const el = document.getElementById('music');
  const audio = new Audio();
  audio.preload = 'none';
  let tracks = [];
  let index = 0;
  let wanted = false; // she asked for music
  let ducked = false;
  let ready = Promise.resolve();
  let sfx = null;

  // iOS only lets audio play later if the element was started during a tap, so warm the cue up early.
  function primeCue() {
    if (!cfg.cue || sfx) return;
    sfx = new Audio(cfg.cue);
    sfx.muted = true;
    sfx
      .play()
      .then(() => {
        sfx.pause();
        sfx.currentTime = 0;
        sfx.muted = false;
      })
      .catch(() => {
        sfx.muted = false;
      });
  }

  const setPlaying = () => el.classList.toggle('is-playing', !audio.paused);

  function render() {
    el.innerHTML = `
      <div class="music__panel" id="music-panel" hidden>
        <span class="label">Our songs</span>
        <ol>${tracks
          .map(
            (t, i) => `<li><button class="music__track" type="button" data-track="${i}"><span class="label" style="padding:0">${String(i + 1).padStart(2, '0')}</span><span>${esc(t.title)}<small>${esc(t.artist || '')}</small></span></button></li>`,
          )
          .join('')}</ol>
      </div>
      ${tracks.length > 1 ? `<button class="music__list-btn" type="button" aria-expanded="false" aria-controls="music-panel">Songs</button>` : ''}
      <button class="icon-btn music__toggle" type="button" aria-label="Play music" aria-pressed="false">
        <span class="music__bars" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>`;
    const toggle = $('.music__toggle', el);
    const listBtn = $('.music__list-btn', el);
    const panel = $('.music__panel', el);
    toggle.addEventListener('click', () => (audio.paused ? play() : pause()));
    listBtn?.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      listBtn.setAttribute('aria-expanded', String(!panel.hidden));
    });
    panel.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-track]');
      if (!btn) return;
      load(Number(btn.dataset.track));
      play();
      panel.hidden = true;
      listBtn?.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', (e) => {
      if (!el.contains(e.target) && !panel.hidden) {
        panel.hidden = true;
        listBtn?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function updateUi() {
    setPlaying();
    const toggle = $('.music__toggle', el);
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(!audio.paused));
    toggle.setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
    el.querySelectorAll('[data-track]').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.track) === index)));
  }

  function load(i) {
    index = (i + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
    updateUi();
  }

  function play() {
    if (!tracks.length) return;
    wanted = true;
    if (!audio.src) load(index);
    audio.play().catch(() => {});
  }

  function pause() {
    wanted = false;
    audio.pause();
  }

  audio.addEventListener('play', updateUi);
  audio.addEventListener('pause', updateUi);
  audio.addEventListener('ended', () => {
    load(index + 1);
    play();
  });
  audio.addEventListener('error', () => {
    if (tracks.length > 1 && wanted) {
      load(index + 1);
      play();
    }
  });

  const KEY = 'bday-music';
  function save() {
    session.set(KEY, JSON.stringify({ index, time: audio.currentTime || 0, playing: wanted && !audio.paused }));
  }
  window.addEventListener('pagehide', save);

  // Pick the song back up where the previous page left it. Browsers may need one tap first.
  function restore() {
    let saved = null;
    try {
      saved = JSON.parse(session.get(KEY) || 'null');
    } catch {}
    if (!saved?.playing || !tracks.length) return;
    load(saved.index || 0);
    audio.addEventListener('loadedmetadata', () => (audio.currentTime = Math.min(saved.time || 0, (audio.duration || 1) - 1)), { once: true });
    wanted = true;
    audio.play().catch(() => {
      const resume = () => {
        if (wanted && audio.paused) audio.play().catch(() => {});
      };
      document.addEventListener('pointerdown', resume, { once: true });
      document.addEventListener('keydown', resume, { once: true });
    });
  }

  if (cfg.enabled && cfg.tracks?.length) {
    ready = Promise.all(cfg.tracks.map((t) => fileExists(t.src, 'audio'))).then((ok) => {
      tracks = cfg.tracks.filter((_, i) => ok[i]);
      if (!tracks.length) return;
      render();
      el.hidden = false;
      updateUi();
      restore();
    });
  }

  return {
    save,
    primeCue,
    // Called from the "Open" tap: the gesture browsers need before audio can play.
    startFromGesture() {
      primeCue();
      if (!cfg.enabled || !cfg.startOnOpen) return;
      // Prime playback synchronously inside the gesture, then confirm once we know the files exist.
      if (cfg.tracks?.length) {
        audio.src = cfg.tracks[0].src;
        audio.play().catch(() => {});
        wanted = true;
      }
      ready.then(() => {
        if (!tracks.length) {
          audio.pause();
          audio.removeAttribute('src');
          wanted = false;
          return;
        }
        if (!audio.src.endsWith(tracks[0].src) || audio.error) {
          load(0);
          audio.play().catch(() => {});
        }
        updateUi();
      });
    },
    duck() {
      if (!audio.paused) {
        ducked = true;
        audio.pause();
      }
    },
    unduck() {
      if (ducked && wanted) audio.play().catch(() => {});
      ducked = false;
    },
    cue() {
      if (cfg.cue) {
        primeCue();
        sfx.currentTime = 0;
        sfx.play().catch(() => {});
      } else if (cfg.enabled && tracks.length && audio.paused) {
        play();
      }
    },
  };
}
