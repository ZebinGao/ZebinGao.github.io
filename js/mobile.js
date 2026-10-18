// 移动端抽屉：左栏（导航）、右栏（小工具），同一时刻只开一个
(function() {
    var hamburger = document.getElementById('mobile-hamburger');
    var widgetsBtn = document.getElementById('mobile-widgets-btn');
    var overlay = document.getElementById('mobile-overlay');
    var left = document.querySelector('.sidebar-left');
    var right = document.querySelector('.sidebar-right');

    function closeAll() {
        if (left) left.classList.remove('open');
        if (right) right.classList.remove('open');
        overlay.classList.remove('open');
        document.body.classList.remove('drawer-open');
    }
    function toggle(el) {
        var wasOpen = el.classList.contains('open');
        closeAll();
        if (!wasOpen) {
            el.classList.add('open');
            overlay.classList.add('open');
            document.body.classList.add('drawer-open');
        }
    }

    hamburger.addEventListener('click', function() { toggle(left); });
    if (widgetsBtn && right) {
        widgetsBtn.addEventListener('click', function() { toggle(right); });
    }

    overlay.addEventListener('click', closeAll);

    // 点击抽屉里的链接（导航 / 目录 / 标签云）后自动收起
    document.querySelectorAll('.sidebar-left a, .sidebar-right a').forEach(function(link) {
        link.addEventListener('click', closeAll);
    });

    // 旋转屏幕 / 拉宽窗口回到桌面端布局时，收起抽屉并解除滚动锁定
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900) closeAll();
    });
})();

// 移动端主题切换
(function() {
    var mobileToggle = document.getElementById('mobile-theme-toggle');
    var mobileIcon = document.getElementById('mobile-theme-icon');
    var desktopIcon = document.getElementById('theme-icon');
    var htmlElement = document.documentElement;

    // 同步初始状态
    if (htmlElement.getAttribute('data-theme') === 'dark') {
        mobileIcon.innerText = '☀️';
    }

    mobileToggle.addEventListener('click', function() {
        var theme = htmlElement.getAttribute('data-theme');
        if (theme === 'dark') {
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            mobileIcon.innerText = '🌙';
            desktopIcon.innerText = '🌙';
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            mobileIcon.innerText = '☀️';
            desktopIcon.innerText = '☀️';
        }
    });
})();

// 移动端搜索
(function() {
    var searchBtn = document.getElementById('mobile-search-btn');
    var searchBar = document.getElementById('mobile-search-bar');
    var searchInput = document.getElementById('mobile-search-input');
    var searchResults = document.getElementById('mobile-search-results');
    var searchData = null;

    searchBtn.addEventListener('click', function() {
        searchBar.classList.toggle('open');
        if (searchBar.classList.contains('open')) {
            searchInput.focus();
        } else {
            searchResults.innerHTML = '';
            searchInput.value = '';
        }
    });

    function loadSearchData(callback) {
        if (searchData) { callback(); return; }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/search.xml', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var parser = new DOMParser();
                var xml = parser.parseFromString(xhr.responseText, 'text/xml');
                searchData = xml.querySelectorAll('entry');
                callback();
            }
        };
        xhr.send();
    }

    searchInput.addEventListener('input', function() {
        var query = this.value.trim().toLowerCase();
        if (!query) { searchResults.innerHTML = ''; return; }

        loadSearchData(function() {
            var html = '';
            var count = 0;
            searchData.forEach(function(entry) {
                var title = entry.querySelector('title').textContent.toLowerCase();
                var content = entry.querySelector('content').textContent.toLowerCase();
                if (title.indexOf(query) > -1 || content.indexOf(query) > -1) {
                    var url = entry.querySelector('url').textContent;
                    var displayTitle = entry.querySelector('title').textContent;
                    html += '<a class="search-result-item" href="' + url + '">' + displayTitle + '</a>';
                    count++;
                    if (count >= 8) return;
                }
            });
            searchResults.innerHTML = html || '<div class="search-no-result">未找到相关文章</div>';
        });
    });
})();
