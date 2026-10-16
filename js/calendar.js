// 日历组件：当月网格 + 农历/节气悬停提示
// 农历换算由同目录的 lunar.min.js（lunar-javascript 库，本地文件）提供，
// 浏览器空闲时才加载，不阻塞页面首屏
(function() {
    var scriptUrl = (document.currentScript && document.currentScript.src) || '';
    var lunarUrl = scriptUrl ? scriptUrl.replace(/calendar\.js.*$/, 'lunar.min.js') : '/js/lunar.min.js';

    var calYear, calMonth;
    var lunarReady = false;
    var lunarLoading = false;

    function lunarOf(day) {
        if (!window.Lunar) return null;
        try {
            return window.Lunar.fromDate(new Date(calYear, calMonth, day));
        } catch (e) {
            return null;
        }
    }

    function buildCalendar() {
        var grid = document.getElementById('calendar-grid');
        var monthHeader = document.getElementById('calendar-month');
        if (!grid || !monthHeader) return;

        var now = new Date();
        calYear = now.getFullYear();
        calMonth = now.getMonth();
        var today = now.getDate();

        var monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        monthHeader.innerText = monthNames[calMonth] + ' ' + calYear;

        var firstDay = new Date(calYear, calMonth, 1).getDay();
        var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

        var html = '';
        for (var i = 0; i < firstDay; i++) {
            html += '<span></span>';
        }
        for (var d = 1; d <= daysInMonth; d++) {
            var lunar = lunarOf(d);
            var term = lunar ? lunar.getJieQi() : '';
            var cls = d === today ? ' class="today"' : '';
            html += '<span data-day="' + d + '"' + cls + (term ? ' data-term="' + term + '"' : '') + '>' + d + '</span>';
        }
        grid.innerHTML = html;
    }

    // 按需加载农历库；加载完成重建日历，给节气日补上小圆点标记
    function loadLunar() {
        if (lunarReady || lunarLoading || !document.getElementById('calendar-grid')) return;
        lunarLoading = true;
        var s = document.createElement('script');
        s.src = lunarUrl;
        s.onload = function() {
            lunarReady = true;
            buildCalendar();
        };
        s.onerror = function() {
            lunarLoading = false; // 允许下次悬停时重试
        };
        document.head.appendChild(s);
    }

    var idle = window.requestIdleCallback || function(fn) { setTimeout(fn, 3000); };
    idle(function() { loadLunar(); });

    // ---- 悬停提示气泡 ----
    function initTooltip() {
        var container = document.querySelector('.calendar-container');
        var grid = document.getElementById('calendar-grid');
        if (!container || !grid) return;

        var tip = document.createElement('div');
        tip.className = 'calendar-tooltip';
        container.appendChild(tip);

        var currentCell = null;
        var touchUsed = false;
        window.addEventListener('touchstart', function() { touchUsed = true; }, { once: true, passive: true });

        function show(cell) {
            if (!lunarReady) {
                loadLunar();
                return; // 库就绪后重建网格，再次悬停即可显示
            }
            var day = parseInt(cell.getAttribute('data-day'), 10);
            var lunar = lunarOf(day);
            if (!lunar) return;

            var leap = lunar.getMonth() < 0 ? '闰' : '';
            var term = lunar.getJieQi();
            tip.innerHTML =
                '<div class="lunar-date">农历' + leap + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese() + '</div>' +
                '<div class="lunar-year">' + lunar.getYearInGanZhi() + lunar.getYearShengXiao() + '年</div>' +
                (term ? '<div class="lunar-term">节气 · ' + term + '</div>' : '');

            // 定位：气泡居中对准日期格，上方放不下就挪到下方
            tip.style.left = '0px';
            tip.style.top = '0px';
            tip.classList.add('show');
            var cRect = container.getBoundingClientRect();
            var rect = cell.getBoundingClientRect();
            var left = rect.left - cRect.left + rect.width / 2 - tip.offsetWidth / 2;
            left = Math.max(2, Math.min(left, container.clientWidth - tip.offsetWidth - 2));
            var above = rect.top - cRect.top > tip.offsetHeight + 8;
            tip.style.top = (above ? rect.top - cRect.top - tip.offsetHeight - 6
                                   : rect.bottom - cRect.top + 6) + 'px';
            tip.style.left = left + 'px';
            currentCell = cell;
        }

        function hide() {
            tip.classList.remove('show');
            currentCell = null;
        }

        grid.addEventListener('mouseover', function(e) {
            var cell = e.target.closest('span[data-day]');
            if (cell && cell !== currentCell) show(cell);
        });
        grid.addEventListener('mouseout', function(e) {
            var cell = e.target.closest('span[data-day]');
            if (cell && !cell.contains(e.relatedTarget)) hide();
        });

        // 触屏没有 hover：点一下日期显示，再点一下或点空白处收起
        grid.addEventListener('click', function(e) {
            if (!touchUsed) return;
            var cell = e.target.closest('span[data-day]');
            if (!cell) return;
            e.stopPropagation();
            if (cell === currentCell) hide(); else show(cell);
        });
        document.addEventListener('click', function() { hide(); });
    }

    buildCalendar();
    initTooltip();
})();
