// 热点页：新浪滚动新闻（分钟级更新，按频道切换）
// feed.mix.sina.com.cn 不发跨域头，但支持 callback= 参数的 JSONP，用 <script> 标签绕开跨域
// （微博/知乎的接口直连会被掐，和当年东方财富一个毛病；聚合 API 如 vvhan 已停服）。
// 频道分两套 pageid（2026-10 实测，153 全量扫 lid 2000-3500）：
//   pageid=153 —— 2509 财经（已不是"全部"！2516/2517/2518 与之重复）、2669 社会（民生条线
//   约占一半）、2513 娱乐（条目近半走电影路径）、2510 国内、2511 国际、2515 科技、2514 军事；
//   2512 挂着 sports 域名但其实是彩票流（29/30 条走 /lottery/ 路径），别当体育用。
//   pageid=13（体育滚动页 sports.sina.com.cn/roll/ 的真身）—— 573 中国足球、572 国际足球、
//   571 NBA、609 中国篮球、575 综合体育；2503"全部"被彩票刷屏。逗号多 lid 两套 pageid 都
//   不支持。体育 tab（5 子频道前端并拉合并）2026-10-29 做好当天撤下，lids 留此备查。
// k= 关键词过滤也废了（传什么都原样返回）——新浪滚动没有的频道做不了（如美食；
// 新浪读书频道 2025 年起实质停更）。文学 2026-10-29 上线：国内文学媒体没有可
// 直连的接口（所谓开放 RSS 全是幻觉），改由中国作家网构建期抓取生成静态 JSON
// （tools/fetch-literature.mjs → source/news/literature.json），本页 fetch 同源文
// 件，内容随每日构建更新——所以它不走 JSONP，页脚也不写"每 10 分钟刷新"。
// 娱乐（lid 2513，条目近半走电影路径）同日应用户要求换成文学，lid 留此备查。
// 每频道 10 分钟拉一次，localStorage 按频道缓存 10 分钟，上次停在哪个频道也记着。
// 条目点开原地展开摘要（接口自带 intro/media_name，不用二次请求；keywords 恒为空，不取），
// 末尾留「阅读原文」跳源站——全文抓回来渲染既过不了跨域也有版权问题。
(function() {
    var CHANNELS = [
        { key: 'finance', label: '财经', page: 153, lids: [2509] },
        { key: 'society', label: '社会', page: 153, lids: [2669] },
        { key: 'lit', label: '文学', json: 'literature.json' }, // 相对 /news/ 页面解析的静态文件
        { key: 'china', label: '国内', page: 153, lids: [2510] },
        { key: 'world', label: '国际', page: 153, lids: [2511] },
        { key: 'mil', label: '军事', page: 153, lids: [2514] },
        { key: 'tech', label: '科技', page: 153, lids: [2515] }
    ];
    var API_BASE = 'https://feed.mix.sina.com.cn/api/roll/get?pageid=';
    var CB_PREFIX = 'sinaRollCb'; // 新浪要求 callback 名以字母开头（下划线开头会报 illegal character）；
                                  // 多路并发时回包可能乱序，每次请求用独立回调名，数据才不会串台
    var CACHE_PREFIX = 'sina-roll-news-v5-'; // v5：娱乐→文学，键空间整体换血（旧缓存自然失效）
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
        foot.textContent = active.json
            ? '中国作家网 · 每日构建时更新'
            : hhmm(items[0].c) + ' 更新 · 每 10 分钟自动刷新';
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
            if (seen[t]) return; // 滚动源偶尔同题重发；子频道之间也有互相转载
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

    function cacheKey(key) { return CACHE_PREFIX + key; }
    function readCache(key) {
        try {
            var c = JSON.parse(localStorage.getItem(cacheKey(key)));
            if (c && c.data && c.time) return c;
        } catch (e) {}
        return null;
    }

    // 文学频道：JSON 由每日构建生成（构建期抓中国作家网），fetch 同源文件即可，
    // 不用 JSONP。失败时若有旧缓存就继续展示，没有才报错——静态文件很少挂。
    function fetchJson(chan) {
        fetch(chan.json).then(function(res) {
            if (!res.ok) throw new Error(res.status);
            return res.json();
        }).then(function(data) {
            var items = ((data && data.items) || []).filter(function(it) { return it.t && it.u; });
            if (!items.length) throw new Error('empty');
            try {
                localStorage.setItem(cacheKey(chan.key),
                    JSON.stringify({ time: Date.now(), data: items.slice(0, SHOW_COUNT) }));
            } catch (e) {}
            if (chan === active) render(items);
        }).catch(function() {
            if (chan !== active) return;
            var cached = readCache(chan.key);
            if (cached && cached.data.length) render(cached.data);
            else fail();
        }).then(function() { loading[chan.key] = false; });
    }

    // JSONP 没有请求级超时，自己掐表；回包时频道已被切走就只入缓存不渲染。
    // 多 lid 频道（体育）一次并拉几个 script，收齐或超时后统一合并、去重、按时间排序；
    // 个别子频道挂了不算失败，只要还有别的路活着就能出列表。
    var loading = {}, cbSeq = 0;
    function fetchNews(chan) {
        if (loading[chan.key]) return; // 同频道防重入（手抖双击 + 定时器撞车）
        loading[chan.key] = true;
        if (chan.json) { fetchJson(chan); return; } // 文学：静态文件走 fetch，不吃 JSONP 那套
        var num = chan.lids.length > 1 ? 10 : 30;
        var pending = chan.lids.length, pool = [], done = false;
        var timer;
        function finalize() {
            if (done) return;
            done = true;
            loading[chan.key] = false;
            clearTimeout(timer);
            var items = slim(pool).sort(function(a, b) { return b.c - a.c; });
            if (!items.length) {
                if (chan === active) fail();
                return;
            }
            try {
                localStorage.setItem(cacheKey(chan.key),
                    JSON.stringify({ time: Date.now(), data: items.slice(0, SHOW_COUNT) }));
            } catch (e) {}
            if (chan === active) render(items);
        }
        timer = setTimeout(finalize, 12000); // 有请求没回来也照样用已到货的合成
        chan.lids.forEach(function(lid) {
            var cb = CB_PREFIX + (++cbSeq);
            var script = document.createElement('script');
            var settled = false;
            function settle() {
                if (settled) return;
                settled = true;
                try { delete window[cb]; } catch (e) {}
                if (script.parentNode) script.parentNode.removeChild(script);
                if (--pending === 0) finalize();
            }
            window[cb] = function(data) {
                if (settled) return;
                pool = pool.concat((data && data.result && data.result.data) || []);
                settle();
            };
            script.onerror = settle;
            script.src = API_BASE + chan.page + '&lid=' + lid + '&k=&num=' + num +
                '&page=1&callback=' + cb + '&_=' + Date.now();
            document.head.appendChild(script);
        });
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
        var cached = readCache(chan.key);
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

    var cached = readCache(active.key);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
        if (cached.data.length) render(cached.data); // 10 分钟内直接用缓存，不请求
        else fetchNews(active);
    } else {
        if (cached && cached.data.length) render(cached.data); // 过期缓存先顶上，后台静默刷新
        fetchNews(active);
    }
    // 页面长开时每 10 分钟刷新当前频道；文学是静态文件（随每日构建更新），不参与轮询
    setInterval(function() { if (!active.json) fetchNews(active); }, CACHE_TTL);
})();
