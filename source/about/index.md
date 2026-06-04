---
title: 关于
date: 2025-12-30 11:52:37
type: "page"
---

<div id="poem-app">

<div class="poem-container">

<div class="poem-header" id="poem-header"></div>
<div class="poem-meta" id="poem-meta"></div>

<div class="poem-body" id="poem-body"></div>

<div class="poem-notes" id="poem-notes"></div>

<div class="poem-background" id="poem-background"></div>

<div class="poem-nav">
  <button class="poem-nav-btn" id="poem-prev" title="上一首">‹</button>
  <span class="poem-nav-indicator" id="poem-indicator"></span>
  <button class="poem-nav-btn" id="poem-next" title="下一首">›</button>
  <button class="poem-nav-btn poem-shuffle-btn" id="poem-shuffle" title="随机一首">🎲</button>
</div>
</div>
</div>

<script>
(function () {
  var poems = [
    {
      title: "唐多令 · 芦叶满汀州",
      meta: "[宋] 刘过",
      verses: [
        ["芦叶满汀洲，寒沙带浅流。", "二十年重过南楼。", "柳下系船犹未稳，能几日，又中秋。"],
        ["黄鹤断矶头，故人今在否？", "旧江山浑是新愁。", "欲买桂花同载酒，终不似，少年游。"]
      ],
      notes: [
        ["带", "映带、环绕"],
        ["汀洲", "水中小块陆地"],
        ["南楼", "武昌蛇山上的楼，作者旧游之地"],
        ["黄鹤矶", "武昌蛇山西北的江边石矶，黄鹤楼所在"],
        ["浑是", "全是、尽是"]
      ],
      background: [
        "刘过（1154—1206），字改之，号龙洲道人，南宋词人。与辛弃疾交游甚密，词风豪放，属辛派重要代表。",
        "范进中了举高兴到发疯，那刘过呢？其实答案就藏在两个词的区别里：<strong>中举</strong>和<strong>落第</strong>，对刘过来讲，根本不是一回事。范进一辈子困在秀才那一级，连乡试都过不了。秀才是科举的起点，有资格见县官不跪，但什么实利都没有，照样受穷挨饿挨骂。所以当他熬到五十四岁终于<strong>过了乡试</strong>、拿下举人，这一刻彻底逆转人生：能当官了、能免赋税了、乡绅来送房子送田了。这是从"底层爬上来"的绝境逆袭，不疯才奇怪。",
        "刘过的情况刚好相反。他<strong>很早就拿到了举人的资格</strong>，所以能去临安参加礼部省试。但麻烦就麻烦在，他只能到这里为止。举人本身是有特权的——见官不跪、免部分赋税，可刘过想做的是<strong>进士</strong>。宋代官场极重出身，只有进士才是正途，举人做不了正经大官。而刘过的志向不是混个免税额，他想抗金北伐、整顿朝纲，甚至给皇帝上过奏疏。这类抱负，一个没有任何官职的举人根本施展不了。",
        "所以他四次进临安考进士，四次被刷。他看着同辈的金榜题名、穿绿袍入仕途，自己永远是"强名举子"，不尴不尬地悬在半空。范进的喜，是<strong>终于摸到了门</strong>；刘过的悲，是<strong>门就在眼前，看了二十多年，硬是打不开</strong>。",
        "此词作于武昌。词人二十年前曾登临南楼，如今故地重游，旧友凋零、山河破碎，少年意气早已消磨殆尽。「旧江山浑是新愁」——江山依旧，却满目新愁，表面怀旧，实则暗含对南宋偏安、国事日非的深沉忧愤。「四举无成，十年不调」——"四举"指的不是中举四次，是他以举人身份参加了四次进士考试，全部落榜。举人的身份他早就有了，可惜对他来说，这不过是一张永远来不及兑现的承兑票据。"
      ]
    }
  ];

  var current = 0;

  function render(index) {
    var poem = poems[index];
    document.getElementById("poem-header").textContent = poem.title;
    document.getElementById("poem-meta").textContent = poem.meta;

    var body = document.getElementById("poem-body");
    body.innerHTML = "";
    poem.verses.forEach(function (verse) {
      var div = document.createElement("div");
      div.className = "poem-verse";
      verse.forEach(function (line) {
        var p = document.createElement("p");
        p.textContent = line;
        div.appendChild(p);
      });
      body.appendChild(div);
    });

    var notes = document.getElementById("poem-notes");
    notes.innerHTML = "";
    poem.notes.forEach(function (note) {
      var p = document.createElement("p");
      p.innerHTML = "<strong>" + note[0] + "</strong>　" + note[1];
      notes.appendChild(p);
    });

    var bg = document.getElementById("poem-background");
    bg.innerHTML = "";
    poem.background.forEach(function (para) {
      var p = document.createElement("p");
      p.innerHTML = para;
      bg.appendChild(p);
    });

    document.getElementById("poem-indicator").textContent =
      (index + 1) + " / " + poems.length;
  }

  document.getElementById("poem-prev").addEventListener("click", function () {
    current = (current - 1 + poems.length) % poems.length;
    render(current);
  });

  document.getElementById("poem-next").addEventListener("click", function () {
    current = (current + 1) % poems.length;
    render(current);
  });

  document.getElementById("poem-shuffle").addEventListener("click", function () {
    if (poems.length <= 1) return;
    var next;
    do { next = Math.floor(Math.random() * poems.length); } while (next === current);
    current = next;
    render(current);
  });

  // 随机展示一首
  current = Math.floor(Math.random() * poems.length);
  render(current);
})();
</script>
