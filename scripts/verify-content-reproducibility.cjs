const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { resolve, join } = require('node:path');

const root = resolve(__dirname, '..');
const generated = [
  'src/content.cjs', 'web/index.html', 'docs/exam-coverage-v0.2.md',
  ...Array.from({ length:8 }, (_, index) => `docs/day-${String(index + 1).padStart(2, '0')}-lesson-v0.2.md`)
];
const hashes = () => Object.fromEntries(generated.map(file => [file, createHash('sha256').update(readFileSync(join(root, file))).digest('hex')]));

execFileSync(process.execPath, [join(root, 'scripts/build-content.cjs')], { cwd:root, stdio:'inherit' });
const first = hashes();
execFileSync(process.execPath, [join(root, 'scripts/build-content.cjs')], { cwd:root, stdio:'inherit' });
const second = hashes();
if (JSON.stringify(first) !== JSON.stringify(second)) throw new Error('连续两次内容构建哈希不一致。');
const output = join(root, 'output/evidence');
mkdirSync(output, { recursive:true });
writeFileSync(join(output, 'content-reproducibility.json'), JSON.stringify({ checkedAt:new Date().toISOString(), status:'PASS', files:second }, null, 2));
console.log(`PASS：连续两次内容构建的 ${generated.length} 个生成文件哈希一致。`);
