import { gsap } from 'gsap';
import { $ } from './util.js';
import { createModal, CLOSE_BUTTON } from './modal.js';

// Full-screen video player shared by the wishes pages and the cake moment.
export function createPlayer({ scroll, music }) {
  const el = document.getElementById('player');
  el.innerHTML = `
    <div class="overlay__backdrop"></div>
    ${CLOSE_BUTTON}
    <div class="player__stage">
      <div class="player__frame">
        <video controls playsinline preload="metadata"></video>
        <p class="player__title"></p>
      </div>
    </div>`;
  const video = $('video', el);
  const title = $('.player__title', el);
  let onWatched = null;

  const modal = createModal(el, {
    scroll,
    label: 'Video message',
    onClose: () =>
      gsap.to(el, { opacity: 0, duration: 0.4, ease: 'power2.out' }).then(() => {
        video.pause();
        video.removeAttribute('src');
        video.removeAttribute('poster');
        video.load();
        music.unduck();
      }),
  });

  const watched = () => {
    onWatched?.();
    onWatched = null;
  };
  video.addEventListener('timeupdate', () => {
    if (video.duration && video.currentTime / video.duration > 0.9) watched();
  });
  video.addEventListener('ended', watched);

  return {
    play({ src, poster, heading, done }) {
      onWatched = done || null;
      music.duck();
      video.src = src;
      if (poster) video.poster = poster;
      title.textContent = heading || '';
      modal.open();
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo($('.player__frame', el), { y: 40, scale: 0.96 }, { y: 0, scale: 1, duration: 0.9, ease: 'expo.out' });
      video.play().catch(() => {});
    },
  };
}
