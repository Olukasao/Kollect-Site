// Valida o conteúdo e o resultado do build. Uso: npm run check
import fs from 'node:fs';
import path from 'node:path';
import { site } from '../content/site.js';
import { storeOverrides } from '../content/store-overrides.js';
import { catalog, featuredPieces, universes, types, hero, spot, store, storeEnabled } from './lib/catalog.mjs';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const warnings = [];
const ok = (cond, msg, list = errors) => cond || list.push(msg);

const ENUMS = {
  origin: [null, 'oficial', 'customizada', 'impressa-3d'],
  availability: [null, 'pronta-entrega', 'encomenda', 'esgotado', 'disponivel'],
};

const slugs = new Set();
for (const p of catalog) {
  ok(!slugs.has(p.slug), `Slug repetido: ${p.slug}`);
  slugs.add(p.slug);
  ok(p.universe === null || universes[p.universe], `${p.slug}: universo desconhecido "${p.universe}"`);
  ok(types[p.type], `${p.slug}: tipo desconhecido "${p.type}"`);
  ok(ENUMS.origin.includes(p.origin), `${p.slug}: origin inválido`);
  ok(ENUMS.availability.includes(p.availability), `${p.slug}: availability inválido`);
  ok(p.price === null || (typeof p.price === 'number' && p.price > 0), `${p.slug}: price deve ser número ou null`);
  ok(p.alt && p.alt.length > 20, `${p.slug}: texto alternativo ausente ou curto`);
  ok(fs.existsSync(path.join(root, 'assets', p.image.source)), `${p.slug}: foto original não encontrada (${p.image.source})`);
}
ok(hero, 'heroSlug não existe nos destaques');
ok(spot, 'spotlight.slug não existe nos destaques');
ok(featuredPieces.every((p) => p.alt), 'Destaque sem texto alternativo');

for (const p of storeEnabled ? store.products : []) {
  ok(storeOverrides[p.slug], `Produto novo na loja sem classificação: ${p.slug} (adicione em content/store-overrides.js)`, warnings);
}
const days = (Date.now() - new Date(store.syncedAt)) / 864e5;
ok(!storeEnabled || days < 7, `Loja sincronizada há ${Math.floor(days)} dias. Rode npm run sync para atualizar preço e estoque.`, warnings);

const c = site.contact;
ok(c.whatsapp || c.instagram || c.email, 'Nenhum canal de atendimento em content/site.js (contact).');
ok(!c.whatsapp || /^\d{12,13}$/.test(c.whatsapp), 'contact.whatsapp deve ter DDI + DDD + número, só dígitos.');
ok(site.url, 'site.url vazio: metatags de compartilhamento usarão caminhos relativos.', warnings);
const ask = catalog.filter((p) => p.price === null).length;
ok(!ask, `${ask} peça(s) sem preço, exibidas como "Valor sob consulta".`, warnings);

const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) ok(html.includes(`id="${id}"`), `Âncora quebrada: #${id}`);
const imgs = new Set();
for (const [, src] of html.matchAll(/src="(img\/[^"]+)"/g)) imgs.add(src);
for (const [, set] of html.matchAll(/srcset="([^"]+)"/g)) for (const part of set.split(',')) imgs.add(part.trim().split(' ')[0]);
for (const src of imgs) ok(fs.existsSync(path.join(root, 'dist', src)), `Imagem ausente: ${src}`);

warnings.forEach((w) => console.warn(`aviso  ${w}`));
errors.forEach((e) => console.error(`erro   ${e}`));
if (errors.length) process.exit(1);
console.log(`ok     ${catalog.length} peças e ${imgs.size} imagens validadas.`);
