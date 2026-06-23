// 国际化(i18n)语言切换
(function() {
    // window.__i18n_default 由 layout.ejs 中的 inline script 注入
    var defaultLang = window.__i18n_default || 'zh';

    var translations = {
        en: {
            search: 'Search',
            search_placeholder: 'Search articles...',
            no_result: 'No results found',
            toc: 'Table of Contents',
            hot_tags: 'Popular Tags',
            calendar: 'Calendar',
            movies: 'Movies',
            books: 'Books',
            music: 'Music',
            exhibitions: 'Exhibitions',
            all: 'All',
            settings: 'Settings',
            settings_theme: 'Appearance',
            settings_theme_desc: 'Choose light or dark mode',
            settings_light: 'Light',
            settings_dark: 'Dark',
            settings_language: 'Language',
            settings_language_desc: 'Choose display language',
            settings_rss: 'RSS Feed',
            settings_rss_desc: 'Subscribe to blog updates via RSS reader',
            settings_rss_subscribe: 'Subscribe RSS',
            settings_font: 'Font',
            settings_font_desc: 'Choose body text font style',
            settings_font_default: 'Sans-serif',
            settings_fontsize: 'Font Size',
            settings_fontsize_desc: 'Adjust body text size',
            settings_fontsize_small: 'Small',
            settings_fontsize_default: 'Default',
            settings_fontsize_medium: 'Medium',
            settings_fontsize_large: 'Large',
            settings_fontsize_xlarge: 'Extra Large',
            settings_tone: 'Color Tone',
            settings_tone_desc: 'Choose overall color style',
            settings_tone_rose: 'Rose',
            settings_tone_blue: 'Blue',
            settings_tone_purple: 'Purple',
            settings_tone_orange: 'Orange',
            settings_tone_teal: 'Teal',
            watched: 'Watched',
            want_to_watch: 'Want to Watch',
            read: 'Read',
            in_read: 'Reading',
            want_to_read: 'Want to Read',
            read_more: 'Read more »',
            prev_page: 'Previous',
            next_page: 'Next',
            categories: 'Categories',
            articles_unit: 'articles',
            friend_links: 'Friend Links',
            hobbies: 'Hobbies',
            published_on: 'Published: ',
            month_suffix: '',
            months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            menu: {'首页':'Home','归档':'Archives','分类':'Categories','友链':'Links','兴趣爱好':'Hobbies','关于':'About','足迹':'Footprints','Wiki':'Wiki','2048小游戏':'2048','谢益辉的恶作剧':'Prank','设置':'Settings'},
            cat: {
                'AI 公式': 'AI Formulas', '深度学习中的数学公式推导与解析': 'Math formula derivations in deep learning',
                '电影': 'Movies', '看过的电影与观影感想': 'Movies I\'ve watched and my thoughts',
                '书籍': 'Books', '读过的书与读书笔记': 'Books I\'ve read and my notes',
                '音乐': 'Music', '喜欢的音乐与背后故事': 'Favorite music and stories behind them',
                '展览': 'Exhibitions', '看过的展览与观展笔记': 'Exhibitions I\'ve visited and my notes',
                '羽毛球': 'Badminton', '羽毛球技术笔记与比赛心得': 'Badminton technique notes and competition insights',
                '草台班子': 'A Mickey Mouse operation', '那些令人唏嘘的意外与逝去': 'Lamentable accidents and losses',
                '伤仲永': 'Become an ordinary person', '被天赋与期望裹挟的人生': 'Lives engulfed by talent and expectations',
                '青春的故事': 'Stories of Youth', '那些关于青春的回忆与感悟': 'Memories and Reflections on Youth',
                '产业界资讯': 'Industry News', '最新的产业界动态与分析': 'Latest Industry Updates and Analysis',
                '生活随笔': 'Life Notes', '情感与心理': 'Emotions & Psychology', '社会观察': 'Social Observations', '技术笔记': 'Tech Notes', '读书与思考': 'Reading & Reflection', '转载': 'Reposts',
                '前端': 'Frontend', '后端': 'Backend', '综合': 'General', '独立博客': 'Personal Blogs', '技术服务': 'Tech Services', '社区论坛': 'Community Forums', '效率工具': 'Productivity Tools'
            }
        },
        de: {
            search: 'Suche',
            search_placeholder: 'Artikel suchen...',
            no_result: 'Keine Ergebnisse gefunden',
            toc: 'Inhaltsverzeichnis',
            hot_tags: 'Beliebte Tags',
            calendar: 'Kalender',
            movies: 'Filme',
            books: 'Bücher',
            music: 'Musik',
            exhibitions: 'Ausstellungen',
            all: 'Alle',
            settings: 'Einstellungen',
            settings_theme: 'Erscheinungsbild',
            settings_theme_desc: 'Hell- oder Dunkelmodus wählen',
            settings_light: 'Hell',
            settings_dark: 'Dunkel',
            settings_language: 'Sprache',
            settings_language_desc: 'Anzeigesprache wählen',
            settings_rss: 'RSS-Feed',
            settings_rss_desc: 'Blog-Updates per RSS-Reader abonnieren',
            settings_rss_subscribe: 'RSS abonnieren',
            settings_font: 'Schriftart',
            settings_font_desc: 'Schriftstil für den Fließtext wählen',
            settings_font_default: 'Sans-Serif',
            settings_fontsize: 'Schriftgröße',
            settings_fontsize_desc: 'Textgröße anpassen',
            settings_fontsize_small: 'Klein',
            settings_fontsize_default: 'Standard',
            settings_fontsize_medium: 'Mittel',
            settings_fontsize_large: 'Groß',
            settings_fontsize_xlarge: 'Sehr groß',
            settings_tone: 'Farbton',
            settings_tone_desc: 'Allgemeinen Farbstil wählen',
            settings_tone_rose: 'Rosa',
            settings_tone_blue: 'Blau',
            settings_tone_purple: 'Lila',
            settings_tone_orange: 'Orange',
            settings_tone_teal: 'Türkis',
            watched: 'Gesehen',
            want_to_watch: 'Möchte sehen',
            read: 'Gelesen',
            in_read: 'Am Lesen',
            want_to_read: 'Möchte lesen',
            read_more: 'Weiterlesen »',
            prev_page: 'Zurück',
            next_page: 'Weiter',
            categories: 'Kategorien',
            articles_unit: 'Artikel',
            friend_links: 'Empfehlungen',
            hobbies: 'Hobbys',
            published_on: 'Veröffentlicht: ',
            month_suffix: '',
            months: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
            days: ['So','Mo','Di','Mi','Do','Fr','Sa'],
            menu: {'首页':'Startseite','归档':'Archiv','分类':'Kategorien','友链':'Links','兴趣爱好':'Hobbys','关于':'Über mich','足迹':'Fußspuren','Wiki':'Wiki','2048小游戏':'2048','谢益辉的恶作剧':'Streich','设置':'Einstellungen'},
            cat: {
                'AI 公式': 'KI-Formeln', '深度学习中的数学公式推导与解析': 'Mathematische Formelableitungen im Deep Learning',
                '电影': 'Filme', '看过的电影与观影感想': 'Filme die ich gesehen habe und meine Gedanken',
                '书籍': 'Bücher', '读过的书与读书笔记': 'Gelesene Bücher und meine Notizen',
                '音乐': 'Musik', '喜欢的音乐与背后故事': 'Lieblingsmusik und die Geschichten dahinter',
                '展览': 'Ausstellungen', '看过的展览与观展笔记': 'Ausstellungen, die ich besucht habe, und meine Notizen',
                '羽毛球': 'Badminton', '羽毛球技术笔记与比赛心得': 'Badminton-Technik und Wettbewerbserfahrungen',
                '草台班子': 'Der Saftladen', '那些令人唏嘘的意外与逝去': 'Bedauerliche Unfälle und Verluste',
                '伤仲永': 'Zu einem gewöhnlichen Menschen werden', '被天赋与期望裹挟的人生': 'Leben im Griff von Talent und Erwartungen',
                '青春的故事': 'Geschichten der Jugend', '那些关于青春的回忆与感悟': 'Erinnerungen und Erkenntnisse über die Jugend',
                '产业界资讯': 'Branchennews', '最新的产业界动态与分析': 'Neueste Branchenupdates und Analysen',
                '生活随笔': 'Lebensnotizen', '情感与心理': 'Gefühle & Psychologie', '社会观察': 'Gesellschaftsbeobachtungen', '技术笔记': 'Techniknotizen', '读书与思考': 'Lesen & Nachdenken', '转载': 'Reposts',
                '前端': 'Frontend', '后端': 'Backend', '综合': 'Allgemein', '独立博客': 'Persönliche Blogs', '技术服务': 'Tech-Dienste', '社区论坛': 'Community-Foren', '效率工具': 'Produktivitätstools'
            }
        },
        zh: {
            search: '搜索',
            search_placeholder: '搜索文章...',
            no_result: '未找到相关文章',
            toc: '文章目录',
            hot_tags: '热门标签',
            calendar: '日历',
            movies: '电影',
            books: '书籍',
            music: '音乐',
            exhibitions: '展览',
            all: '全部',
            settings: '设置',
            settings_theme: '外观主题',
            settings_theme_desc: '选择明暗主题模式',
            settings_light: '明亮',
            settings_dark: '暗黑',
            settings_language: '语言',
            settings_language_desc: '选择界面显示语言',
            settings_rss: 'RSS 订阅',
            settings_rss_desc: '通过 RSS 阅读器订阅博客更新',
            settings_rss_subscribe: '订阅 RSS',
            settings_font: '字体',
            settings_font_desc: '选择正文字体风格',
            settings_font_default: '无衬线体',
            settings_fontsize: '字体大小',
            settings_fontsize_desc: '调整正文字体大小',
            settings_fontsize_small: '小',
            settings_fontsize_default: '默认',
            settings_fontsize_medium: '中',
            settings_fontsize_large: '大',
            settings_fontsize_xlarge: '特大',
            settings_tone: '色调',
            settings_tone_desc: '选择整体色彩风格',
            settings_tone_rose: '玫红',
            settings_tone_blue: '蓝调',
            settings_tone_purple: '紫韵',
            settings_tone_orange: '暖橙',
            settings_tone_teal: '青碧',
            watched: '已看',
            want_to_watch: '想看',
            read: '已读',
            in_read: '在读',
            want_to_read: '想读',
            read_more: '阅读全文 »',
            prev_page: '上一页',
            next_page: '下一页',
            categories: '分类',
            articles_unit: '篇文章',
            friend_links: '友情链接',
            hobbies: '兴趣爱好',
            published_on: '发布于：',
            month_suffix: ' 月',
            months: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
            days: ['日','一','二','三','四','五','六'],
            menu: {},
            cat: {}
        }
    };

    var langBtns = document.querySelectorAll('.lang-btn');
    var currentLang = localStorage.getItem('lang') || defaultLang;

    function updateLangButtons(lang) {
        langBtns.forEach(function(btn) {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function applyLang(lang) {
        var t = translations[lang];
        // data-i18n text
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            if (!el.getAttribute('data-original')) {
                el.setAttribute('data-original', el.textContent.trim());
            }
            if (t[key]) {
                el.textContent = t[key];
            } else {
                el.textContent = el.getAttribute('data-original');
            }
        });
        // data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.placeholder = t[key];
        });
        // data-i18n-cat (category/tag translations)
        document.querySelectorAll('[data-i18n-cat]').forEach(function(el) {
            var zhName = el.getAttribute('data-i18n-cat');
            if (!el.getAttribute('data-original')) {
                el.setAttribute('data-original', el.textContent.trim());
            }
            if (lang !== 'zh' && t.cat && t.cat[zhName] !== undefined) {
                el.textContent = t.cat[zhName];
            } else {
                el.textContent = el.getAttribute('data-original');
            }
        });
        // Archive month suffix
        document.querySelectorAll('.month-suffix').forEach(function(el) {
            el.textContent = t.month_suffix !== undefined ? t.month_suffix : ' 月';
        });
        // Paginator prev/next text
        document.querySelectorAll('.paginator a').forEach(function(a) {
            if (!a.getAttribute('data-dir')) {
                if (a.textContent.indexOf('上一页') > -1) {
                    a.setAttribute('data-dir', 'prev');
                } else if (a.textContent.indexOf('下一页') > -1) {
                    a.setAttribute('data-dir', 'next');
                } else if (a.innerHTML.indexOf('&laquo;') > -1 || a.innerHTML.indexOf('«') > -1) {
                    a.setAttribute('data-dir', 'prev');
                } else if (a.innerHTML.indexOf('&raquo;') > -1 || a.innerHTML.indexOf('»') > -1) {
                    a.setAttribute('data-dir', 'next');
                }
            }
            var dir = a.getAttribute('data-dir');
            if (dir === 'prev') a.innerHTML = '&laquo; ' + t.prev_page;
            else if (dir === 'next') a.innerHTML = t.next_page + ' &raquo;';
        });
        // Page title (post-title from front matter)
        var pageTitle = document.querySelector('.post-title');
        if (pageTitle) {
            if (!pageTitle.getAttribute('data-original')) {
                pageTitle.setAttribute('data-original', pageTitle.textContent.trim());
            }
            var orig = pageTitle.getAttribute('data-original');
            if (lang !== 'zh') {
                if (t.menu && t.menu[orig] !== undefined) {
                    pageTitle.textContent = t.menu[orig];
                } else if (orig === 'about') {
                    var aboutMap = {en: 'About', de: 'Über mich'};
                    pageTitle.textContent = aboutMap[lang] || orig;
                }
            } else {
                pageTitle.textContent = orig;
            }
        }
        // Navigation menu
        document.querySelectorAll('.site-nav a').forEach(function(a) {
            var spans = a.querySelectorAll('span');
            var textNode = spans.length > 0 ? spans[0].nextSibling : a.childNodes[1];
            if (!a.getAttribute('data-original')) {
                a.setAttribute('data-original', textNode ? textNode.textContent.trim() : '');
            }
            var orig = a.getAttribute('data-original');
            if (lang !== 'zh' && t.menu && t.menu[orig] !== undefined) {
                if (textNode) textNode.textContent = t.menu[orig];
            } else {
                if (textNode) textNode.textContent = orig;
            }
        });
        // Update lang buttons
        updateLangButtons(lang);
        // Rebuild calendar
        buildCalendarLang(lang, t);
    }

    window.buildCalendarLang = function(lang, t) {
        var grid = document.getElementById('calendar-grid');
        var monthHeader = document.getElementById('calendar-month');
        if (!grid || !monthHeader) return;
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();
        var today = now.getDate();
        monthHeader.innerText = t.months[month] + ' ' + year;
        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        grid.innerHTML = '';
        for (var i = 0; i < firstDay; i++) grid.innerHTML += '<span></span>';
        for (var d = 1; d <= daysInMonth; d++) {
            grid.innerHTML += '<span' + (d === today ? ' class="today"' : '') + '>' + d + '</span>';
        }
        // Day headers
        var dayRow = document.querySelector('.calendar-days');
        if (dayRow) {
            dayRow.innerHTML = t.days.map(function(d){ return '<span>' + d + '</span>'; }).join('');
        }
    };

    langBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('lang', currentLang);
            applyLang(currentLang);
        });
    });

    // Apply saved lang on load
    if (currentLang !== 'zh') applyLang(currentLang);
    updateLangButtons(currentLang);
})();
