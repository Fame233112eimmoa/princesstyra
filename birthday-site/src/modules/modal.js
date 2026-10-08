import { gsap } from 'gsap';

const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
export const CLOSE_BUTTON = `<button class="icon-btn overlay__close" type="button" data-close aria-label="Close">${closeIcon}</button>`;

// Minimal accessible dialog: freezes scroll, traps Tab, closes on Escape / backdrop / close button.
export function createModal(el, { scroll, label, onClose }) {
  let returnFocus = null;
  let isOpen = false;

  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  if (label) el.setAttribute('aria-label', label);

  const focusables = () => [...el.querySelectorAll('button, [href], input, video[controls], [tabindex]:not([tabindex="-1"])')].filter((n) => !n.disabled);

  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target.classList.contains('overlay__backdrop')) close();
  });

  function open() {
    if (isOpen) return;
    isOpen = true;
    returnFocus = document.activeElement;
    el.hidden = false;
    scroll.pause();
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => el.querySelector('[data-close]')?.focus({ preventScroll: true }));
  }

  async function close() {
    if (!isOpen) return;
    isOpen = false;
    document.removeEventListener('keydown', onKey);
    await onClose?.();
    el.hidden = true;
    gsap.set(el, { clearProps: 'opacity' });
    scroll.resume();
    returnFocus?.focus?.({ preventScroll: true });
  }

  return { open, close, get isOpen() { return isOpen; } };
}
