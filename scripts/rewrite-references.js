/**
 * 把文章里的图片引用改写成单源 WebP 绝对路径。
 *
 * 三类引用分别处理：
 *  (a) 裸名 markdown：    ![alt](image.png)        → ![alt](/img/posts/<slug>/image.webp)
 *  (b) ../img/ 相对：     ![alt](../img/x.png)     → ![alt](/img/x.webp)
 *  (c) HTML img 绝对：    <img src="/img/x.png">    → <img src="/img/x.webp">
 *
 * slug = md 文件名去 .md。图已由 migrate-images.js 复制到 source/img/posts/<slug>/，
 * 由 convert-webp.js 转成 WebP。
 *
 * 用法：node scripts/rewrite-references.js          （dry-run 预览，不改文件）
 *       node scripts/rewrite-references.js --apply  （真正改写）
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const APPLY = process.argv.includes('--apply');

// (a) 裸名 markdown 图片
const BARE_RE = /(!\[[^\]]*\]\()(image[\w.\-]*\.(?:png|jpg|jpeg))(\))/g;
// (b) ../img/x.png 相对引用（markdown 或括号内）
const RELIMG_RE = /(!\[[^\]]*\]\()\.\.\/img\/([\w.\-/]+\.(?:png|jpg|jpeg))(\))/g;
// (c) HTML img src="/img/x.png" 或 src="/img/posts/..."
const HTMLIMG_RE = /(<img[^>]*\bsrc=")(\/img\/[\w.\-/]+\.(?:png|jpg|jpeg))("[^>]*>)/gi;

function walkMd(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function changeExt(p) {
  return p.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

function main() {
  const mdFiles = walkMd(POSTS_DIR);
  let filesChanged = 0, refsChanged = 0;
  const samples = [];

  console.log(APPLY ? '▶ 实际改写模式' : '▶ dry-run 预览（加 --apply 才真正改写）');
  console.log(`扫描 ${mdFiles.length} 个 md 文件\n`);

  for (const md of mdFiles) {
    const slug = path.basename(md, '.md');
    let content = fs.readFileSync(md, 'utf8');
    const orig = content;
    let count = 0;

    // (a) 裸名 → /img/posts/<slug>/image.webp
    content = content.replace(BARE_RE, (m, pre, name, post) => {
      count++;
      return `${pre}/img/posts/${slug}/${changeExt(name)}${post}`;
    });

    // (b) ../img/x → /img/x.webp
    content = content.replace(RELIMG_RE, (m, pre, name, post) => {
      count++;
      return `${pre}/img/${changeExt(name)}${post}`;
    });

    // (c) HTML <img src="/img/..."> → .webp
    content = content.replace(HTMLIMG_RE, (m, pre, src, post) => {
      count++;
      return `${pre}${changeExt(src)}${post}`;
    });

    if (content !== orig) {
      filesChanged++;
      refsChanged += count;
      if (samples.length < 8) {
        samples.push(`${path.relative(ROOT, md)}  (${count} 处)`);
      }
      if (APPLY) fs.writeFileSync(md, content, 'utf8');
    }
  }

  console.log('─'.repeat(50));
  console.log(`改写文章: ${filesChanged}`);
  console.log(`改写引用: ${refsChanged}`);
  console.log('\n样本:');
  samples.forEach(s => console.log('  ' + s));
  if (!APPLY) console.log('\n这是 dry-run。确认后运行: node scripts/rewrite-references.js --apply');
}

main();
