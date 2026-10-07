import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(import.meta.dirname, 'public');
await mkdir(resolve(output, 'vendor'), { recursive: true });
await copyFile(resolve(root, 'web/index.html'), resolve(output, 'index.html'));
await copyFile(resolve(root, 'node_modules/ts-fsrs/dist/index.umd.js'), resolve(output, 'vendor/ts-fsrs.umd.js'));
console.log(`已生成 Vercel 静态站点：${output}`);
