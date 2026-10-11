// Sincroniza o catálogo da loja virtual (Nuvemshop): nome, preço, estoque, descrição e fotos.
// Uso: npm run sync   (depois rode npm run images)
//
// Grava content/store.json e baixa as fotos em assets/store/.
// Nome de exibição, universo e tipo ficam em content/store-overrides.js e não são sobrescritos.
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const STORE = 'https://kollectbr2.lojavirtualnuvem.com.br';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36';
const MAX_PHOTOS = 2;

const get = async (url) => {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} em ${url}`);
  return res;
};
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&(\w+);/g, (m, e) => ({ quot: '"', amp: '&', lt: '<', gt: '>', nbsp: ' ', ndash: '–', mdash: '—', ccedil: 'ç', atilde: 'ã', otilde: 'õ', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', acirc: 'â', ecirc: 'ê', ocirc: 'ô', agrave: 'à', Ccedil: 'Ç', Atilde: 'Ã', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ecirc: 'Ê', Ocirc: 'Ô' })[e] ?? m);
const toText = (h) =>
  decode(h.replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|li|div)>/g, '\n').replace(/<[^>]+>/g, ' '))
    .replace(/[ \t ]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();

// 1. Lista de produtos (todas as páginas).
const slugs = new Set();
for (let page = 1; page < 30; page++) {
  const html = await (await get(`${STORE}/produtos/page/${page}/`)).text();
  const before = slugs.size;
  for (const [, s] of html.matchAll(/href="https:\/\/[^"]*\/produtos\/([a-z0-9-]+)\/"/g)) slugs.add(s);
  if (slugs.size === before) break;
}

// 2. Detalhes de cada produto.
const outDir = path.join(root, 'assets/store');
await fs.mkdir(outDir, { recursive: true });
const products = [];
for (const slug of [...slugs].sort()) {
  const url = `${STORE}/produtos/${slug}/`;
  const html = await (await get(url)).text();
  const name = decode((html.match(/<h1[^>]*js-product-name[^>]*>([^<]*)<\/h1>/) || [])[1] || '').trim();
  const variants = JSON.parse(decode((html.match(/data-variants="([^"]*)"/) || [])[1] || '[]'));
  const v = variants[0] || {};
  const photos = [];
  for (const tag of html.match(/<img[\s\S]*?\/>/g) || []) {
    if (!tag.includes('js-product-slide-img')) continue;
    const u = (tag.match(/\/\/[^ ,'"]*-1024-1024\.(?:webp|jpg|png)/) || [])[0];
    if (u && !photos.includes(`https:${u}`)) photos.push(`https:${u}`);
  }
  const di = html.indexOf('product-description');
  const description = di > 0 ? toText(html.slice(html.indexOf('>', di) + 1, html.indexOf('</div>', di))) : '';
  const category = decode(([...((html.match(/<div class="breadcrumbs[\s\S]*?<\/div>/) || [''])[0].matchAll(/<a[^>]*>([^<]*)<\/a>/g))].at(-1) || [])[1] || '').trim();
  const height =
    (description.match(/Altura:?\s*(?:aproximadamente\s*)?(\d+(?:[.,]\d+)?)\s*cm/i) || name.match(/(\d+)\s*cm/i) || [])[1] ?? null;
  const printed3d = /impress[ãa]o 3d/i.test(description);

  const images = [];
  for (const [i, u] of photos.slice(0, MAX_PHOTOS).entries()) {
    const file = `${slug}-${i + 1}.webp`;
    await fs.writeFile(path.join(outDir, file), Buffer.from(await (await get(u)).arrayBuffer()));
    images.push(file);
  }

  products.push({
    slug,
    url,
    name,
    category,
    price: v.price_number ?? null,
    compareAt: v.compare_at_price_number ?? null,
    available: Boolean(v.available),
    // null = estoque não controlado pela loja
    stock: v.stock ?? null,
    height: height ? `${height.replace('.', ',')} cm` : null,
    printed3d,
    description: description.slice(0, 1200),
    images,
  });
  console.log(`✓ ${slug}  R$ ${v.price_number}  ${v.available ? 'disponível' : 'esgotado'}`);
}

await fs.writeFile(
  path.join(root, 'content/store.json'),
  `${JSON.stringify({ syncedAt: new Date().toISOString(), store: STORE, products }, null, 2)}\n`,
);
console.log(`\n${products.length} produtos sincronizados em content/store.json`);
