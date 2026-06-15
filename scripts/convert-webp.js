/**
 * 批量把 source/img/ 下的 PNG/JPG/JPEG 转成 WebP。
 *
 * - 幂等：WebP 已存在且 mtime ≥ 源文件则跳过
 * - 跳过白名单：favicon.png、*.ico、*.svg（矢量/兼容性）
 * - quality 82 是截图体积/质量甜点，effort 4 平衡速度与压缩
 * - --purge：转完后删除 posts/ 下的原 PNG/JPG（用户选择只要 WebP）
 *   根目录 source/img/*.png 不删（删库事件等文章引用 /img/X.png 的 fallback 需要，
 *   且根目录图种类多，保守不删）
 *
 * 用法：node scripts/convert-webp.js            （只转，不删原文件）
 *       node scripts/convert-webp.js --purge     （转完删 posts/ 下原文件）
 */
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'source', 'img');
const QUALITY = 82;
const EFFORT = 4;
const PURGE = process.argv.includes('--purge');

// 不转换、不删除的白名单（按 basename 或扩展名）
const SKIP_NAMES = new Set(['favicon.png', 'logo.svg', 'logo.png']);
const SKIP_EXTS = new Set(['.svg', '.ico', '.webp']);
const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg']);

function walkImg(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkImg(full));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

async function main() {
  const files = walkImg(IMG_DIR);
  let converted = 0, skipped = 0, failed = 0;
  let origBytes = 0, webpBytes = 0;

  console.log(PURGE ? '▶ 转换 + 删除 posts 原文件模式' : '▶ 仅转换模式（加 --purge 删 posts 原文件）');
  console.log(`扫描 ${files.length} 个文件\n`);

  for (const src of files) {
    const ext = path.extname(src).toLowerCase();
    const base = path.basename(src);
    if (SKIP_EXTS.has(ext) || SKIP_NAMES.has(base)) {
      skipped++;
      continue;
    }
    if (!CONVERTIBLE.has(ext)) { skipped++; continue; }

    const webpPath = src.slice(0, -ext.length) + '.webp';

    // 幂等：已存在且较新则跳过
    if (fs.existsSync(webpPath)) {
      if (fs.statSync(webpPath).mtimeMs >= fs.statSync(src).mtimeMs) {
        skipped++;
        continue;
      }
    }

    const srcSize = fs.statSync(src).size;
    try {
      await sharp(src).webp({ quality: QUALITY, effort: EFFORT }).toFile(webpPath);
      const webpSize = fs.statSync(webpPath).size;
      origBytes += srcSize; webpBytes += webpSize;
      const ratio = ((1 - webpSize / srcSize) * 100).toFixed(1);
      console.log(`  ${base}: ${(srcSize/1024).toFixed(0)}KB → ${(webpSize/1024).toFixed(0)}KB (-${ratio}%)`);
      converted++;
    } catch (e) {
      console.error(`  ❌ ${base}: ${e.message}`);
      failed++;
    }
  }

  // --purge: 删除 source/img/posts/ 下的原 PNG/JPG（WebP 已生成）
  let purged = 0;
  if (PURGE) {
    const postsDir = path.join(IMG_DIR, 'posts');
    if (fs.existsSync(postsDir)) {
      for (const f of walkImg(postsDir)) {
        const ext = path.extname(f).toLowerCase();
        if (CONVERTIBLE.has(ext)) {
          fs.unlinkSync(f);
          purged++;
        }
      }
    }
  }

  console.log('─'.repeat(50));
  console.log(`转换: ${converted}，跳过: ${skipped}，失败: ${failed}`);
  if (origBytes > 0) {
    console.log(`总体积: ${(origBytes/1024/1024).toFixed(2)}MB → ${(webpBytes/1024/1024).toFixed(2)}MB ` +
      `(省 ${((1-webpBytes/origBytes)*100).toFixed(1)}%)`);
  }
  if (PURGE) console.log(`已删除 posts/ 下原文件: ${purged}`);
}

main().catch(e => { console.error(e); process.exit(1); });
