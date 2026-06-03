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

    function syncTone() {
        var tonePresets = {
            'rose':   { accent: '#d84b6b', rgb: '216, 75, 107',  accentDark: '#e05577', rgbDark: '224, 85, 119' },
            'blue':   { accent: '#3b82f6', rgb: '59, 130, 246',   accentDark: '#60a5fa', rgbDark: '96, 165, 250' },
            'purple': { accent: '#8b5cf6', rgb: '139, 92, 246',   accentDark: '#a78bfa', rgbDark: '167, 139, 250' },
            'orange': { accent: '#f59e0b', rgb: '245, 158, 11',   accentDark: '#fbbf24', rgbDark: '251, 191, 36' },
            'teal':   { accent: '#06b6d4', rgb: '6, 182, 212',    accentDark: '#22d3ee', rgbDark: '34, 211, 238' }
        };
        var t = localStorage.getItem('tone') || 'rose';
        var p = tonePresets[t];
        if (!p) return;
        var isDark = htmlElement.getAttribute('data-theme') === 'dark';
        htmlElement.style.setProperty('--accent', isDark ? p.accentDark : p.accent);
        htmlElement.style.setProperty('--accent-rgb', isDark ? p.rgbDark : p.rgb);
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
        syncTone();
    });
})();
