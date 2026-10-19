// 左栏一言：头像简介下面随机一句话，点击换一句
// v1.hitokoto.cn 现在带 CORS 头，fetch 直取（老主题 diaspora 时代可没这待遇）。
// 分类只取文学/诗词/哲学（c=d/i/k），限长 24 字——左栏就那么宽，句子长了折成四五行就毁了。
// 失败不提示、不占位：签名行拿不到句子就整行隐藏，下次进页面再试。
(function() {
    var API = 'https://v1.hitokoto.cn/?c=d&c=i&c=k&max_length=24';
    var box = document.getElementById('hitokoto-line');
    if (!box) return;
    var textEl = document.getElementById('hitokoto-text');
    var fromEl = document.getElementById('hitokoto-from');
    var current = ''; // 换句时撞上同一句要再抽一次，记着上一句
    var loading = false;

    function show(d) {
        current = d.hitokoto;
        textEl.textContent = '「' + d.hitokoto + '」';
        // from 偶尔是「甲 / 乙 / 丙」的合订形式，取第一部；作者书名齐全用 作者《书名》
        var from = (d.from || '').split(' / ')[0].trim();
        var who = (d.from_who || '').trim();
        var src = '';
        if (who && from) src = '—— ' + who + '《' + from + '》';
        else if (who) src = '—— ' + who;
        else if (from) src = '——《' + from + '》';
        fromEl.textContent = src;
        fromEl.style.display = src ? 'block' : 'none';
        box.style.display = 'block'; // 拿到内容才露面（CSS 默认 display:none）
    }

    function fetchOne(cb) {
        fetch(API, { cache: 'no-store' })
            .then(function(r) { return r.json(); })
            .then(function(d) { cb(d && d.hitokoto ? d : null); })
            .catch(function() { cb(null); }); // 空响应 r.json() 会抛，同样走到这
    }

    function load() {
        if (loading) return; // 防连点
        loading = true;
        box.style.opacity = '0.5'; // 抽取中半透明示意，换句有反馈
        fetchOne(function(d) {
            // 抽到同一句或空响应：再抽一次；连着两次不行就认命保留原句
            if (d && d.hitokoto !== current) { done(d); return; }
            fetchOne(function(d2) {
                if (d2 && d2.hitokoto !== current) done(d2);
                else { loading = false; box.style.opacity = ''; }
            });
        });
    }

    function done(d) {
        loading = false;
        box.style.opacity = '';
        show(d);
    }

    box.addEventListener('click', load);
    load();
})();
