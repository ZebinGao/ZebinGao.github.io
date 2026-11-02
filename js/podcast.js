// 播客页：卡片墙 + 单档节目详情
// 数据是每日定时构建抓好的静态 JSON（tools/fetch-podcasts.mjs → /podcast/data.json，
// 机制同热点页的文学/英文/德语 tab），本页只做 fetch 同源文件 + 客户端渲染。
// 两层视图：卡片墙（全部节目）⇄ 节目详情（最近 10 期，点条目原地展开 shownotes
// + 内嵌播放器）。视图切换走 location.hash（#guiguzaozhidao 这类 show key），
// 刷新/分享能回到同一档，浏览器后退也能退回卡片墙。
// 播放器直连各托管方的音频 CDN：<audio> 不需要跨域头，小宇宙的 dts-api 地址
// 是永久 302 跳裸 CDN、支持 Range（拖进度条），实测八年前的存量也能放。
(function() {
    var box = document.getElementById('podcast-box');
    if (!box) return;

    var data = null;
    var audios = []; // 同时只放一个：起新的把旧的暂停

    // 日期统一北京时间；跨年的期目带年份，一眼区分存货还是新更
    var bjAll = null, bjDay = null;
    try {
        bjAll = new Intl.DateTimeFormat('zh-CN', {
            timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric'
        });
        bjDay = new Intl.DateTimeFormat('zh-CN', {
            timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric'
        });
    } catch (e) {}
    function fmtDate(ts) {
        var d = new Date(ts * 1000), now = new Date();
        var sameYear = bjAll && bjAll.format(d).slice(0, 4) === bjAll.format(now).slice(0, 4);
        return bjDay && sameYear ? bjDay.format(d) : (bjAll ? bjAll.format(d) : '');
    }

    // 封面图：加载失败（防盗链/CDN 抽风）退成首字符色块，卡片不至于破洞
    function coverEl(show, cls) {
        var letter = document.createElement('div');
        letter.className = cls + ' pod-cover-letter';
        letter.textContent = show.name.trim().charAt(0);
        if (!show.cover) return letter;
        var img = document.createElement('img');
        img.className = cls;
        img.alt = '';
        img.loading = 'lazy';
        img.src = show.cover;
        img.addEventListener('error', function() { if (img.parentNode) img.parentNode.replaceChild(letter, img); });
        return img;
    }

    function addAudio(src) {
        var a = document.createElement('audio');
        a.className = 'pod-audio';
        a.controls = true;
        a.preload = 'none'; // 十个播放器同时预载会抢带宽，点开才拉
        a.src = src;
        a.addEventListener('play', function() {
            audios.forEach(function(x) { if (x !== a) x.pause(); });
        });
        audios.push(a);
        return a;
    }

    // ── 视图一：卡片墙 ──
    function renderCards() {
        audios = [];
        box.innerHTML = '';
        var grid = document.createElement('div');
        grid.className = 'pod-cards';
        data.shows.forEach(function(show) {
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'pod-card';
            card.appendChild(coverEl(show, 'pod-cover'));
            var info = document.createElement('div');
            info.className = 'pod-card-info';
            var name = document.createElement('div');
            name.className = 'pod-card-name';
            name.textContent = show.name;
            var author = document.createElement('div');
            author.className = 'pod-card-author';
            author.textContent = show.author;
            var meta = document.createElement('div');
            meta.className = 'pod-card-meta';
            meta.textContent = '最新 ' + fmtDate(show.eps[0].c) + ' · ' + show.eps.length + ' 期';
            info.appendChild(name);
            info.appendChild(author);
            info.appendChild(meta);
            card.appendChild(info);
            card.addEventListener('click', function() { location.hash = show.key; });
            grid.appendChild(card);
        });
        box.appendChild(grid);
        var foot = document.createElement('div');
        foot.className = 'news-foot';
        foot.textContent = data.shows.length + ' 档节目 · 约两月更新一次';
        box.appendChild(foot);
    }

    // ── 视图二：单档详情 ──
    // 期目列表复用热点页 .news-item 那套（点开原地展开 + grid 0fr→1fr 过渡），
    // 展开区比新闻多一个 <audio> 播放器
    function renderDetail(show) {
        audios = [];
        box.innerHTML = '';

        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'pod-back';
        back.textContent = '‹ 全部播客';
        back.addEventListener('click', function() {
            // pushState 摘掉 hash（比 location.hash='' 干净，URL 不留 #），
            // 再手动路由；浏览器后退键靠 popstate 兜回详情
            history.pushState(null, '', location.pathname + location.search);
            route();
        });
        box.appendChild(back);

        var head = document.createElement('div');
        head.className = 'pod-show-head';
        head.appendChild(coverEl(show, 'pod-show-cover'));
        var info = document.createElement('div');
        info.className = 'pod-show-info';
        var name = document.createElement('div');
        name.className = 'pod-show-name';
        name.textContent = show.name;
        var author = document.createElement('div');
        author.className = 'pod-show-author';
        author.textContent = show.author;
        var desc = document.createElement('div');
        desc.className = 'pod-show-desc';
        desc.textContent = show.desc;
        info.appendChild(name);
        info.appendChild(author);
        info.appendChild(desc);
        if (show.link) {
            var home = document.createElement('a');
            home.className = 'pod-show-link';
            home.href = show.link;
            home.target = '_blank';
            home.rel = 'noopener';
            home.textContent = '节目主页 ›';
            info.appendChild(home);
        }
        head.appendChild(info);
        box.appendChild(head);

        var list = document.createElement('div');
        list.className = 'news-list';
        show.eps.forEach(function(ep) {
            var item = document.createElement('div');
            item.className = 'news-item';

            var headBtn = document.createElement('button');
            headBtn.type = 'button';
            headBtn.className = 'news-head pod-ep-head';
            var title = document.createElement('span');
            title.className = 'news-title';
            title.textContent = ep.t;
            var date = document.createElement('span');
            date.className = 'pod-ep-date';
            date.textContent = fmtDate(ep.c);
            var arrow = document.createElement('span');
            arrow.className = 'news-arrow';
            arrow.textContent = '▾';
            headBtn.appendChild(title);
            headBtn.appendChild(date);
            headBtn.appendChild(arrow);
            headBtn.addEventListener('click', function() { item.classList.toggle('open'); });
            item.appendChild(headBtn);

            var wrap = document.createElement('div');
            wrap.className = 'news-detail-wrap';
            var detail = document.createElement('div');
            detail.className = 'news-detail';
            if (ep.i) {
                var intro = document.createElement('p');
                intro.className = 'news-intro';
                intro.textContent = ep.i;
                detail.appendChild(intro);
            }
            detail.appendChild(addAudio(ep.a));
            var meta = document.createElement('div');
            meta.className = 'news-meta';
            if (ep.d) {
                var dur = document.createElement('span');
                dur.textContent = '⏱ ' + ep.d;
                meta.appendChild(dur);
            }
            if (ep.u) {
                var origin = document.createElement('a');
                origin.className = 'news-origin';
                origin.href = ep.u;
                origin.target = '_blank';
                origin.rel = 'noopener';
                origin.textContent = '原节目页面 ›';
                meta.appendChild(origin);
            }
            detail.appendChild(meta);
            wrap.appendChild(detail);
            item.appendChild(wrap);
            list.appendChild(item);
        });
        box.appendChild(list);
    }

    // ── 路由：#key → 该档详情，否则卡片墙 ──
    function route() {
        var key = (location.hash || '').replace('#', '');
        var show = null;
        for (var i = 0; i < data.shows.length; i++) {
            if (data.shows[i].key === key) { show = data.shows[i]; break; }
        }
        if (show) renderDetail(show);
        else renderCards();
        window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', route);
    window.addEventListener('popstate', route); // pushState 摘 hash 后的后退

    function fail() {
        box.innerHTML = '<div class="news-foot"><span class="news-retry">获取失败，点击重试</span></div>';
    }

    fetch('data.json').then(function(res) {
        if (!res.ok) throw new Error(res.status);
        return res.json();
    }).then(function(json) {
        data = json && json.shows && json.shows.length ? json : null;
        if (!data) throw new Error('empty');
        route();
    }).catch(fail);

    // 失败状态下点一下即重试（静态文件，重拉一次就够）
    box.addEventListener('click', function() {
        if (box.querySelector('.news-retry')) location.reload();
    });
})();
