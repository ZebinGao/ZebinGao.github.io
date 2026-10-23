// 行情小工具：上证指数 · 宇树科技(688836) · 智谱(02513.HK) · 上汽集团(600104) · 药明康德(603259)
// 数据来自腾讯公开行情接口（免密钥，跨域开放，GBK 编码，需用 TextDecoder 解码），
// 每小时更新一次，结果在 localStorage 缓存 1 小时，翻页不重复请求；
// 底部 ↻ 按钮无视缓存立刻拉新，成功即重写缓存、计时归零。
// 弃用的东方财富 push2 接口会随机掐断连接（首版"获取失败"的元凶）
(function() {
    var API_URL = 'https://qt.gtimg.cn/q=sh000001,sh688836,hk02513,sh600104,sh603259';
    var CACHE_KEY = 'stock-quotes-tx2'; // 加股票时改 key：旧缓存里没有新代码，别让占位符干等一小时
    var CACHE_TTL = 60 * 60 * 1000;

    // 腾讯代码前缀 → [交易所后缀, 币种]（悬停提示用）
    var MKT = { 'sh': ['.SH', ' CNY'], 'sz': ['.SZ', ' CNY'], 'hk': ['.HK', ' HKD'] };

    var box = document.getElementById('stock-box');
    if (!box) return;

    var rows = [];
    box.querySelectorAll('.stock-row').forEach(function(el) {
        rows.push({
            key: el.getAttribute('data-secid'),
            priceEl: el.querySelector('.stock-price'),
            chgEl: el.querySelector('.stock-chg')
        });
    });
    if (!rows.length) return;

    function readCache() {
        try {
            var c = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (c && c.data && c.time) return c;
        } catch (e) {}
        return null;
    }

    // 响应形如 v_sh688836="1~宇树科技-W~688836~426.98~..."，拆成 key → 字段数组
    function parse(text) {
        var map = {};
        var re = /v_(\w+)="([^"]*)"/g, m;
        while ((m = re.exec(text))) map[m[1]] = m[2].split('~');
        return map;
    }

    // 行情时间戳：A股 yyyymmddHHMMss，港股 yyyy/MM/dd HH:mm:ss，去掉非数字后截 HH:MM
    function quoteTime(f) {
        var d = (f[30] || '').replace(/\D/g, '');
        return d.length >= 12 ? d.slice(8, 10) + ':' + d.slice(10, 12) : '';
    }

    function render(text) {
        var quotes = parse(text);
        rows.forEach(function(r) {
            var f = quotes[r.key];
            if (!f) return;
            var price = parseFloat(f[3]);
            var pct = parseFloat(f[32]);
            var chg = parseFloat(f[31]);
            if (!isFinite(price)) return; // 停牌时保持占位符
            r.priceEl.textContent = price.toFixed(2);
            if (isFinite(pct)) {
                var sign = pct > 0 ? '+' : '';
                r.chgEl.textContent = sign + pct.toFixed(2) + '%' +
                    (isFinite(chg) ? ' ' + sign + chg.toFixed(2) : '');
                // A股习惯：红涨绿跌
                r.chgEl.className = 'stock-chg ' + (pct > 0 ? 'up' : (pct < 0 ? 'down' : 'flat'));
            }
            var m = MKT[r.key.slice(0, 2)] || [''];
            r.chgEl.parentElement.title = f[1] + m[0] + ' · ' + price.toFixed(2) + (m[1] || '');
        });
        // 底部时间取第一行行情自带的时间戳，而非本地时刻。
        // 只写时间 span：foot 里还有刷新按钮，整栏 textContent 会把它抹掉
        var first = quotes[rows[0].key];
        var timeEl = document.getElementById('stock-time');
        if (timeEl && first) {
            var t = quoteTime(first);
            timeEl.textContent = t ? t + ' 更新' : '';
        }
    }

    function fail() {
        var timeEl = document.getElementById('stock-time');
        if (timeEl) timeEl.innerHTML = '<span class="stock-retry">获取失败，点击重试</span>';
    }

    var loading = false;

    function spin(on) {
        var b = document.getElementById('stock-refresh');
        if (b) b.classList.toggle('spin', on);
    }

    function fetchStocks() {
        if (loading) return; // 防重入：手点、整点定时器、启动加载撞车也不叠请求
        loading = true;
        spin(true);
        fetch(API_URL)
            .then(function(r) { return r.arrayBuffer(); })
            .then(function(buf) {
                var text = new TextDecoder('gbk').decode(buf);
                loading = false;
                spin(false);
                if (text.indexOf('v_') < 0) { fail(); return; }
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: text }));
                } catch (e) {}
                render(text);
            })
            .catch(function() {
                loading = false;
                spin(false);
                fail();
            });
    }

    // 失败状态下点一下即重试
    box.addEventListener('click', function() {
        if (box.querySelector('.stock-retry')) fetchStocks();
    });

    // 底部 ↻：无视缓存立刻拉新
    var btn = document.getElementById('stock-refresh');
    if (btn) btn.addEventListener('click', function(e) {
        e.stopPropagation(); // 失败态下不再冒泡触发 box 的重试，一次就够
        fetchStocks();
    });

    var cached = readCache();
    if (cached && Date.now() - cached.time < CACHE_TTL) {
        render(cached.data); // 一小时内直接用缓存，不请求
    } else {
        if (cached) render(cached.data); // 过期缓存先顶上，后台静默刷新
        fetchStocks();
    }
    setInterval(fetchStocks, CACHE_TTL); // 页面长开时每小时自动刷新一次
})();
