// Blur reveal: o texto aparece letra a letra, saindo do desfoque.
// Port em JavaScript puro do componente BlurReveal da Spell UI (que usa motion/react).
//
// Uso: <h2 data-blur-reveal>…</h2>            revela ao carregar
//      <h2 data-blur-reveal="view">…</h2>      revela ao entrar na tela (uma vez)
// Opções: data-delay (s, padrão 0), data-speed-reveal (padrão 1.5), data-speed-segment (padrão 0.5).
// Elementos internos (spans de linha, cores) são preservados. Leitores de tela recebem o texto inteiro.
(() => {
  const els = document.querySelectorAll('[data-blur-reveal]');
  if (!els.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function split(el) {
    let index = 0;
    const visual = document.createElement('span');
    visual.className = 'br-visual';
    visual.setAttribute('aria-hidden', 'true');

    const walk = (node, into) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          for (const part of parts) {
            if (!part) continue;
            if (/^\s+$/.test(part)) {
              into.append(' ');
              continue;
            }
            const word = document.createElement('span');
            word.className = 'br-word';
            for (const char of part) {
              const c = document.createElement('span');
              c.className = 'br-char';
              c.style.setProperty('--i', index++);
              c.textContent = char;
              word.append(c);
            }
            into.append(word);
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const copy = child.cloneNode(false);
          copy.removeAttribute('id');
          walk(child, copy);
          into.append(copy);
        }
      }
    };
    walk(el, visual);

    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    el.replaceChildren(label, visual);

    const speedReveal = Number(el.dataset.speedReveal) || 1.5;
    const speedSegment = Number(el.dataset.speedSegment) || 0.5;
    el.style.setProperty('--br-stagger', `${0.03 / speedReveal}s`);
    el.style.setProperty('--br-duration', `${0.3 / speedSegment}s`);
    el.style.setProperty('--br-delay', `${Number(el.dataset.delay) || 0}s`);
    el.classList.add('is-split');
  }

  const reveal = (el) => requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-revealed')));

  if (reduce) {
    els.forEach((el) => el.classList.add('is-split', 'is-revealed'));
    return;
  }

  const io =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              reveal(entry.target);
              io.unobserve(entry.target);
            }
          },
          { rootMargin: '0px 0px -12% 0px' },
        )
      : null;

  for (const el of els) {
    split(el);
    if (el.dataset.blurReveal === 'view' && io) io.observe(el);
    else reveal(el);
  }
})();
