// 随机头像：picsum.photos 的图直接当 <img> 用，img 标签不受跨域限制。
// seed 存 sessionStorage：同一趟浏览翻页不换图（同 URL 走浏览器缓存，翻页秒显不闪烁），
// 重开浏览器/新标签页才换新；点击立刻换一张（换 seed 并记下，后续页面跟着用新图）。
// 国产随机图 API 前几年成片停服（btstu/dmoe/paugram 全灭），Bing 官方 JSON 不发 CORS 头，
// 海外源国内直连偏慢——好在字母头像在图到位前一直顶着，慢也不难看。
(function() {
    var wrap = document.getElementById('avatar-wrap');
    var img = document.getElementById('avatar-img');
    if (!wrap || !img) return;

    var SEED_KEY = 'avatar-seed';
    var seed = '';
    try { seed = sessionStorage.getItem(SEED_KEY) || ''; } catch (e) {}

    function newSeed() {
        seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        try { sessionStorage.setItem(SEED_KEY, seed); } catch (e) {}
        return seed;
    }

    function load() {
        img.classList.remove('ok'); // 先退回字母占位，图加载完再淡入
        img.src = 'https://picsum.photos/seed/' + (seed || newSeed()) + '/240/240.webp';
    }
    img.onload = function() { img.classList.add('ok'); };
    img.onerror = function() { img.classList.remove('ok'); }; // 字母头像继续兜底，下次点击再试

    wrap.addEventListener('click', function() { newSeed(); load(); });
    load();
})();
