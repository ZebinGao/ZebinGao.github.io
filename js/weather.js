// 天气组件：上海浦东 · 曹路镇
// 数据来自 Open-Meteo（免密钥的开放天气 API），结果在 localStorage 缓存 30 分钟，
// 避免博客每翻一页都重新请求
(function() {
    var API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=31.28024&longitude=121.66778' +
        '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
        '&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=1';
    var CACHE_KEY = 'weather-caolu';
    var CACHE_TTL = 30 * 60 * 1000;

    // WMO 天气代码 → [中文描述, 图标]
    var WMO = {
        0: ['晴', '☀️'],
        1: ['晴间少云', '🌤️'],
        2: ['多云', '⛅'],
        3: ['阴', '☁️'],
        45: ['雾', '🌫️'], 48: ['雾凇', '🌫️'],
        51: ['毛毛雨', '🌦️'], 53: ['毛毛雨', '🌦️'], 55: ['浓毛毛雨', '🌧️'],
        56: ['冻毛毛雨', '🌧️'], 57: ['冻毛毛雨', '🌧️'],
        61: ['小雨', '🌦️'], 63: ['中雨', '🌧️'], 65: ['大雨', '🌧️'],
        66: ['冻雨', '🌧️'], 67: ['冻雨', '🌧️'],
        71: ['小雪', '🌨️'], 73: ['中雪', '❄️'], 75: ['大雪', '❄️'], 77: ['雪粒', '🌨️'],
        80: ['小阵雨', '🌦️'], 81: ['阵雨', '🌧️'], 82: ['强阵雨', '⛈️'],
        85: ['小阵雪', '🌨️'], 86: ['阵雪', '🌨️'],
        95: ['雷阵雨', '⛈️'], 96: ['雷阵雨伴冰雹', '⛈️'], 99: ['雷阵雨伴冰雹', '⛈️']
    };

    var box = document.getElementById('weather-box');
    if (!box) return;

    function readCache() {
        try {
            var c = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (c && c.data && c.time) return c;
        } catch (e) {}
        return null;
    }

    function render(d) {
        var cur = d.current;
        var day = d.daily;
        var w = WMO[cur.weather_code] || ['未知', '🌡️'];
        var hhmm = (cur.time || '').slice(11, 16);
        box.innerHTML =
            '<div class="weather-now">' +
                '<span class="weather-icon">' + w[1] + '</span>' +
                '<span class="weather-temp">' + Math.round(cur.temperature_2m) + '°</span>' +
                '<span class="weather-desc">' + w[0] + '</span>' +
            '</div>' +
            '<div class="weather-meta">' +
                '<span>体感 ' + Math.round(cur.apparent_temperature) + '°</span>' +
                '<span>湿度 ' + cur.relative_humidity_2m + '%</span>' +
                '<span>风 ' + Math.round(cur.wind_speed_10m) + ' km/h</span>' +
            '</div>' +
            '<div class="weather-hl">今日 ' + Math.round(day.temperature_2m_min[0]) + '° ~ ' +
                Math.round(day.temperature_2m_max[0]) + '°</div>' +
            '<div class="weather-foot">上海 · 浦东' + (hhmm ? ' · ' + hhmm + ' 更新' : '') + '</div>';
    }

    function fail() {
        box.innerHTML = '<div class="weather-loading weather-retry">获取失败，点击重试</div>';
    }

    function fetchWeather() {
        fetch(API_URL)
            .then(function(r) { return r.json(); })
            .then(function(d) {
                if (!d || !d.current) { fail(); return; }
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: d }));
                } catch (e) {}
                render(d);
            })
            .catch(fail);
    }

    // 失败状态下点一下即重试
    box.addEventListener('click', function() {
        if (box.querySelector('.weather-retry')) fetchWeather();
    });

    var cached = readCache();
    if (cached && Date.now() - cached.time < CACHE_TTL) {
        render(cached.data); // 半小时内直接用缓存，不请求
    } else {
        if (cached) render(cached.data); // 过期缓存先顶上，后台静默刷新
        fetchWeather();
    }
})();
