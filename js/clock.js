// 世界时钟：柏林 · 北京 · 纽约
// 时间由浏览器 Intl 按 IANA 时区直接换算（夏令时自动处理），不发任何请求
(function() {
    var lang = 'zh';
    var MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
    var DAYS = ['日','一','二','三','四','五','六'];

    var zones = [];
    document.querySelectorAll('.clock-time').forEach(function(el) {
        var tz = el.getAttribute('data-tz');
        if (!tz) return;
        var timeFmt, dateFmt;
        try {
            timeFmt = new Intl.DateTimeFormat('en-GB', {
                timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
            });
            dateFmt = new Intl.DateTimeFormat('en-CA', {
                timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', timeZoneName: 'shortOffset'
            });
        } catch (e) { return; }
        var subEl = document.querySelector('.clock-sub[data-tz="' + tz + '"]');
        zones.push({ el: el, subEl: subEl, timeFmt: timeFmt, dateFmt: dateFmt });
    });
    if (!zones.length) return;

    function pick(parts) {
        var v = {};
        parts.forEach(function(p) { if (p.type !== 'literal') v[p.type] = p.value; });
        return v;
    }

    function update() {
        var now = new Date();
        var localYmd = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
        zones.forEach(function(z) {
            var t = pick(z.timeFmt.formatToParts(now));
            z.el.textContent = t.hour + ':' + t.minute;
            if (!z.subEl) return;
            var d = pick(z.dateFmt.formatToParts(now));
            var y = +d.year, mo = +d.month, da = +d.day;
            var w = new Date(y, mo - 1, da).getDay();
            var off = (d.timeZoneName || '').replace('GMT', 'UTC');
            var dateTxt;
            if (lang === 'en') dateTxt = MONTHS[mo - 1] + ' ' + da + ', ' + DAYS[w];
            else if (lang === 'de') dateTxt = da + '. ' + MONTHS[mo - 1] + ', ' + DAYS[w];
            else dateTxt = mo + '月' + da + '日 周' + DAYS[w];
            z.subEl.textContent = dateTxt + (off ? ' · ' + off : '');
            // 与访客本地不同一天时（如上海已周五、纽约还是周四），日期用主题色点出来
            z.subEl.classList.toggle('clock-diff', (y + '-' + (mo - 1) + '-' + da) !== localYmd);
        });
    }

    // i18n.js 切换语言时回调，月份/星期改用当前语言的写法
    window.buildClockLang = function(l, t) {
        lang = l;
        MONTHS = t.months;
        DAYS = t.days;
        update();
    };

    update();
    setInterval(update, 10000); // 精确到分钟，10 秒对一次表足够
})();
