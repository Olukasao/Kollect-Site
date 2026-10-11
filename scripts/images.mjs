// Gera as imagens responsivas do site a partir de assets/.
// Uso: npm run images
//
// Fotos com recorte ("bottom"/"top") viram 8:9 sem a assinatura das artes.
// Fotos sem recorte ("none") mantêm a proporção original.
// As dimensões de cada saída ficam em public/img/manifest.json para o build reservar espaço.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { catalog, universes, spotlight, spot, hero, tcg, notFound, categories } from './lib/catalog.mjs';

const root = path.resolve(import.meta.dirname, '..');
const asset = (file) => path.join(root, 'assets', file);
const out = path.join(root, 'public/img');
const force = process.argv.includes('--force');

const PHOTO_WIDTHS = [480, 800, 1080];
const PLAIN_WIDTHS = [360, 720];
// Recorte 8:9 de uma arte 4:5 (1080 × 1350), em proporção da altura.
const CROPS = {
  bottom: { top: 46 / 1350, height: 1215 / 1350 },
  top: { top: 135 / 1350, height: 1215 / 1350 },
};

const manifest = {};

async function exists(file) {
  return fs
    .access(file)
    .then(() => true)
    .catch(() => false);
}

async function variants(input, name, widths, maxWidth) {
  const usable = widths.filter((w) => w <= maxWidth);
  if (!usable.length || usable.at(-1) < maxWidth) usable.push(Math.min(maxWidth, widths.at(-1)));
  const list = [...new Set(usable)];
  for (const w of list) {
    const avif = path.join(out, `${name}-${w}.avif`);
    if (!force && (await exists(avif))) continue;
    const img = input.clone().resize({ width: w, withoutEnlargement: true });
    await img.clone().avif({ quality: 52, effort: 4 }).toFile(avif);
    await img.clone().webp({ quality: 80 }).toFile(path.join(out, `${name}-${w}.webp`));
  }
  return list;
}

async function render(name, { source, crop }) {
  let input = sharp(asset(source)).flatten({ background: '#141413' });
  const meta = await sharp(asset(source)).metadata();
  let width = meta.width;
  let height = meta.height;
  if (crop && crop !== 'none') {
    const c = CROPS[crop];
    if (!c) throw new Error(`Recorte inválido "${crop}" em ${name}`);
    const top = Math.round(meta.height * c.top);
    height = Math.min(Math.round(meta.height * c.height), meta.height - top);
    input = input.extract({ left: 0, top, width, height });
    input = sharp(await input.toBuffer());
  }
  const widths = await variants(input, name, crop && crop !== 'none' ? PHOTO_WIDTHS : PLAIN_WIDTHS, width);
  manifest[name] = { width, height, widths, lightBackground: await hasLightBackground(input) };
}

// Foto de produto em fundo branco: as quatro bordas são claras e quase sem cor.
async function hasLightBackground(input) {
  const { data, info } = await input.clone().resize(48, 48, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3);
  let light = 0;
  let total = 0;
  for (let i = 0; i < 48; i++) {
    for (const [x, y] of [[i, 0], [i, 47], [0, i], [47, i]]) {
      const [r, g, b] = px(x, y);
      total++;
      if (Math.min(r, g, b) > 215 && Math.max(r, g, b) - Math.min(r, g, b) < 28) light++;
    }
  }
  return light / total > 0.6;
}

await fs.mkdir(out, { recursive: true });

// Cor da cena: média dos pixels ponderada pela saturação (ignora o fundo escuro e o cinza),
// devolvida como um tom escuro e saturado para tingir o bloco do universo.
async function sceneTint(file) {
  const { data } = await sharp(file).resize(64, 64, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, total = 0;
  for (let i = 0; i < data.length; i += 3) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const weight = max > 40 ? (max - min) ** 2 : 0;
    r += data[i] * weight;
    g += data[i + 1] * weight;
    b += data[i + 2] * weight;
    total += weight;
  }
  if (!total) return 'rgb(30 30 28)';
  const [cr, cg, cb] = [r / total, g / total, b / total];
  const scale = 70 / Math.max(cr, cg, cb);
  return `rgb(${Math.round(cr * scale)} ${Math.round(cg * scale)} ${Math.round(cb * scale)})`;
}

for (const p of catalog) {
  await render(p.slug, p.image);
}
console.log(`✓ ${catalog.length} peças`);

for (const [key, u] of Object.entries(universes)) {
  if (!u.cover) continue;
  await render(`universo-${key}`, u.cover);
  manifest[`universo-${key}`].tint = await sceneTint(asset(u.cover.source));
}
console.log('✓ universos');

for (const c of categories) await render(`categoria-${c.id}`, c.image);
console.log('✓ categorias');

for (const d of spotlight.details) {
  const name = `${spot.slug}-${d.id}`;
  const input = sharp(asset(d.source)).extract(d.region);
  const widths = await variants(input, name, [480, 800, 1080], d.region.width);
  manifest[name] = { width: d.region.width, height: d.region.height, widths };
}
console.log('✓ detalhes');

// Cartas TCG: arte 4:5 sem a assinatura das artes (faixa de baixo), centralizada.
async function card(name, source) {
  const meta = await sharp(asset(source)).metadata();
  const height = Math.round(meta.height * (1261 / 1350));
  const width = Math.round(height * 0.8);
  const input = sharp(await sharp(asset(source)).flatten({ background: '#141413' }).extract({ left: Math.round((meta.width - width) / 2), top: 0, width, height }).toBuffer());
  const widths = await variants(input, name, [400, 800], width);
  manifest[name] = { width, height, widths };
}
for (const c of tcg.cards) await card(`tcg-${c.id}`, c.source);
await card('tcg-verso', tcg.back.source);
console.log('✓ cartas TCG');

// Página 404: fundo desfocado (tela inteira) e figure recortada.
{
  const meta = await sharp(asset(notFound.source)).metadata();
  const scene = await sharp(asset(notFound.source))
    .extract({ left: 0, top: Math.round(meta.height * CROPS.bottom.top), width: meta.width, height: Math.round(meta.height * CROPS.bottom.height) })
    .toBuffer();
  const blurred = sharp(await sharp(scene).resize({ width: 640 }).blur(18).modulate({ brightness: 0.8, saturation: 1.15 }).toBuffer());
  await blurred.clone().avif({ quality: 45 }).toFile(path.join(out, 'erro-404-fundo-640.avif'));
  await blurred.clone().webp({ quality: 70 }).toFile(path.join(out, 'erro-404-fundo-640.webp'));
  const fig = sharp(await sharp(asset(notFound.source)).extract(notFound.region).toBuffer());
  const widths = await variants(fig, 'erro-404-cena', [480, 800], notFound.region.width);
  manifest['erro-404-cena'] = { width: notFound.region.width, height: notFound.region.height, widths };
  console.log('✓ cena 404');
}

// Logo: recorta a palavra KOLLECT e converte o branco sobre preto em transparência.
const logoSource = asset('source/logo-kollect.png');
const cut = (region) => sharp(logoSource).extract(region).png().toBuffer();
async function whiteOnClear(buf) {
  const { data, info } = await sharp(buf).flatten({ background: '#000' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return sharp({ create: { width: info.width, height: info.height, channels: 3, background: '#fff' } })
    .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
}
const logoBuf = await sharp(await whiteOnClear(await cut({ left: 70, top: 420, width: 880, height: 160 }))).trim().toBuffer();
await sharp(logoBuf).toFile(path.join(out, 'logo-kollect.png'));
await sharp(logoBuf).resize({ width: 440 }).toFile(path.join(out, 'logo-kollect-440.png'));
// Ícone: o rosto do "O" sobre carvão.
const face = await sharp(await whiteOnClear(await cut({ left: 200, top: 430, width: 150, height: 140 }))).trim().toBuffer();
await sharp(face).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'mascote-64.png'));
for (const size of [32, 180, 512]) {
  const pad = Math.round(size * 0.14);
  const inner = await sharp(face).resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#141413' } })
    .composite([{ input: inner, left: pad, top: pad }])
    .png()
    .toFile(path.join(out, `icon-${size}.png`));
}

// Imagem de compartilhamento: logo à esquerda, peça do hero à direita.
const heroPiece = hero;
const heroMeta = await sharp(asset(heroPiece.image.source)).metadata();
const heroCrop = CROPS[heroPiece.image.crop] ?? { top: 0, height: 1 };
const heroBuf = await sharp(asset(heroPiece.image.source))
  .extract({
    left: 0,
    top: Math.round(heroMeta.height * heroCrop.top),
    width: heroMeta.width,
    height: Math.round(heroMeta.height * heroCrop.height),
  })
  .resize(630, 630, { fit: 'cover', position: 'attention' })
  .toBuffer();
const logo = await sharp(logoBuf).resize({ width: 420 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#141413' } })
  .composite([
    { input: heroBuf, left: 570, top: 0 },
    { input: logo, left: 80, top: 270 },
  ])
  .jpeg({ quality: 82 })
  .toFile(path.join(out, 'og.jpg'));

await fs.writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ logo, ícones, og.jpg e manifest.json');
