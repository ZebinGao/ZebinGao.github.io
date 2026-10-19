// 随机头像：picsum.photos 的图直接当 <img> 用，img 标签不受跨域限制；
// ?r= 时间戳防缓存，每次请求 302 落到不同图。点击换一张。
// 国产随机图 API 前几年成片停服（btstu/dmoe/paugram 全灭），Bing 官方 JSON 不发 CORS 头，
// 海外源国内直连偏慢——好在字母头像在图到位前一直顶着，慢也不难看。
(function() {
    var wrap = document.getElementById('avatar-wrap');
    var img = document.getElementById('avatar-img');
    if (!wrap || !img) return;

    function load() {
        img.classList.remove('ok'); // 先退回字母占位，图加载完再淡入
        img.src = 'https://picsum.photos/240/240.webp?r=' + Date.now();
    }
    img.onload = function() { img.classList.add('ok'); };
    img.onerror = function() { img.classList.remove('ok'); }; // 字母头像继续兜底，下次点击再试

    wrap.addEventListener('click', load);
    load();
})();
