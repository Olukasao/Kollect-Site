// Servidor local para dist/. Uso: npm run dev  (porta: PORT=4173)
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '../dist');
const port = Number(process.env.PORT) || 4173;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

http
  .createServer(async (req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dist, url.endsWith('/') ? `${url}index.html` : url);
    if (!file.startsWith(dist)) file = path.join(dist, 'index.html');
    try {
      const body = await fs.readFile(file);
      res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      // Igual às hospedagens estáticas: endereço inexistente recebe dist/404.html.
      const page = await fs.readFile(path.join(dist, '404.html')).catch(() => 'Não encontrado');
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(page);
    }
  })
  .listen(port, () => console.log(`Kollect em http://localhost:${port}`));
