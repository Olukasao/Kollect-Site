// Capturas de tela do dist/ em desktop e celular, com checagem de transbordo.
// Uso: npm run shots [-- pasta-de-saida]   (requer Microsoft Edge ou Chrome instalado)
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.resolve(process.argv[2] ?? path.join(root, 'screenshots'));
await fs.mkdir(outDir, { recursive: true });

const port = 4178;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve.mjs')], { env: { ...process.env, PORT: port } });
await new Promise((r) => server.stdout.once('data', r));

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge' });
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-sm', width: 360, height: 640 },
];

try {
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-fold.png`) });
    // Rola até o fim para acender todas as fotos.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
    });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-full.png`), fullPage: true });
    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > w) return ['página com rolagem horizontal'];
      const inScroller = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (['auto', 'hidden', 'clip'].includes(getComputedStyle(p).overflowX)) return true;
        return false;
      };
      return [...document.querySelectorAll('body *')]
        .filter((el) => el.getBoundingClientRect().right > w + 1 && getComputedStyle(el).position !== 'fixed' && !inScroller(el))
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`);
    });
    console.log(`${vp.name}: ${overflow.length ? `transbordo em ${overflow.join(', ')}` : 'sem transbordo horizontal'}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(`Capturas em ${outDir}`);
