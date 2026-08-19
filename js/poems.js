(function () {
  var poems = window.poemData;
  if (!poems || !poems.length) return;

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

  current = Math.floor(Math.random() * poems.length);
  render(current);
})();
