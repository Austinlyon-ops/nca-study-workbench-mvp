import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = resolve(import.meta.dirname, '..');
const svg = await readFile(resolve(root, 'assets/app-icon.svg'));
const sizes = [16, 32, 48, 64, 128, 256];
const buffers = await Promise.all(sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()));
const icoPath = resolve(root, 'assets/app.ico');
await mkdir(dirname(icoPath), { recursive: true });
await writeFile(icoPath, await pngToIco(buffers));
console.log(`Created ${icoPath}`);
