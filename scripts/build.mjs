// Gera dist/ a partir de content/, src/ e public/.
// Uso: npm run build
import fs from 'node:fs/promises';
import path from 'node:path';
import { site } from '../content/site.js';
import { catalog, featuredPieces, universes, types, hero, spot, spotlight, store, storeEnabled, tcg, notFound, film, categories, series, seriesPieces } from './lib/catalog.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'public/img/manifest.json'), 'utf8'));
const logoFull = await (await import('sharp')).default(path.join(root, 'public/img/logo-kollect.png')).metadata();
const PAGE_SIZE = 12;

// Ícones Phosphor (regular), lidos do pacote @phosphor-icons/core no build.
const iconDir = path.join(root, 'node_modules/@phosphor-icons/core/assets/regular');
const icon = async (name) =>
  (await fs.readFile(path.join(iconDir, `${name}.svg`), 'utf8')).replace('<svg ', '<svg aria-hidden="true" focusable="false" width="20" height="20" ');
const ICONS = Object.fromEntries(
  await Promise.all(['pause', 'play', 'speaker-high', 'speaker-slash'].map(async (n) => [n, await icon(n)])),
);

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const ORIGIN = { oficial: 'Produto oficial', customizada: 'Customizada', 'impressa-3d': 'Impressa em 3D' };
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const plural = (n, one = 'peça', many = 'peças') => `${n} ${n === 1 ? one : many}`;

// ---------- Canais ----------

const { contact: c, social } = site;
const shops = { ...site.shops, store: storeEnabled ? site.shops?.store : null };
const policies = site.policies.filter((p) => storeEnabled || !p.store);
const wa = c.whatsapp && `https://wa.me/${c.whatsapp.replace(/\D/g, '')}`;
const waText = (msg) => (wa ? `${wa}?text=${encodeURIComponent(msg)}` : null);
const consultHref = (msg) =>
  waText(msg) ||
  (c.instagram && `https://ig.me/m/${c.instagram}`) ||
  (c.email && `mailto:${c.email}?subject=${encodeURIComponent('Consulta Kollect')}&body=${encodeURIComponent(msg)}`) ||
  shops?.store ||
  '#encomendas';
const hasChannel = Boolean(wa || c.instagram || c.email);
const link = (href) => `href="${esc(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}`;
const newTab = '<span class="sr-only"> (abre em nova aba)</span>';
const ext = (href) => (href.startsWith('http') ? newTab : '');
const pieceLabel = (p) => `${p.name}${p.line ? ` (${p.line})` : ''}`;

// ---------- Imagens ----------

function picture(name, { alt, sizes, eager = false, className = '' }) {
  const m = manifest[name];
  if (!m) throw new Error(`Imagem sem manifesto: ${name}. Rode npm run images.`);
  const set = (ext) => m.widths.map((w) => `img/${name}-${w}.${ext} ${w}w`).join(', ');
  const fallback = m.widths.find((w) => w >= 700) ?? m.widths.at(-1);
  return `<picture${className ? ` class="${className}"` : ''}>
      <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
      <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
      <img src="img/${name}-${fallback}.webp" width="${m.width}" height="${m.height}" alt="${esc(alt)}"${
        eager ? ' fetchpriority="high"' : ' loading="lazy"'
      } decoding="async">
    </picture>`;
}

// ---------- Fragmentos de peça ----------

const universeName = (p) => (p.universe ? universes[p.universe]?.name : null);
const seriesLine = (p) => [p.line, p.height].filter(Boolean).join(', ');

function priceBlock(p) {
  if (p.price == null) return `<p class="price price--ask">Valor sob consulta</p>`;
  const now = `<span class="price__now">${p.compareAt ? '<span class="sr-only">Por </span>' : ''}${brl.format(p.price)}</span>`;
  const before = p.compareAt ? ` <del class="price__before"><span class="sr-only">De </span>${brl.format(p.compareAt)}</del>` : '';
  return `<p class="price">${now}${before}</p>`;
}

function stockBlock(p) {
  if (p.availability === 'esgotado') return `<p class="stock" data-stock="esgotado">Esgotado</p>`;
  if (p.lastUnit) return `<p class="stock" data-stock="ultima">Última unidade</p>`;
  if (p.availability === 'disponivel') return `<p class="stock" data-stock="disponivel">Disponível na loja</p>`;
  return '';
}

function action(p, { variant = 'btn--line', className } = {}) {
  const cls = className ?? `btn ${variant}`;
  if (p.availability === 'esgotado')
    return `<a class="${cls}" ${link(consultHref(`Olá, Kollect! Quero ser avisado quando ${pieceLabel(p)} voltar ao estoque.`))}>Avisar quando chegar<span class="sr-only">: ${esc(p.name)}</span>${ext(consultHref(''))}</a>`;
  if (p.buyUrl) return `<a class="${cls}" ${link(p.buyUrl)}>Comprar<span class="sr-only"> ${esc(p.name)} na loja virtual</span>${newTab}</a>`;
  const href = consultHref(`Olá, Kollect! Quero consultar a peça ${pieceLabel(p)}${universeName(p) ? `, de ${universeName(p)}` : ''}.`);
  return `<a class="${cls}" ${link(href)}>Consultar<span class="sr-only"> ${esc(p.name)}</span>${ext(href)}</a>`;
}

function featuredCard(p, i) {
  const specs = [
    ['Altura', p.height],
    ['Escala', p.scale],
    ['Fabricante', p.manufacturer],
    ['Destaque', p.note],
    ['Origem', p.origin && ORIGIN[p.origin]],
  ].filter(([, v]) => v);
  const lead = i === 0;
  return `<li class="piece reveal${lead ? ' piece--lead' : ''}" id="${p.slug}">
    <div class="piece__frame">
      ${picture(p.slug, { alt: p.alt, sizes: lead ? '(min-width: 1000px) 30vw, 92vw' : '(min-width: 1000px) 30vw, (min-width: 560px) 46vw, 92vw' })}
    </div>
    <div class="piece__label">
      <p class="piece__universe">${esc(universeName(p))}</p>
      <h3 class="piece__name">${esc(p.name)}</h3>
      <p class="piece__series">${esc(p.line)}</p>
      ${specs.length ? `<dl class="piece__specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      <div class="piece__buy">
        <div>${priceBlock(p)}</div>
        ${action(p)}
      </div>
    </div>
  </li>`;
}

function catalogItem(p) {
  const u = universeName(p);
  return `<li class="item" data-universe="${p.universe ?? ''}" data-type="${p.type}"${p.availability === 'esgotado' ? ' data-soldout' : ''}>
    <div class="item__frame" data-fit="${p.fit === 'contain' && manifest[p.slug]?.lightBackground ? 'contain' : 'cover'}">
      ${picture(p.slug, { alt: p.alt, sizes: '(min-width: 1400px) 250px, (min-width: 1100px) 19vw, (min-width: 640px) 30vw, 46vw' })}
    </div>
    <div class="item__label">
      ${u ? `<p class="item__universe">${esc(u)}</p>` : ''}
      <h3 class="item__name">${esc(p.name)}</h3>
      ${seriesLine(p) ? `<p class="item__series">${esc(seriesLine(p))}</p>` : ''}
      ${p.origin ? `<p class="item__origin">${ORIGIN[p.origin]}</p>` : ''}
      <div class="item__buy">
        ${p.price != null ? priceBlock(p) : ''}
        ${stockBlock(p)}
        ${action(p, { className: 'item__cta' })}
      </div>
    </div>
  </li>`;
}

// ---------- Seções ----------

const navItems = [
  ['#destaques', 'Destaques'],
  ['#catalogo', 'Catálogo'],
  ['#universos', 'Universos'],
  ['#tcg', 'TCG'],
  ['#encomendas', 'Encomendas'],
];

const header = `<header class="site-header" data-header>
  <div class="site-header__inner">
    <a class="brand" href="#topo" aria-label="Kollect, voltar ao início">
      <img src="img/logo-kollect-440.png" width="440" height="0" alt="" data-logo>
    </a>
    <nav class="nav" aria-label="Principal">
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
        <span class="nav__toggle-bars" aria-hidden="true"></span>Menu
      </button>
      <ul class="nav__list" id="menu" data-menu>
        ${navItems.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('\n        ')}
        ${shops?.store ? `<li class="nav__store"><a ${link(shops.store)}>Loja virtual${newTab}</a></li>` : ''}
      </ul>
    </nav>
    <a class="btn btn--primary btn--small site-header__cta" ${link(consultHref('Olá, Kollect! Quero consultar uma peça.'))}>Consultar${ext(consultHref(''))}</a>
  </div>
</header>`;

// Hero: filme da marca em tela cheia (16:9 em telas deitadas, 9:16 em telas em pé).
// O pôster em <picture> aparece na hora; o vídeo entra por cima quando começa a tocar.
const filmSrc = (format, ext) => `video/${film.name}-${format}.${ext}`;
const heroSection = `<section class="hero" aria-labelledby="hero-title" data-film
  data-src="video/${film.name}-{format}-{quality}.{ext}" data-tagline-from="${film.taglineFrom}">
  <div class="hero__media">
    <picture>
      <source media="(max-aspect-ratio: 4/5)" srcset="video/${film.name}-tall-poster.jpg" width="1080" height="1920">
      <img class="hero__poster" src="video/${film.name}-wide-poster.jpg" width="1920" height="1080" alt="" fetchpriority="high">
    </picture>
    <video class="hero__video" muted loop playsinline preload="none" aria-describedby="filme-descricao" data-film-video></video>
    <p class="sr-only" id="filme-descricao">${esc(film.description)}</p>
  </div>
  <div class="hero__copy">
    <h1 class="hero__title" id="hero-title" data-blur-reveal data-delay="0.15"><span>Colecione</span> <span>seu mundo.</span></h1>
    <p class="hero__lede">Figures e colecionáveis que dão vida aos seus universos favoritos.</p>
    <div class="hero__actions">
      <a class="btn btn--primary" href="#destaques" data-magnetic>Explorar coleção</a>
      <a class="btn btn--ghost" href="#encomendas">Consultar encomendas</a>
    </div>
  </div>
  <div class="hero__controls" data-film-controls hidden>
    <button class="film__button" type="button" aria-label="Pausar filme" data-film-play>
      <span data-icon-on>${ICONS.pause}</span><span data-icon-off hidden>${ICONS.play}</span>
    </button>
    <button class="film__button" type="button" aria-label="Ativar som do filme" data-film-sound>
      <span data-icon-on>${ICONS['speaker-slash']}</span><span data-icon-off hidden>${ICONS['speaker-high']}</span>
    </button>
  </div>
</section>`;

// 5 peças: a principal ocupa 2 colunas, então a grade fecha sem buracos (2+1 / 3 no desktop, 2 / 2+2 no tablet).
// Fica de fora a peça usada como capa de universo, que já aparece em "Explore por universo".
const universeCovers = new Set(Object.values(universes).map((u) => u.cover?.source).filter(Boolean));
const featuredList = [
  ...featuredPieces.filter((p) => p.slug !== spot.slug && p.note),
  ...featuredPieces.filter((p) => p.slug !== spot.slug && !p.note && !universeCovers.has(p.image.source)),
].slice(0, 5);
const featuredSection = `<section class="featured" id="destaques" aria-labelledby="destaques-title">
  <div class="section-head">
    <h2 class="section-title" id="destaques-title">Peças em destaque</h2>
    <p class="section-intro">As figures que a Kollect fotografou de perto. Consulte valor e disponibilidade direto com a loja.</p>
  </div>
  <ul class="pieces">
    ${featuredList.map(featuredCard).join('\n    ')}
  </ul>
</section>`;

// ---------- Faixa de universos (marquee) ----------
// O conteúdo é duplicado para o loop não ter emenda; a cópia fica escondida de leitores de tela.
const marqueeNames = Object.keys(universes).filter((k) => catalog.some((p) => p.universe === k)).map((k) => universes[k].name);
const marqueeRun = (hidden) =>
  `<ul class="marquee__run"${hidden ? ' aria-hidden="true"' : ''}>${marqueeNames
    .map((n) => `<li>${esc(n)}</li><li class="marquee__mark"><img src="img/mascote-64.png" width="64" height="64" alt="" loading="lazy"></li>`)
    .join('')}</ul>`;
const marqueeSection = `<section class="marquee" aria-label="Universos na coleção">
  <div class="marquee__track">${marqueeRun(false)}${marqueeRun(true)}</div>
</section>`;

// ---------- Caixas de categoria ----------
const categoryHref = (c) =>
  c.link === 'consulta' ? consultHref(`Olá, Kollect! Quero consultar ${c.name.toLowerCase()} disponíveis.`) : c.link;
const categoriesSection = `<section class="boxes" id="categorias" aria-labelledby="categorias-title">
  <div class="section-head">
    <h2 class="section-title" id="categorias-title" data-blur-reveal="view">Coleciona algo? Aqui você encontra.</h2>
  </div>
  <ul class="boxes__grid">
    ${categories
      .map(
        (c) => `<li class="box box--${c.id}${c.size === 'lg' ? ' box--lg' : ''}${c.light ? ' box--light' : ''} reveal">
      <a class="box__link" ${link(categoryHref(c))} data-spotlight>
        <div class="box__media">${picture(`categoria-${c.id}`, { alt: c.alt, sizes: c.size === 'lg' ? '(min-width: 1000px) 50vw, 92vw' : '(min-width: 1000px) 25vw, 46vw' })}</div>
        <div class="box__text">
          <h3 class="box__name">${esc(c.name)}</h3>
          <p class="box__note">${esc(c.note)}</p>
        </div>
        ${ext(categoryHref(c))}
      </a>
    </li>`,
      )
      .join('\n    ')}
  </ul>
</section>`;

// ---------- Série em galeria horizontal ----------
const seriesSection = seriesPieces.length
  ? `<section class="series" id="serie" aria-labelledby="serie-title">
  <div class="series__pin">
    <div class="series__head">
      <h2 class="section-title" id="serie-title">${esc(series.title)}</h2>
      <p class="section-intro">${esc(series.intro)}</p>
      <p class="series__count">${plural(seriesPieces.length, 'figure', 'figures')}</p>
    </div>
    <ol class="series__track">
      ${seriesPieces
        .map(
          (p) => `<li class="series__item">
        <a class="series__link" href="#catalogo" data-universe-link="${p.universe}">
          <div class="series__frame">${picture(p.slug, { alt: p.alt, sizes: '(min-width: 1000px) 30vw, 72vw' })}</div>
          <span class="series__name">${esc(p.name)}</span>
        </a>
      </li>`,
        )
        .join('\n      ')}
    </ol>
  </div>
</section>`
  : '';

// Universos ordenados pela quantidade de peças no catálogo.
const universeCounts = Object.keys(universes)
  .map((k) => [k, catalog.filter((p) => p.universe === k).length])
  .filter(([, n]) => n)
  .sort((a, b) => b[1] - a[1]);
const tiles = universeCounts.filter(([k]) => universes[k].cover);
const others = universeCounts.filter(([k]) => !universes[k].cover);

const universesSection = `<section class="universes" id="universos" aria-labelledby="universos-title">
  <div class="section-head">
    <h2 class="section-title" id="universos-title">Explore por universo</h2>
    <p class="section-intro">Escolha um mundo e veja as peças dele no catálogo.</p>
  </div>
  <ul class="universes__grid">
    ${tiles
      .map(
        ([k, n], i) => `<li class="universe${i === 0 ? ' universe--lead' : ''}">
      <a class="universe__link" href="#catalogo" data-universe-link="${k}" style="--tint: ${universes[k].tint ?? manifest[`universo-${k}`].tint}">
        <div class="universe__frame">
          ${picture(`universo-${k}`, { alt: universes[k].alt, sizes: i === 0 ? '(min-width: 900px) 62vw, 92vw' : '(min-width: 900px) 32vw, 92vw' })}
        </div>
        <div class="universe__text">
          <h3 class="universe__name">${esc(universes[k].name)}</h3>
          <p class="universe__count">${plural(n)}</p>
          <span class="universe__cta">Ver peças</span>
        </div>
      </a>
    </li>`,
      )
      .join('\n    ')}
  </ul>
  ${
    others.length
      ? `<div class="universes__more">
    <h3 class="universes__more-title">Mais universos</h3>
    <ul class="universes__list">
      ${others.map(([k, n]) => `<li><a href="#catalogo" data-universe-link="${k}">${esc(universes[k].name)} <span>${n}</span></a></li>`).join('\n      ')}
    </ul>
  </div>`
      : ''
  }
</section>`;


const detailSection = `<section class="detail" id="detalhes" aria-labelledby="detalhes-title">
  <div class="detail__inner">
    <div class="detail__main reveal">
      ${picture(spot.slug, { alt: spot.alt, sizes: '(min-width: 1000px) 52vw, 92vw' })}
    </div>
    <div class="detail__side">
      <h2 class="section-title" id="detalhes-title" data-blur-reveal="view">Uma peça, todos os detalhes</h2>
      <p class="section-intro"><strong>${esc(spot.name)}</strong>. ${esc(spotlight.intro)}</p>
      <ul class="crops">
        ${spotlight.details
          .map(
            (d) => `<li class="crop${d.region.width > d.region.height * 1.2 ? ' crop--wide' : ''} reveal">
          <figure>
            <div class="crop__frame">${picture(`${spot.slug}-${d.id}`, {
              alt: `Detalhe de ${spot.name}: ${d.title.toLowerCase()}.`,
              sizes: d.region.width > d.region.height * 1.2 ? '(min-width: 1000px) 34vw, 92vw' : '(min-width: 1000px) 17vw, 46vw',
            })}</div>
            <figcaption><strong>${esc(d.title)}</strong> ${esc(d.text)}</figcaption>
          </figure>
        </li>`,
          )
          .join('\n        ')}
      </ul>
      ${action(spot, { variant: 'btn--primary' }).replace('>Consultar<', `>Consultar ${esc(spot.name)}<`)}
    </div>
  </div>
</section>`;

const typeCounts = Object.keys(types).map((k) => [k, catalog.filter((p) => p.type === k).length]).filter(([, n]) => n);
const chip = (value, label, count, checked = false) =>
  `<label class="chip"><input type="radio" name="tipo" value="${value}"${checked ? ' checked' : ''}><span>${esc(label)} <small>${count}</small></span></label>`;

const catalogSection = `<section class="catalog" id="catalogo" aria-labelledby="catalogo-title">
  <div class="section-head">
    <h2 class="section-title" id="catalogo-title">Catálogo</h2>
    <p class="section-intro">${
      storeEnabled
        ? 'Preço e estoque vêm da loja virtual. Peças sem preço são vendidas por consulta.'
        : 'Todas as peças são vendidas por consulta. Fale com a Kollect para saber valor e disponibilidade.'
    }</p>
  </div>
  <div class="filters" role="group" aria-label="Filtrar catálogo" data-filters hidden>
    <fieldset>
      <legend>Tipo</legend>
      <div class="filters__chips">
        ${chip('all', 'Todos', catalog.length, true)}
        ${typeCounts.map(([k, n]) => chip(k, types[k].name, n)).join('\n        ')}
      </div>
    </fieldset>
    <div class="filters__select">
      <label for="filtro-universo">Universo</label>
      <select id="filtro-universo" name="universo">
        <option value="all">Todos os universos</option>
        ${universeCounts.map(([k, n]) => `<option value="${k}">${esc(universes[k].name)} (${n})</option>`).join('\n        ')}
      </select>
    </div>
    ${catalog.some((p) => p.availability === 'esgotado') ? '<label class="filters__toggle"><input type="checkbox" name="disponiveis"> Só disponíveis</label>' : ''}
    <p class="filters__count" aria-live="polite" data-count>${plural(catalog.length)}</p>
  </div>
  <ul class="items" data-items data-page-size="${PAGE_SIZE}">
    ${catalog.map(catalogItem).join('\n    ')}
  </ul>
  <div class="catalog__more">
    <button class="btn btn--ghost" type="button" data-more hidden>Mostrar mais peças</button>
  </div>
  <div class="empty" data-empty hidden>
    <p>Nenhuma peça combina com esses filtros.</p>
    <button class="btn btn--ghost" type="button" data-reset>Limpar filtros</button>
  </div>
</section>`;

const imgUrl = (name, min = 700) => {
  const m = manifest[name];
  return `img/${name}-${m.widths.find((w) => w >= min) ?? m.widths.at(-1)}.webp`;
};
const holoCard = (c) => {
  const m = manifest[`tcg-${c.id}`];
  const back = manifest['tcg-verso'];
  return `<li class="tcg__card">
      <button class="holo-card" type="button" data-holo-card data-flippable aria-pressed="false"
        aria-label="Carta holográfica de ${esc(c.name)}. Ative para virar e ver o verso."
        data-image="${imgUrl(`tcg-${c.id}`)}" data-preset="${esc(c.preset)}" data-foil="${esc(c.foilColor)}" data-intensity="${c.intensity ?? 0.85}" data-frame="3"
        style="--hc-w: clamp(150px, 26vw, 320px); --hc-ratio: ${(m.width / m.height).toFixed(4)}; --hc-radius: 14px">
        <span class="holo-card__shadow" aria-hidden="true"></span>
        <span class="holo-card__rotor">
          <span class="holo-card__face holo-card__face--front">
            <img src="${imgUrl(`tcg-${c.id}`)}" width="${m.width}" height="${m.height}" alt="" draggable="false" loading="lazy" decoding="async">
            <canvas></canvas>
          </span>
          <span class="holo-card__face holo-card__face--back">
            <img src="${imgUrl('tcg-verso')}" width="${back.width}" height="${back.height}" alt="" draggable="false" loading="lazy" decoding="async">
          </span>
        </span>
      </button>
    </li>`;
};
const hasPokemon = catalog.some((p) => p.universe === 'pokemon');
const tcgSection = `<section class="tcg" id="tcg" aria-labelledby="tcg-title">
  <div class="tcg__inner">
    <div class="tcg__intro">
      <h2 class="section-title" id="tcg-title" data-blur-reveal="view">Cartas TCG</h2>
      <p class="section-intro">A Kollect também trabalha com TCG. Consulte cartas e coleções disponíveis direto com a loja.</p>
      <div class="tcg__actions">
        <a class="btn btn--primary" ${link(consultHref('Olá, Kollect! Quero consultar cartas TCG.'))}>Consultar cartas TCG${ext(consultHref(''))}</a>
        ${hasPokemon ? '<a class="btn btn--ghost" href="#catalogo" data-universe-link="pokemon">Ver linha Pokémon</a>' : ''}
      </div>
      <p class="tcg__note">Cartas ilustrativas, feitas com as figures da linha Pokémon da Kollect. Mova o cursor ou o dedo sobre a carta para inclinar; clique ou toque para ver o verso.</p>
    </div>
    <ul class="tcg__cards">
    ${tcg.cards.map(holoCard).join('\n    ')}
    </ul>
  </div>
</section>`;

const channelButtons = [
  wa && { href: waText('Olá, Kollect! Quero consultar uma encomenda.'), label: 'Consultar pelo WhatsApp', primary: true },
  c.instagram && { href: `https://ig.me/m/${c.instagram}`, label: 'Mensagem no Instagram' },
  shops?.store && { href: shops.store, label: 'Ver a loja virtual' },
].filter(Boolean);

const orderSection = `<section class="order" id="encomendas" aria-labelledby="encomendas-title">
  <div class="order__inner">
    <div class="order__intro">
      <h2 class="section-title" id="encomendas-title">Encomendas</h2>
      <p class="section-intro">Não encontrou a peça no catálogo? Consulte a Kollect.</p>
      ${
        hasChannel
          ? `<div class="order__channels">${channelButtons
              .map((b) => `<a class="btn ${b.primary ? 'btn--primary' : 'btn--ghost'}"${b.primary ? ' data-magnetic' : ''} ${link(b.href)}>${b.label}${ext(b.href)}</a>`)
              .join('')}</div>`
          : `<p class="config-note" role="note">Canal de atendimento não configurado. Preencha <code>contact</code> em <code>content/site.js</code>.</p>`
      }
    </div>
    <ol class="steps">
      ${site.orderSteps.map((s) => `<li class="step"><h3 class="step__title">${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const footerCol = (title, items) =>
  items.length
    ? `<div class="site-footer__col">
      <h2 class="site-footer__title">${title}</h2>
      <ul>${items.map(([label, href]) => `<li><a ${link(href)}>${esc(label)}${ext(href)}</a></li>`).join('')}</ul>
    </div>`
    : '';

const phone = c.whatsapp ? c.whatsapp.replace(/^55(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') : '';
const footer = `<footer class="site-footer">
  <div class="site-footer__sign">
    <img src="img/logo-kollect.png" width="${logoFull.width}" height="${logoFull.height}" alt="Kollect" loading="lazy">
    <p class="site-footer__slogan">Colecione seu mundo.</p>
  </div>
  <div class="site-footer__inner">
    ${footerCol('Navegação', navItems.map(([h, l]) => [l, h]))}
    ${footerCol(
      'Onde comprar',
      [
        shops?.store && ['Loja virtual', shops.store],
        shops?.shopee && ['Shopee', shops.shopee],
        shops?.mercadolivre && ['Mercado Livre', shops.mercadolivre],
      ].filter(Boolean),
    )}
    ${footerCol(
      'Contato',
      [
        wa && [`WhatsApp ${phone}`, wa],
        c.instagram && [`Instagram @${c.instagram}`, `https://www.instagram.com/${c.instagram}/`],
        social?.tiktok && ['TikTok', social.tiktok],
        c.email && [c.email, `mailto:${c.email}`],
      ].filter(Boolean),
    )}
    <div class="site-footer__legal">
      <p>© ${new Date().getFullYear()} Kollect. Personagens e marcas pertencem aos seus respectivos detentores.</p>
      ${policies.map((p) => `<a ${link(p.href)}>${esc(p.label)}${ext(p.href)}</a>`).join('')}
    </div>
  </div>
</footer>`;

// ---------- Página ----------

const ogUrl = site.url ? `${site.url}/img/og.jpg` : 'img/og.jpg';
const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kollect | Figures e colecionáveis</title>
<meta name="description" content="${esc(site.description)}">
<meta name="theme-color" content="#141413">
<meta property="og:type" content="website">
<meta property="og:title" content="Kollect | Kollect Your World">
<meta property="og:description" content="${esc(site.description)}">
<meta property="og:image" content="${esc(ogUrl)}">
${site.url ? `<link rel="canonical" href="${esc(site.url)}/">\n<meta property="og:url" content="${esc(site.url)}/">` : ''}
<link rel="icon" href="img/icon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="img/icon-180.png">
<link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="holo-card.css">
<script>document.documentElement.classList.add('js')</script>
<script src="main.js" defer></script>
<script src="holo-card.js" defer></script>
<script src="blur-reveal.js" defer></script>
</head>
<body id="topo">
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
${header}
<main id="conteudo">
${heroSection}
${marqueeSection}
${categoriesSection}
${featuredSection}
${seriesSection}
${universesSection}
${detailSection}
${catalogSection}
${tcgSection}
${orderSection}
</main>
${footer}
</body>
</html>
`;

// ---------- Página 404 ----------
// Caminhos absolutos: a hospedagem serve este arquivo em qualquer endereço inexistente.
const fig = manifest['erro-404-cena'];
const figSet = (ext) => fig.widths.map((w) => `/img/erro-404-cena-${w}.${ext} ${w}w`).join(', ');
const notFoundHtml = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página não encontrada | Kollect</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0d1622">
<link rel="icon" href="/img/icon-32.png" sizes="32x32" type="image/png">
<link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/404.css">
<script>document.documentElement.classList.add('js')</script>
<script src="/404.js" defer></script>
<script src="/blur-reveal.js" defer></script>
</head>
<body>
<main class="lost">
  <div class="lost__bg" aria-hidden="true" data-depth="-6">
    <picture>
      <source type="image/avif" srcset="/img/erro-404-fundo-640.avif">
      <img src="/img/erro-404-fundo-640.webp" width="640" height="720" alt="" fetchpriority="high">
    </picture>
  </div>
  <div class="lost__rays" aria-hidden="true"></div>
  <header class="lost__top">
    <a href="/" aria-label="Kollect, ir para o início"><img src="/img/logo-kollect-440.png" width="440" height="0" alt=""></a>
  </header>
  <div class="lost__stage">
    <p class="lost__code" aria-hidden="true" data-depth="-10">404</p>
    <div class="lost__figure" data-depth="8">
      <picture>
        <source type="image/avif" srcset="${figSet('avif')}" sizes="(min-width: 600px) 520px, 80vw">
        <source type="image/webp" srcset="${figSet('webp')}" sizes="(min-width: 600px) 520px, 80vw">
        <img src="/img/erro-404-cena-800.webp" width="${fig.width}" height="${fig.height}" alt="${esc(notFound.alt)}" fetchpriority="high">
      </picture>
    </div>
  </div>
  <div class="lost__mist" aria-hidden="true"><span></span><span></span><span></span></div>
  <canvas class="lost__particles" aria-hidden="true" data-particles></canvas>
  <div class="lost__vignette" aria-hidden="true"></div>
  <div class="lost__copy">
    <hr class="lost__rule">
    <h1 class="lost__title" data-blur-reveal data-delay="0.5"><span class="sr-only">Erro 404. </span>Esta página saiu de cena.</h1>
    <p class="lost__text">O caminho se perdeu, mas a sua coleção continua aqui. Vamos te levar de volta.</p>
    <div class="lost__actions">
      <a class="btn btn--primary" href="/">Voltar ao início</a>
      <a class="btn btn--ghost" href="/#catalogo">Ver o catálogo</a>
    </div>
  </div>
  <button class="lost__pause" type="button" aria-pressed="false" data-pause-scene>Pausar animação</button>
</main>
</body>
</html>
`;

const { default: sharp } = await import('sharp');
const logoMeta = await sharp(path.join(root, 'public/img/logo-kollect-440.png')).metadata();
const tidy = (h) => h.replace(/[ \t]+$/gm, '').replaceAll('width="440" height="0"', `width="${logoMeta.width}" height="${logoMeta.height}"`);
const out = tidy(html);
const page404 = tidy(notFoundHtml);

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
// Copia de public/img só as imagens usadas pela página, mais ícones e imagem de compartilhamento.
const used = new Set(['img/og.jpg']);
for (const [, src] of out.matchAll(/(?:src|href|data-image)="(img\/[^"]+)"/g)) used.add(src);
for (const [, src] of page404.matchAll(/\/(img\/erro-404[^" ,]+)/g)) used.add(src);
for (const [, set] of out.matchAll(/srcset="([^"]+)"/g)) for (const part of set.split(',')) used.add(part.trim().split(' ')[0]);
await fs.mkdir(path.join(dist, 'img'), { recursive: true });
await fs.cp(path.join(root, 'public/video'), path.join(dist, 'video'), { recursive: true });
await fs.cp(path.join(root, 'public/fonts'), path.join(dist, 'fonts'), { recursive: true });
for (const file of used) await fs.copyFile(path.join(root, 'public', file), path.join(dist, file));
await fs.copyFile(path.join(root, 'src/styles.css'), path.join(dist, 'styles.css'));
await fs.copyFile(path.join(root, 'src/main.js'), path.join(dist, 'main.js'));
await fs.copyFile(path.join(root, 'src/holo-card.js'), path.join(dist, 'holo-card.js'));
await fs.copyFile(path.join(root, 'src/holo-card.css'), path.join(dist, 'holo-card.css'));
await fs.writeFile(path.join(dist, 'index.html'), out);
await fs.writeFile(path.join(dist, '404.html'), page404);
for (const f of ['404.css', '404.js', 'blur-reveal.js']) await fs.copyFile(path.join(root, 'src', f), path.join(dist, f));

const synced = storeEnabled ? `loja sincronizada em ${new Date(store.syncedAt).toLocaleString('pt-BR')}` : 'loja virtual desligada';
console.log(`dist/ gerado: ${featuredList.length} destaques, ${catalog.length} peças no catálogo (${synced}).`);
if (!hasChannel) console.warn('Aviso: nenhum canal de atendimento configurado em content/site.js.');
