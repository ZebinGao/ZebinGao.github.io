/* 朝华章标签局部切换（2026-11-03）：四页标签是真链接，这里做渐进增强——
 * 拦截页内标签点击，fetch 目标页只把 .poem-daily-page 换掉，左右侧栏与
 * 页头不重载。中键/修饰键点击、抓取失败都退回整页跳转；前进后退简单
 * reload（内容正确，侧栏重载一次可接受）。事件委托挂在 document 上，
 * 换血后无需重绑；脚本经 layout.ejs 只在 poem-daily 页加载。 */
(function () {
  if (window.__poemTabSwap) return;
  window.__poemTabSwap = true;

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.poem-daily-page a.category-tab');
    if (!a || e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var url = a.getAttribute('href');
    if (!url) return;
    e.preventDefault();
    fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var next = doc.querySelector('.poem-daily-page');
      var cur = document.querySelector('.poem-daily-page');
      if (!next || !cur) throw new Error('页面结构不对');
      next.querySelectorAll('script').forEach(function (s) { s.remove(); }); // 防换血带进脚本
      cur.replaceWith(next);
      document.title = doc.title;
      history.pushState({ poemSwap: true }, '', url);
      window.scrollTo(0, 0);
    }).catch(function () { location.href = url; });
  });

  window.addEventListener('popstate', function () {
    // 只发生在朝华章内部前进后退时（本脚本仅此页加载），整页重载到目标 URL
    if (document.querySelector('.poem-daily-page')) location.reload();
  });
})();
