import { access, copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(import.meta.dirname, 'public');
const sourceIndex = resolve(root, 'web/index.html');
const sourceFsrs = resolve(root, 'node_modules/ts-fsrs/dist/index.umd.js');
const outputIndex = resolve(output, 'index.html');
const outputFsrs = resolve(output, 'vendor/ts-fsrs.umd.js');

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

await mkdir(resolve(output, 'vendor'), { recursive: true });

if (await exists(sourceIndex) && await exists(sourceFsrs)) {
  // 本机从项目唯一内容源重建，避免维护第二份知识库或静态页面。
  await copyFile(sourceIndex, outputIndex);
  await copyFile(sourceFsrs, outputFsrs);
  console.log(`已从唯一内容源生成 Vercel 静态站点：${output}`);
} else if (await exists(outputIndex) && await exists(outputFsrs)) {
  // Vercel CLI 只上传此子目录；远端构建校验本机已准备的静态产物。
  console.log(`已验证 Vercel 预生成静态站点：${output}`);
} else {
  throw new Error('缺少 Vercel 静态站点源文件。请先在完整源码目录运行 npm run build。');
}
