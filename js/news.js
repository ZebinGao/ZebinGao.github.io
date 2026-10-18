// 热点页：新浪滚动新闻（全部频道，分钟级更新）
// feed.mix.sina.com.cn 不发跨域头，但支持 callback= 参数的 JSONP，用 <script> 标签绕开跨域
// （微博/知乎的接口直连会被掐，和当年东方财富一个毛病；聚合 API 如 vvhan 已停服）。
// 每次取 30 条，过滤去重后展示 20 条，10 分钟拉一次，localStorage 缓存 10 分钟。
// 条目点开原地展开摘要（接口自带 intro/media_name，不用二次请求；keywords 该频道恒为空，不取），
// 末尾留「阅读原文」跳源站——全文抓回来渲染既过不了跨域也有版权问题。
(function() {
    var API_URL = 'https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2509&k=&num=30&page=1';
    var CB_NAME = 'sinaRollCb'; // 新浪要求 callback 名以字母开头（下划线开头会报 illegal character）
    var CACHE_KEY = 'sina-roll-news-v2'; // v2：条目结构加了摘要/来源/关键词字段
    var CACHE_TTL = 10 * 60 * 1000;
    var SHOW_COUNT = 20;

    var box = document.getElementById('news-box');
    if (!box) return;

    function readCache() {
        try {
            var c = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (c && c.data && c.time) return c;
        } catch (e) {}
        return null;
    }

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

    var loading = false;
    function fetchNews() {
        if (loading) return; // 防手抖双击出两个 script
        loading = true;
        var script = document.createElement('script');
        function cleanup() {
            loading = false;
            clearTimeout(timer);
            delete window[CB_NAME];
            if (script.parentNode) script.parentNode.removeChild(script);
        }
        var timer = setTimeout(function() { // JSONP 没有请求级超时，自己掐表
            cleanup();
            fail();
        }, 12000);
        window[CB_NAME] = function(data) {
            cleanup();
            var items = slim((data && data.result && data.result.data) || []);
            if (!items.length) { fail(); return; }
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: items.slice(0, SHOW_COUNT) }));
            } catch (e) {}
            render(items);
        };
        script.onerror = function() { cleanup(); fail(); };
        script.src = API_URL + '&callback=' + CB_NAME + '&_=' + Date.now();
        document.head.appendChild(script);
    }

    // 失败状态下点一下即重试
    box.addEventListener('click', function() {
        if (box.querySelector('.news-retry')) fetchNews();
    });

    var cached = readCache();
    if (cached && Date.now() - cached.time < CACHE_TTL) {
        if (cached.data.length) render(cached.data); // 10 分钟内直接用缓存，不请求
        else fetchNews();
    } else {
        if (cached && cached.data.length) render(cached.data); // 过期缓存先顶上，后台静默刷新
        fetchNews();
    }
    setInterval(fetchNews, CACHE_TTL); // 页面长开时每 10 分钟自动刷新
})();
