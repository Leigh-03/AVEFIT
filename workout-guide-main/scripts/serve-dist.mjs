import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';

const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const dist = join(projectRoot, 'apps', 'site', 'dist');
const base = '/workout-guide';
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
};

createServer(async (request, response) => {
  const requested = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
  if (!requested.startsWith(base)) {
    response.writeHead(302, { location: `${base}/` }).end();
    return;
  }

  const relative = decodeURIComponent(requested.slice(base.length)).replace(/^\/+/, '');
  let target = normalize(join(dist, relative));
  if (!target.startsWith(dist)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const info = await stat(target);
    if (info.isDirectory()) target = join(target, 'index.html');
    await stat(target);
    response.writeHead(200, { 'content-type': mimeTypes[extname(target)] ?? 'application/octet-stream' });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(4321, '127.0.0.1', () => console.log('Serving the built site at http://127.0.0.1:4321/workout-guide/'));
