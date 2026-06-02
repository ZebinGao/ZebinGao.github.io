// 主题切换
(function() {
    var toggleBtn = document.getElementById('theme-toggle');
    var themeIcon = document.getElementById('theme-icon');
    var htmlElement = document.documentElement;

    var currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        themeIcon.innerText = '☀️';
    }

    toggleBtn.addEventListener('click', function() {
        var theme = htmlElement.getAttribute('data-theme');

        if (theme === 'dark') {
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.innerText = '🌙';
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.innerText = '☀️';
        }
    });
})();
