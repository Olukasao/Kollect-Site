// Gera as versões web do filme da marca a partir de assets/video (requer ffmpeg no PATH).
// Uso: npm run video
//
// Para cada formato (wide 16:9, tall 9:16) saem duas qualidades:
//   -hd   1080p, 60 fps (igual à fonte), para telas grandes ou de alta densidade
//   -sd   720p, 30 fps, mais leve, para telas menores
// cada uma em WebM (VP9 + Opus) e MP4 (H.264 + AAC), além do pôster.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { film } from '../content/products.js';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public/video');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

const ffmpeg = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

const QUALITIES = {
  hd: { scale: 1, fps: 60, x264: '21', vp9: '31' },
  sd: { scale: 2 / 3, fps: 30, x264: '23', vp9: '32' },
};

for (const [format, { source, width, height }] of Object.entries(film.formats)) {
  const input = path.join(root, 'assets', source);
  for (const [quality, q] of Object.entries(QUALITIES)) {
    const w = Math.round(width * q.scale);
    const h = Math.round(height * q.scale);
    const vf = `scale=${w}:${h}:flags=lanczos,fps=${q.fps}`;
    const name = `${film.name}-${format}-${quality}`;
    ffmpeg(['-i', input, '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', q.x264, '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-tune', 'animation', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', path.join(out, `${name}.mp4`)]);
    ffmpeg(['-i', input, '-vf', vf, '-c:v', 'libvpx-vp9', '-crf', q.vp9, '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1',
      '-tile-columns', '2', '-auto-alt-ref', '1', '-lag-in-frames', '25', '-c:a', 'libopus', '-b:a', '128k', path.join(out, `${name}.webm`)]);
    for (const ext of ['webm', 'mp4']) {
      const { size } = await fs.stat(path.join(out, `${name}.${ext}`));
      console.log(`✓ ${name}.${ext}  ${w}×${h} ${q.fps}fps  ${(size / 1048576).toFixed(1)} MB`);
    }
  }
  // Pôster em resolução cheia.
  ffmpeg(['-ss', String(film.posterAt), '-i', input, '-frames:v', '1', '-q:v', '2', path.join(out, `${film.name}-${format}-poster.jpg`)]);
}
