// Kollect — interações da página. Sem dependências.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Cabeçalho: ganha fundo depois que a página rola. */
const header = document.querySelector('[data-header]');
const sentinel = Object.assign(document.createElement('div'), { ariaHidden: 'true' });
sentinel.style.cssText = 'position:absolute;top:0;height:24px;width:1px;pointer-events:none';
document.body.prepend(sentinel);
new IntersectionObserver(([entry]) => header.toggleAttribute('data-scrolled', !entry.isIntersecting)).observe(sentinel);

/* Menu no celular. */
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const setMenu = (open) => {
  toggle.setAttribute('aria-expanded', String(open));
  menu.toggleAttribute('data-open', open);
  header.toggleAttribute('data-open', open);
};
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});
window.matchMedia('(min-width: 1000px)').addEventListener('change', () => setMenu(false));

/* Catálogo: filtros por tipo, universo e disponibilidade, exibido em páginas. */
const filters = document.querySelector('[data-filters]');
const list = document.querySelector('[data-items]');
const items = [...list.children];
const count = document.querySelector('[data-count]');
const empty = document.querySelector('[data-empty]');
const more = document.querySelector('[data-more]');
const universeSelect = filters.querySelector('select[name="universo"]');
const onlyAvailable = filters.querySelector('input[name="disponiveis"]');
const pageSize = Number(list.dataset.pageSize) || 12;
const typeRadio = (value) => filters.querySelector(`input[name="tipo"][value="${value}"]`);
let limit = pageSize;
filters.hidden = false;

function applyFilters() {
  const type = filters.querySelector('input[name="tipo"]:checked').value;
  const universe = universeSelect.value;
  const matches = items.filter(
    (item) =>
      (type === 'all' || item.dataset.type === type) &&
      (universe === 'all' || item.dataset.universe === universe) &&
      !(onlyAvailable?.checked && item.hasAttribute('data-soldout')),
  );
  for (const item of items) item.hidden = true;
  matches.forEach((item, i) => {
    item.hidden = i >= limit;
  });
  count.textContent = `${matches.length} ${matches.length === 1 ? 'peça' : 'peças'}`;
  writeUrl(type, universe);
  empty.hidden = matches.length > 0;
  const rest = matches.length - limit;
  more.hidden = rest <= 0;
  more.textContent =
    rest > pageSize ? `Mostrar mais ${pageSize} peças (faltam ${rest})` : `Mostrar ${rest === 1 ? 'a última peça' : `as últimas ${rest} peças`}`;
}

// Filtros no endereço (?tipo=&universo=&disponiveis=1): o link filtrado pode ser compartilhado.
function writeUrl(type, universe) {
  const url = new URL(window.location.href);
  const set = (key, value) => (value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
  set('tipo', type === 'all' ? '' : type);
  set('universo', universe === 'all' ? '' : universe);
  set('disponiveis', onlyAvailable?.checked ? '1' : '');
  if (url.href !== window.location.href) history.replaceState(null, '', url);
}
function readUrl() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('tipo');
  const universe = params.get('universo');
  if (type && typeRadio(type)) typeRadio(type).checked = true;
  if (universe && universeSelect.querySelector(`option[value="${CSS.escape(universe)}"]`)) universeSelect.value = universe;
  if (onlyAvailable) onlyAvailable.checked = params.get('disponiveis') === '1';
}
readUrl();

filters.addEventListener('change', () => {
  limit = pageSize;
  applyFilters();
});
more.addEventListener('click', () => {
  const firstNew = items.filter((item) => item.hidden === false).length;
  limit += pageSize;
  applyFilters();
  // Leva o foco para a primeira peça nova, para quem navega pelo teclado.
  const next = items.filter((item) => !item.hidden)[firstNew];
  next?.querySelector('a')?.focus({ preventScroll: true });
});
document.querySelector('[data-reset]').addEventListener('click', () => {
  typeRadio('all').checked = true;
  universeSelect.value = 'all';
  if (onlyAvailable) onlyAvailable.checked = false;
  limit = pageSize;
  applyFilters();
  typeRadio('all').focus();
});
applyFilters();

/* Links de universo aplicam o filtro correspondente no catálogo. */
for (const link of document.querySelectorAll('[data-universe-link]')) {
  link.addEventListener('click', () => {
    universeSelect.value = link.dataset.universeLink;
    typeRadio('all').checked = true;
    if (onlyAvailable) onlyAvailable.checked = false;
    limit = pageSize;
    applyFilters();
  });
}

/* Filme da marca no hero: escolhe 16:9 ou 9:16, toca mudo em loop e pausa fora da tela. */
const film = document.querySelector('[data-film]');
if (film) {
  const video = film.querySelector('[data-film-video]');
  const controls = film.querySelector('[data-film-controls]');
  const playBtn = film.querySelector('[data-film-play]');
  const soundBtn = film.querySelector('[data-film-sound]');
  // Mesma regra do <picture> do pôster e do CSS do hero.
  const tall = window.matchMedia('(max-aspect-ratio: 4/5)');
  let loaded = false;
  let userPaused = reduceMotion.matches;
  let visible = false;

  const format = () => (tall.matches ? 'tall' : 'wide');
  // Full HD (60 fps) quando a tela tem pixels para isso e a conexão não pede economia; senão, 720p.
  const quality = () => {
    const conn = navigator.connection;
    if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? '')) return 'sd';
    const px = window.innerWidth * Math.min(window.devicePixelRatio || 1, 3);
    return px > (tall.matches ? 760 : 1400) ? 'hd' : 'sd';
  };
  const src = (ext) => film.dataset.src.replace('{format}', format()).replace('{quality}', quality()).replace('{ext}', ext);
  const load = () => {
    const time = video.currentTime;
    video.replaceChildren(
      Object.assign(document.createElement('source'), { src: src('webm'), type: 'video/webm' }),
      Object.assign(document.createElement('source'), { src: src('mp4'), type: 'video/mp4' }),
    );
    video.load();
    if (time) video.currentTime = time;
    loaded = true;
    controls.hidden = false;
  };
  const sync = () => {
    const playing = !userPaused && visible;
    if (playing) video.play().catch(() => {});
    else video.pause();
    setIcon(playBtn, !userPaused, userPaused ? 'Reproduzir filme' : 'Pausar filme');
  };

  // Ícone ligado/desligado e rótulo acessível que diz a próxima ação.
  function setIcon(btn, on, label) {
    btn.querySelector('[data-icon-on]').hidden = !on;
    btn.querySelector('[data-icon-off]').hidden = on;
    btn.setAttribute('aria-label', label);
  }

  // Quando o filme mostra "Colecione seu mundo.", o título do hero sai de cena até o loop recomeçar.
  const taglineFrom = Number(film.dataset.taglineFrom) || Infinity;
  video.addEventListener('timeupdate', () => {
    film.toggleAttribute('data-tagline', !video.paused && video.currentTime >= taglineFrom);
  });
  video.addEventListener('pause', () => film.removeAttribute('data-tagline'));

  video.addEventListener('playing', () => video.classList.add('is-playing'));
  playBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    if (!loaded) load();
    sync();
  });
  soundBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    setIcon(soundBtn, video.muted, video.muted ? 'Ativar som do filme' : 'Desativar som do filme');
    if (!video.muted && userPaused) {
      userPaused = false;
      sync();
    }
  });
  tall.addEventListener('change', () => {
    video.classList.remove('is-playing');
    if (loaded) load();
    sync();
  });

  // Carrega um pouco antes de aparecer; toca só enquanto estiver visível.
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !loaded) load();
    },
    { rootMargin: '400px 0px' },
  ).observe(film);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (loaded) sync();
    },
    { threshold: 0.35 },
  ).observe(film);
  video.addEventListener('loadeddata', sync);
  if (reduceMotion.matches) controls.hidden = false;
}

/* Luz que acompanha o cursor nas caixas e botões magnéticos (só mouse/trackpad, sem movimento reduzido). */
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (finePointer.matches) {
  for (const el of document.querySelectorAll('[data-spotlight]')) {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
  if (!reduceMotion.matches) {
    for (const btn of document.querySelectorAll('[data-magnetic]')) {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
        btn.style.setProperty('--ty', `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.removeProperty('--tx');
        btn.style.removeProperty('--ty');
      });
    }
  }
}

/* Revelação das fotos ao rolar. */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-lit');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-lit'));
}
