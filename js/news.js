// 热点页：新浪滚动新闻（分钟级更新，按频道切换）
// feed.mix.sina.com.cn 不发跨域头，但支持 callback= 参数的 JSONP，用 <script> 标签绕开跨域
// （微博/知乎的接口直连会被掐，和当年东方财富一个毛病；聚合 API 如 vvhan 已停服）。
// 频道号 lid 实测（2026-10 全量扫 2500-2999，共 15 个活号）：2509 已不是"全部"而是
// 财经聚合（2516/2517/2518 与之重复）；2669 社会（民生条线约占一半）、2513 娱乐（条目
// 近半走电影路径）、2510 国内、2511 国际、2515 科技、2512 体育、2514 军事。
// 2519 起的旧频道号全部下线，
// k= 关键词过滤也废了（传什么都原样返回），逗号多 lid 不支持——所以新浪滚动没有的
// 频道（如美食）做不了，只能靠对应频道顶（美食没有，电影并进娱乐）。
// 每频道每次取 30 条，过滤去重后展示 20 条，10 分钟拉一次，localStorage 按频道缓存
// 10 分钟，上次停在哪个频道也记着。条目点开原地展开摘要（接口自带 intro/media_name，
// 不用二次请求；keywords 该接口恒为空，不取），末尾留「阅读原文」跳源站——全文抓回来
// 渲染既过不了跨域也有版权问题。
(function() {
    var CHANNELS = [
        { key: 'finance', label: '财经', lid: 2509 },
        { key: 'society', label: '社会', lid: 2669 },
        { key: 'ent', label: '娱乐', lid: 2513 },
        { key: 'sports', label: '体育', lid: 2512 },
        { key: 'china', label: '国内', lid: 2510 },
        { key: 'world', label: '国际', lid: 2511 },
        { key: 'mil', label: '军事', lid: 2514 },
        { key: 'tech', label: '科技', lid: 2515 }
    ];
    var API_BASE = 'https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=';
    var CB_PREFIX = 'sinaRollCb'; // 新浪要求 callback 名以字母开头（下划线开头会报 illegal character）；
                                  // 多频道并发时回包可能乱序，每次请求用独立回调名，数据才不会串台
    var CACHE_PREFIX = 'sina-roll-news-v3-'; // v3：多频道，按 lid 分键
    var CHAN_KEY = 'sina-roll-news-chan'; // 上次停留的频道 key
    var CACHE_TTL = 10 * 60 * 1000;
    var SHOW_COUNT = 20;

    var box = document.getElementById('news-box');
    if (!box) return;
    var app = document.getElementById('news-app');

    // 新闻时间统一按北京时间显示，和世界时钟的"北京"行对得上
    var bjTime = null;
    try {
        bjTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        });
    } catch (e) {}
    function hhmm(ts) {
        return bjTime ? bjTime.format(new Date(ts * 1000)) : '';
    }

    function render(items) {
        box.innerHTML = '';
        items.slice(0, SHOW_COUNT).forEach(function(it) {
            var item = document.createElement('div');
            item.className = 'news-item';

            // 头部：标题 + 展开箭头，点一下原地展开/收起摘要
            var head = document.createElement('button');
            head.type = 'button';
            head.className = 'news-head';
            var title = document.createElement('span');
            title.className = 'news-title';
            title.textContent = it.t; // 用 textContent，标题里的尖括号等不会进 HTML
            var arrow = document.createElement('span');
            arrow.className = 'news-arrow';
            arrow.textContent = '▾';
            head.appendChild(title);
            head.appendChild(arrow);
            head.addEventListener('click', function() {
                item.classList.toggle('open');
            });
            item.appendChild(head);

            // 摘要区：grid 0fr→1fr 撑开，高度有过渡动画
            var wrap = document.createElement('div');
            wrap.className = 'news-detail-wrap';
            var detail = document.createElement('div');
            detail.className = 'news-detail';
            if (it.i) {
                var intro = document.createElement('p');
                intro.className = 'news-intro';
                intro.textContent = it.i;
                detail.appendChild(intro);
            }
            var meta = document.createElement('div');
            meta.className = 'news-meta';
            if (it.m) {
                var src = document.createElement('span');
                src.className = 'news-src';
                src.textContent = it.m;
                meta.appendChild(src);
            }
            var origin = document.createElement('a');
            origin.className = 'news-origin';
            origin.href = it.u;
            origin.target = '_blank';
            origin.rel = 'noopener';
            origin.textContent = '阅读原文 ›';
            meta.appendChild(origin);
            detail.appendChild(meta);
            wrap.appendChild(detail);
            item.appendChild(wrap);
            box.appendChild(item);
        });
        var foot = document.createElement('div');
        foot.className = 'news-foot';
        foot.textContent = hhmm(items[0].c) + ' 更新 · 每 10 分钟自动刷新';
        box.appendChild(foot);
    }

    function fail() {
        box.innerHTML = '<div class="news-foot"><span class="news-retry">获取失败，点击重试</span></div>';
    }

    // 原始条目裁成 {t,u,c,i,m} 再缓存：体积小，字段可控
    function slim(list) {
        var seen = {}, out = [];
        list.forEach(function(d) {
            var t = (d.title || '').trim();
            if (!t || !d.url) return;
            if (seen[t]) return; // 滚动源偶尔同题重发
            seen[t] = 1;
            out.push({
                t: t,
                u: d.url,
                c: parseInt(d.ctime, 10) || Math.floor(Date.now() / 1000),
                i: (d.intro || d.summary || d.wapsummary || '').trim(), // 摘要，字段名新浪换过几轮
                m: (d.media_name || '').trim()
            });
        });
        return out;
    }

    function cacheKey(lid) { return CACHE_PREFIX + lid; }
    function readCache(lid) {
        try {
            var c = JSON.parse(localStorage.getItem(cacheKey(lid)));
            if (c && c.data && c.time) return c;
        } catch (e) {}
        return null;
    }

    // JSONP 没有请求级超时，自己掐表；回包时频道已被切走就只入缓存不渲染
    var loading = {}, cbSeq = 0;
    function fetchNews(chan) {
        if (loading[chan.lid]) return; // 同频道防重入（手抖双击 + 定时器撞车）
        loading[chan.lid] = true;
        var cb = CB_PREFIX + (++cbSeq);
        var script = document.createElement('script');
        var done = false;
        function cleanup() {
            done = true;
            loading[chan.lid] = false;
            clearTimeout(timer);
            try { delete window[cb]; } catch (e) {}
            if (script.parentNode) script.parentNode.removeChild(script);
        }
        var timer = setTimeout(function() {
            cleanup();
            if (chan === active) fail();
        }, 12000);
        window[cb] = function(data) {
            if (done) return;
            cleanup();
            var items = slim((data && data.result && data.result.data) || []);
            if (!items.length) {
                if (chan === active) fail();
                return;
            }
            try {
                localStorage.setItem(cacheKey(chan.lid),
                    JSON.stringify({ time: Date.now(), data: items.slice(0, SHOW_COUNT) }));
            } catch (e) {}
            if (chan === active) render(items);
        };
        script.onerror = function() {
            if (done) return;
            cleanup();
            if (chan === active) fail();
        };
        script.src = API_BASE + chan.lid + '&k=&num=30&page=1&callback=' + cb + '&_=' + Date.now();
        document.head.appendChild(script);
    }

    // 频道切换条：胶囊样式复用 .category-tab（同 .directory-tabs 的做法）
    var active = CHANNELS[0];
    try {
        var saved = localStorage.getItem(CHAN_KEY);
        for (var i = 0; i < CHANNELS.length; i++) {
            if (CHANNELS[i].key === saved) active = CHANNELS[i];
        }
    } catch (e) {}
    var bar = document.createElement('div');
    bar.className = 'news-tabs';
    CHANNELS.forEach(function(chan) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'category-tab';
        b.textContent = chan.label;
        b.addEventListener('click', function() { switchTo(chan); });
        if (chan === active) b.classList.add('active');
        bar.appendChild(b);
    });
    app.insertBefore(bar, box);

    function switchTo(chan) {
        if (chan === active) return;
        active = chan;
        try { localStorage.setItem(CHAN_KEY, chan.key); } catch (e) {}
        var tabs = bar.children;
        for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', CHANNELS[i] === chan);
        var cached = readCache(chan.lid);
        if (cached && cached.data.length) {
            render(cached.data);
            if (Date.now() - cached.time >= CACHE_TTL) fetchNews(chan); // 过期缓存先顶上，后台静默刷新
        } else {
            box.innerHTML = '<div class="news-loading">获取中…</div>';
            fetchNews(chan);
        }
    }

    // 失败状态下点一下即重试
    box.addEventListener('click', function() {
        if (box.querySelector('.news-retry')) fetchNews(active);
    });

    var cached = readCache(active.lid);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
        if (cached.data.length) render(cached.data); // 10 分钟内直接用缓存，不请求
        else fetchNews(active);
    } else {
        if (cached && cached.data.length) render(cached.data); // 过期缓存先顶上，后台静默刷新
        fetchNews(active);
    }
    setInterval(function() { fetchNews(active); }, CACHE_TTL); // 页面长开时每 10 分钟刷新当前频道
})();
