// 右栏小部件折叠：点击标题展开/收起，每个部件的开关状态记在 localStorage
// 默认全部收起；用户点开过的部件存 false，下次进来直接保持展开
(function() {
    var KEY = 'widget-collapsed';
    var state = {};
    try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}

    document.querySelectorAll('.sidebar-right .widget').forEach(function(w, idx) {
        var h3 = w.querySelector('h3');
        if (!h3) return;

        // 用标题里的 data-i18n 键当稳定 ID（search/toc/hot_tags/calendar/clock/weather/stock 互不重复），
        // 以后调整部件顺序也不会串状态
        var label = h3.querySelector('[data-i18n]');
        var id = label ? label.getAttribute('data-i18n') : ('widget-' + idx);

        // 把 h3 之后的内容统一包进可折叠容器（grid 0fr/1fr 负责高度过渡，见 style.css）
        var wrap = document.createElement('div');
        wrap.className = 'widget-body-wrap';
        var body = document.createElement('div');
        body.className = 'widget-body';
        while (h3.nextSibling) body.appendChild(h3.nextSibling);
        wrap.appendChild(body);
        w.appendChild(wrap);

        h3.addEventListener('click', function() {
            w.classList.toggle('collapsed');
            state[id] = w.classList.contains('collapsed');
            try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
        });

        if (state[id] !== false) w.classList.add('collapsed'); // 默认收起，点过"展开"的除外
    });
})();
