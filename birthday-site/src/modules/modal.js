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

  // Tapping the backdrop or any empty area marked data-dismiss closes it.
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target.classList.contains('overlay__backdrop') || e.target.hasAttribute('data-dismiss')) close();
  });

  function open() {
    if (isOpen) return;
    isOpen = true;
    gsap.killTweensOf(el);
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
    // It may have been reopened while the closing fade was running.
    if (isOpen) return;
    el.hidden = true;
    gsap.set(el, { clearProps: 'opacity' });
    scroll.resume();
    returnFocus?.focus?.({ preventScroll: true });
  }

  // Hide at once, without animation (e.g. when the browser restores the page from Back).
  function reset() {
    isOpen = false;
    document.removeEventListener('keydown', onKey);
    gsap.killTweensOf(el);
    el.hidden = true;
    gsap.set(el, { clearProps: 'opacity' });
    scroll.resume();
  }

  return { open, close, reset, get isOpen() { return isOpen; } };
}
