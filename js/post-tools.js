// 文章页增强：图片点击放大（lightbox）、代码块一键复制、回到顶部
(function () {
    // ============ 1. 图片点击放大 ============
    // 给文章正文里的 <img> 加点击放大；已在 <a> 里（可点击跳转）的图片跳过，避免冲突。
    var overlay = null;

    function openLightbox(src, alt) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'lightbox-overlay';
            var img = document.createElement('img');
            img.className = 'lightbox-img';
            overlay.appendChild(img);
            overlay.addEventListener('click', closeLightbox);
            document.body.appendChild(overlay);
        }
        var lbImg = overlay.querySelector('.lightbox-img');
        lbImg.src = src;
        lbImg.alt = alt || '';
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!overlay) return;
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Escape 关闭
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) closeLightbox();
    });

    var contentImgs = document.querySelectorAll('.content.markdown img');
    for (var i = 0; i < contentImgs.length; i++) {
        (function (img) {
            if (img.parentElement && img.parentElement.tagName === 'A') return;
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', function () {
                openLightbox(img.currentSrc || img.src, img.alt);
            });
        })(contentImgs[i]);
    }

    // ============ 2. 代码块一键复制 ============
    var codeBlocks = document.querySelectorAll('.content.markdown figure.highlight');
    for (var j = 0; j < codeBlocks.length; j++) {
        (function (fig) {
            if (fig.querySelector('.copy-btn')) return;
            var btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.type = 'button';
            btn.textContent = '复制';
            btn.setAttribute('aria-label', '复制代码');
            btn.addEventListener('click', function () {
                // 只取 .code pre 里的正文，排除行号（.gutter）
                var codeNode = fig.querySelector('.code pre') || fig.querySelector('pre');
                var text = codeNode ? codeNode.innerText : fig.innerText;
                var done = function () {
                    btn.textContent = '已复制 ✓';
                    setTimeout(function () { btn.textContent = '复制'; }, 1500);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(done).catch(function () { legacyCopy(text, done); });
                } else {
                    legacyCopy(text, done);
                }
            });
            fig.appendChild(btn);
        })(codeBlocks[j]);
    }

    // 兜底：旧浏览器 / 非安全上下文（http）用 execCommand
    function legacyCopy(text, cb) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); cb(); } catch (e) {}
        document.body.removeChild(ta);
    }

    // ============ 3. 回到顶部 ============
    var toTop = document.createElement('button');
    toTop.className = 'back-to-top';
    toTop.type = 'button';
    toTop.innerHTML = '&uarr;';
    toTop.setAttribute('aria-label', '回到顶部');
    toTop.title = '回到顶部';
    toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(toTop);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) toTop.classList.add('show');
        else toTop.classList.remove('show');
    });
})();
