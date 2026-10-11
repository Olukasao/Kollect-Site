// Junta destaques, peças das artes e produtos da loja virtual em um catálogo único.
import fs from 'node:fs';
import path from 'node:path';
import { featured, extras, universes, types, heroSlug, spotlight, tcg, notFound, film, categories, series } from '../../content/products.js';
import { storeOverrides } from '../../content/store-overrides.js';
import { site } from '../../content/site.js';

const root = path.resolve(import.meta.dirname, '../..');
const store = JSON.parse(fs.readFileSync(path.join(root, 'content/store.json'), 'utf8'));

export const storeEnabled = site.storeEnabled !== false;

const fromStore = (storeEnabled ? store.products : [])
  .filter((p) => p.images.length && !storeOverrides[p.slug]?.hidden)
  .map((p) => {
    const o = storeOverrides[p.slug] ?? {};
    return {
      slug: p.slug,
      name: o.name ?? p.name,
      universe: o.universe ?? null,
      type: o.type ?? 'peca-3d',
      line: o.line ?? null,
      manufacturer: null,
      origin: p.printed3d ? 'impressa-3d' : null,
      scale: null,
      height: p.height,
      note: null,
      price: p.price,
      compareAt: p.compareAt && p.compareAt > p.price ? p.compareAt : null,
      availability: p.available ? 'disponivel' : 'esgotado',
      lastUnit: p.available && p.stock === 1,
      buyUrl: p.url,
      image: { source: `store/${p.images[0]}`, crop: 'none' },
      alt: `Foto do produto ${o.name ?? p.name}${o.universe ? `, de ${universes[o.universe]?.name}` : ''}, na loja da Kollect.`,
      fit: 'contain',
      origemDados: 'loja',
    };
  });

const typeOrder = Object.keys(types);
// Dentro de cada tipo: à venda na loja, depois por consulta, depois esgotados.
// Peças que já aparecem em "Peças em destaque" vão para o fim do tipo, para o catálogo não repetir a seção de cima.
const rank = (p) => [
  typeOrder.indexOf(p.type),
  p.availability === 'esgotado' ? 2 : p.origemDados === 'loja' ? 0 : 1,
  p.destaque ? 1 : 0,
];
const compare = (a, b) => {
  const ra = rank(a);
  const rb = rank(b);
  for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i];
  return 0;
};

const photo = (p) => ({ compareAt: null, lastUnit: false, buyUrl: null, fit: 'cover', ...p });

export const featuredPieces = featured.map((p) => photo({ ...p, destaque: true }));
export const catalog = [...featuredPieces, ...extras.map(photo), ...fromStore].sort(compare);
export const hero = featuredPieces.find((p) => p.slug === heroSlug);
export const spot = featuredPieces.find((p) => p.slug === spotlight.slug);
export { universes, types, spotlight, store, tcg, notFound, film, categories, series };
export const seriesPieces = extras.map(photo).filter((p) => p.line === series.line);

// Nome do arquivo de imagem de cada peça (as artes recortadas e as fotos da loja têm tratamentos diferentes).
export const imageName = (p) => p.slug;
