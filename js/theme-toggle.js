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
            'rose':   { accent: '#f0849a', rgb: '240, 132, 154',  accentDark: '#d84b6b', rgbDark: '216, 75, 107' },
            'blue':   { accent: '#60a5fa', rgb: '96, 165, 250',   accentDark: '#3b82f6', rgbDark: '59, 130, 246' },
            'purple': { accent: '#a78bfa', rgb: '167, 139, 250',  accentDark: '#8b5cf6', rgbDark: '139, 92, 246' },
            'orange': { accent: '#fbbf24', rgb: '251, 191, 36',   accentDark: '#f59e0b', rgbDark: '245, 158, 11' },
            'teal':   { accent: '#22d3ee', rgb: '34, 211, 238',   accentDark: '#06b6d4', rgbDark: '6, 182, 212' }
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
