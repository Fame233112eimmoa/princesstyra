// Wraps each word in a mask so it can rise into view. Keeps <em> styling and explicit .line spans.
export function splitWords(el) {
  if (el.dataset.splitDone) return [...el.querySelectorAll('.word > span')];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
          } else {
            const outer = document.createElement('span');
            outer.className = 'word';
            const inner = document.createElement('span');
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
  el.dataset.splitDone = '1';
  return [...el.querySelectorAll('.word > span')];
}
