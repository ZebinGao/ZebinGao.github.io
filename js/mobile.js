// 移动端汉堡菜单
(function() {
    var hamburger = document.getElementById('mobile-hamburger');
    var overlay = document.getElementById('mobile-overlay');
    var sidebar = document.querySelector('.sidebar-left');
    var menuLinks = sidebar ? sidebar.querySelectorAll('.site-nav a') : [];

    function openMenu() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
    }
    function closeMenu() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }

    hamburger.addEventListener('click', function() {
        if (sidebar.classList.contains('open')) { closeMenu(); }
        else { openMenu(); }
    });

    overlay.addEventListener('click', closeMenu);

    menuLinks.forEach(function(link) {
        link.addEventListener('click', closeMenu);
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
