// 桌面端搜索功能
(function() {
    var searchInput = document.getElementById('search-input');
    var searchResults = document.getElementById('search-results');
    var searchData = null;

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

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.innerHTML = '';
        }
    });
})();
