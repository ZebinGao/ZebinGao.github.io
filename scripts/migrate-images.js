/**
 * 迁移文章图片资产到统一发布路径 source/img/posts/<slug>/
 *
 * 背景：post_asset_folder:false 下，散落在 _posts/ 各级目录的图片没被复制进 public，
 * 导致裸引用 ![](image.png) 全部 404。本脚本把每篇文章引用的图片复制到
 * source/img/posts/<md文件名去.md>/ 下，配合后续改写脚本改成绝对路径 /img/posts/<slug>/image.webp。
 *
 * 用法：node scripts/migrate-images.js   （dry-run 预览，不改文件）
 *       node scripts/migrate-images.js --apply   （真正复制）
 *
 * 迁移是【复制非移动】，原 _posts/ 下图片保留，便于回滚。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const IMG_POSTS_DIR = path.join(ROOT, 'source', 'img', 'posts');
const APPLY = process.argv.includes('--apply');

// 匹配 markdown 图片引用：![alt](image.png)、![alt](image-12.png)、![alt](image.jpg)
// 只匹配裸文件名（不含 / 和 . 前缀），带路径前缀的不在这里处理
const BARE_IMG_RE = /!\[[^\]]*\]\((image[\w.\-]*\.(?:png|jpg|jpeg|gif))\)/gi;

function walkMd(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function findImageSource(mdDir, imgName) {
  // 1. md 同目录
  const same = path.join(mdDir, imgName);
  if (fs.existsSync(same)) return same;
  // 2. md 同目录下的 images/ 子目录（2026/3 的情况）
  const sub = path.join(mdDir, 'images', imgName);
  if (fs.existsSync(sub)) return sub;
  // 3. 向上找一层（防御性，如 _posts/2026/3/ 下找不到时找 _posts/2026/）
  const up = path.join(path.dirname(mdDir), imgName);
  if (fs.existsSync(up)) return up;
  return null;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('找不到 source/_posts');
    process.exit(1);
  }

  const mdFiles = walkMd(POSTS_DIR);
  let totalCopied = 0, totalMissing = 0, mdTouched = 0;
  const missing = [];
  const slugMap = {}; // 检测 slug 冲突

  console.log(APPLY ? '▶ 实际复制模式' : '▶ dry-run 预览（加 --apply 才真正复制）');
  console.log(`扫描 ${mdFiles.length} 个 md 文件\n`);

  for (const md of mdFiles) {
    const slug = path.basename(md, '.md');
    const mdDir = path.dirname(md);
    const content = fs.readFileSync(md, 'utf8');
    const matches = [...content.matchAll(BARE_IMG_RE)];
    if (!matches.length) continue;

    mdTouched++;
    const destDir = path.join(IMG_POSTS_DIR, slug);

    // slug 冲突检测（不同路径下同名 md）
    if (slugMap[slug] && slugMap[slug] !== mdDir) {
      console.warn(`⚠️  slug 冲突: "${slug}" 同时出现在\n   ${slugMap[slug]}\n   ${mdDir}`);
    } else {
      slugMap[slug] = mdDir;
    }

    const seen = new Set();
    let copied = 0;
    for (const m of matches) {
      const imgName = m[1];
      if (seen.has(imgName)) continue; // 同一文件内重复引用只复制一次
      seen.add(imgName);

      const src = findImageSource(mdDir, imgName);
      if (!src) {
        missing.push({ md: path.relative(ROOT, md), imgName });
        totalMissing++;
        continue;
      }

      const dest = path.join(destDir, imgName);
      const srcRel = path.relative(ROOT, src);
      const destRel = path.relative(ROOT, dest);

      if (fs.existsSync(dest)) {
        // 已迁移过，跳过
      } else if (APPLY) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, dest);
        console.log(`  复制 ${srcRel} → ${destRel}`);
        copied++;
      } else {
        console.log(`  将复制 ${srcRel} → ${destRel}`);
        copied++;
      }
      totalCopied++;
    }
    if (copied) console.log(`  [${slug}] ${copied} 张\n`);
  }

  console.log('─'.repeat(50));
  console.log(`涉及文章: ${mdTouched}`);
  console.log(`图片资产: ${totalCopied}（${APPLY ? '已复制' : '待复制'}）`);
  console.log(`缺失(找不到源文件): ${totalMissing}`);

  if (missing.length) {
    console.log('\n缺失明细:');
    for (const m of missing) console.log(`  ❌ ${m.md} → ${m.imgName}`);
  }

  if (!APPLY) console.log('\n这是 dry-run。确认无误后运行: node scripts/migrate-images.js --apply');
}

main();
