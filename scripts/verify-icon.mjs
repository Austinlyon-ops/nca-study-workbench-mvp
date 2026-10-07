import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const file = resolve(import.meta.dirname, '../assets/app.ico');
const data = await readFile(file);
if (data.length < 6 || data.readUInt16LE(0) !== 0 || data.readUInt16LE(2) !== 1) {
  throw new Error('app.ico 不是有效的 Windows ICO 文件。');
}
const count = data.readUInt16LE(4);
const frames = [];
for (let index = 0; index < count; index += 1) {
  const offset = 6 + index * 16;
  if (offset + 16 > data.length) throw new Error('app.ico 帧目录不完整。');
  frames.push({
    width: data[offset] || 256,
    height: data[offset + 1] || 256,
    bytes: data.readUInt32LE(offset + 8),
    offset: data.readUInt32LE(offset + 12)
  });
}
const required = [16, 32, 48, 256];
for (const size of required) {
  const frame = frames.find(item => item.width === size && item.height === size);
  if (!frame || frame.offset + frame.bytes > data.length) throw new Error(`app.ico 缺少可读取的 ${size}×${size} 帧。`);
}
if (frames.length !== required.length) throw new Error(`app.ico 应只包含 ${required.join('/')} 四帧，实际为 ${frames.length} 帧。`);
console.log(JSON.stringify({ file, frames, status: 'PASS' }, null, 2));
