// 博客宠物"团子"：左下角悬浮团子 + 对话面板。
// 纯本地规则应答（关键词匹配 + 随机话术 + 打字机效果），不依赖任何外部服务，
// 断网也能聊。想接真 AI 需要中转服务（智谱 API 浏览器直连会被 CORS 拦死，
// 实测结论见 2026-11-06 的调研），届时把 reply() 换成接口调用即可。
(function () {
    // ---------- 面板文案（与 i18n.js 的 localStorage['lang'] 约定一致） ----------
    var STR = {
        zh: {
            open: '点我聊天，拖我搬家', title: '团子', sub: '博客小宠物',
            ph: '跟团子说点什么…', send: '发送',
            hint: '嗨！我是团子，点我聊天呀～',
            hi: '你来啦！我是团子🍚，主人去写博客了，我在这儿陪你玩～',
            cleared: '（团子把聊天记录吃掉了，嗝～）',
            foot: '本地小脑袋 · 无需联网'
        },
        en: {
            open: 'Tap to chat, drag to move', title: 'Tuanzi', sub: 'blog pet',
            ph: 'Say something to Tuanzi…', send: 'Send',
            hint: 'Hi! I\'m Tuanzi, tap me to chat!',
            hi: 'You\'re here! I\'m Tuanzi 🍚, the master is busy blogging — I\'ll keep you company!',
            cleared: '(Tuanzi ate the chat history, burp~)',
            foot: 'offline brain · no network needed'
        }
    };
    var lang = 'zh';
    try { lang = localStorage.getItem('lang') || 'zh'; } catch (e) {}
    var L = STR[lang] || STR.zh;

    // ---------- 本地小脑袋：规则从上到下匹配，先中先用 ----------
    // 每条规则的 out 是话术数组，元素为 [文本] 或 [文本, 链接文字, 链接地址]
    var BRAIN = [
        { re: /早上好|早安|早呀|good morning/i, out: [
            ['早安！新的一天，先深呼吸，再看一眼朝华章，美滋滋～', '朝华章', '/poem-daily/'],
            ['早呀！团子刚把自己从被窝里揉圆，你今天有什么计划？']
        ]},
        { re: /晚安|睡觉|困了|good night/i, out: [
            ['晚安～愿你有诗里的那种好梦："卧看满天云不动，不知云与我俱东。"', '朝华章', '/poem-daily/'],
            ['晚安！团子也要缩成一团睡了，明天见呀 (˘ω˘)']
        ]},
        { re: /再见|拜拜|bye|走了/i, out: [
            ['拜拜～路上小心，团子就在左下角哪儿也不去。'],
            ['再见啦！下次来记得摸摸团子再走。']
        ]},
        { re: /你是谁|你叫什么|名字|介绍.*自己|自我介绍/i, out: [
            ['我叫团子，是主人养在这个博客里的小宠物，住在页面左下角。主业吃饭，副业陪你聊天～'],
            ['团子是也！一团糯米做的圆球，主人的博客管家。虽然没连什么大模型，但肚子里还是有点墨水的。']
        ]},
        { re: /主人|站长|作者|nathan/i, out: [
            ['主人是 Nathan Gao，写代码也写生活。想认识他？', '关于', '/about/'],
            ['主人这会儿多半在写博客或改他的小工具，团子只负责可爱。']
        ]},
        { re: /桂花|买桂花|少年游|唐多令|博客.*名字|名字.*由来|为什么叫/i, out: [
            ['博客名字出自刘过《唐多令》："欲买桂花同载酒，终不似，少年游。"主人的签名是"人生天地间，忽如远行客"。']
        ]},
        { re: /每日一诗|朝华章|今天.*诗|读.*诗|诗词|古诗/i, out: [
            ['每天一首诗在「朝华章」，今天更新了吗？去看看～', '朝华章', '/poem-daily/'],
            ['主人的诗库不小，朝华章里天天换新，团子也会偷偷背两句。', '朝华章', '/poem-daily/']
        ]},
        { re: /此刻|碎碎念|动态|moments/i, out: [
            ['主人的日常碎碎念都记在「此刻」里，点去看看？', '此刻', '/moments/']
        ]},
        { re: /文章|写了什么|博客|网站|都写.*什么|看什么|目录/i, out: [
            ['主人写编程、技术、生活随笔，全部文章在这儿～', '文章', '/directory/'],
            ['博客以编程和随笔为主，还有书影音游记，慢慢逛～', '文章', '/directory/']
        ]},
        { re: /书|电影|音乐|游戏|展览|爱好|兴趣/i, out: [
            ['主人的书影音和展览都在「兴趣爱好」里，团子最爱那条一行的短评～', '兴趣爱好', '/hobbies/']
        ]},
        { re: /播客|podcast/i, out: [['主人常听的播客都收在播客页，可以在线听～', '播客', '/podcast/']] },
        { re: /新闻|热点|资讯/i, out: [['热点新闻在「热点」页，中英德的都有～', '热点', '/news/']] },
        { re: /地图|去过|旅行|足迹|哪些地方/i, out: [
            ['主人的足迹都在「足迹」地图上，一颗星一个地方～', '足迹', '/map/']
        ]},
        { re: /友链|朋友.*博客|链接/i, out: [['主人的博客朋友圈在「链接」页～', '链接', '/links/']] },
        { re: /工具/i, out: [['主人做的小工具都收在工具页～', '工具', '/tools/']] },
        { re: /几点|时间|现在.*几/i, out: [
            ['现在是 {time}。团子的生物钟只有"饭点"和"睡点"，这个是替你看的。']
        ]},
        { re: /几号|日期|星期|今天.*号/i, out: [
            ['今天是 {date}。日子一天天过，诗一天天换，别浪费呀～']
        ]},
        { re: /天气/i, out: [
            ['团子住在网页里看不见窗外……不过右栏的天气小挂件知道，去问问它？']
        ]},
        { re: /笑话|段子|讲个|逗我/i, out: [
            ['团子走路不用脚。为什么？因为它只会"滚"。'],
            ['有人问团子为什么这么圆，团子说：心宽体盘嘛。'],
            ['主人 debug 到凌晨，团子在旁边看得直冒汗——毕竟团子也怕被"改"圆。'],
            ['糯米团子最怕什么？怕别人说它"不粘人"。团子偏偏很粘人！']
        ]},
        { re: /开心|高兴|哈哈|嘿嘿|太好了|快乐/i, out: [
            ['开心就好！团子也跟着蹦了一下（虽然没蹦起来）。'],
            ['嘿嘿，把开心分团子一半？团子拿去下饭。']
        ]},
        { re: /难过|伤心|emo|烦|累|丧|焦虑|压力|不开心/i, out: [
            ['抱抱。累的时候就慢一点，去朝华章读首诗，或者看看主人写的随笔，说不定就顺过气来了。', '文章', '/directory/'],
            ['唉，辛苦啦。团子虽然只会说再撑一下，但也很认真地替你捏了捏肩。']
        ]},
        { re: /喜欢|可爱|爱你|好萌|好乖|摸摸/i, out: [
            ['呀……被夸得脸更圆了。团子也喜欢你！（理直气壮）'],
            ['团子接受投喂和夸奖，多多益善～']
        ]},
        { re: /吃|饿|饭|好吃的|食物|投喂/i, out: [
            ['团子不挑食，但最想吃的是你刚才说的那个。'],
            ['饿了就先去吃饭！天大的事都没饭大，这是团子的处世哲学。']
        ]},
        { re: /key|api|密钥|密码|后台|部署|服务器/i, out: [
            ['那是主人的秘密！团子只被允许吃饭和卖萌，别的什么都不知道 (๑•́ ₃ •̀๑)']
        ]},
        { re: /glm|gpt|ai|人工智能|大模型|机器人|你是.*模型/i, out: [
            ['团子没连什么大模型，全靠肚子里这点墨水～问深了会露馅的，但不影响我们聊天！'],
            ['真 AI 团子还在主人的心愿清单上，现在是"本地团子"，胜在永不掉线。']
        ]},
        { re: /你会什么|能做什么|功能|干嘛的/i, out: [
            ['团子会：陪聊、介绍博客、讲冷笑话、报时间，还有随机卖萌。想看博客的话团子也能带路～']
        ]},
        { re: /谢谢|感谢|thank/i, out: [['不客气～团子鞠躬（滚了半圈）。']] },
        { re: /在吗|hi|hello|你好|您好|嗨|哈喽/i, out: [
            ['在的在的！团子一直都在左下角，随时喊我～'],
            ['你好呀！今天想聊点什么？'],
            ['嗨！来得正好，团子刚睡醒，精神得很。']
        ]}
    ];
    var FALLBACK = [
        ['这个团子就不太懂啦……不过主人写过不少东西，说不定有答案？', '文章', '/directory/'],
        ['唔，团子的小脑袋转不动了。换个话题嘛，比如问问团子是谁？'],
        ['（团子歪头想了三秒，放弃了）我们去看看今天有什么新东西吧～', '此刻', '/moments/'],
        ['主人说遇到不懂的就微笑。团子笑给你看了，问题还在你那儿，哈哈。'],
        ['团子只能陪你聊到这儿啦，毕竟肚子里除了墨水就是糯米。要不来首诗？', '朝华章', '/poem-daily/']
    ];

    // 英文访客给一组精简规则（主题有中英切换，照顾一下）
    var BRAIN_EN = [
        { re: /who are you|your name|tuanzi/i, out: [
            ["I'm Tuanzi 🍚, a little rice-ball pet living in the bottom-left corner of this blog!"]
        ]},
        { re: /master|owner|nathan|about/i, out: [
            ["The master is Nathan Gao — he codes and writes about life.", 'About', '/about/']
        ]},
        { re: /poem|poetry/i, out: [
            ["One poem a day on the Zhaohuazhang page~", 'Poems', '/poem-daily/']
        ]},
        { re: /blog|article|post/i, out: [
            ["This blog is about coding and life essays. Enjoy!", 'Posts', '/directory/']
        ]},
        { re: /joke|funny/i, out: [
            ["Why doesn't Tuanzi walk? Because it can only *roll*."]
        ]},
        { re: /time|clock/i, out: [
            ["It's {time} now. My body clock only knows mealtime and bedtime."]
        ]},
        { re: /hi|hello|hey/i, out: [
            ["Hi there! I'm always here in the corner~"],
            ["Hello! Wanna chat?"]
        ]}
    ];
    var FALLBACK_EN = [
        ["Hmm, that's beyond my little rice brain… try asking about the blog?"],
        ["(Tuanzi tilts, thinks, gives up) Maybe read a poem instead?", 'Poems', '/poem-daily/']
    ];
    var brain = lang === 'en' ? BRAIN_EN : BRAIN;
    var fallback = lang === 'en' ? FALLBACK_EN : FALLBACK;

    var lastReply = '';
    function pickRule(rules, text) {
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].re.test(text)) {
                var outs = rules[i].out;
                var v = outs[Math.floor(Math.random() * outs.length)];
                if (outs.length > 1 && v[0] === lastReply) v = outs[(outs.indexOf(v) + 1) % outs.length];
                return v;
            }
        }
        return null;
    }
    function think(text) {
        var v = pickRule(brain, text) || pickRule(BRAIN, text) /* 英文模式下中文规则兜底 */ || fallback[Math.floor(Math.random() * fallback.length)];
        lastReply = v[0];
        var now = new Date();
        v = v.slice(); // 别改到规则库本身
        v[0] = v[0]
            .replace('{time}', now.getHours() + ':' + ('0' + now.getMinutes()).slice(-2))
            .replace('{date}', (lang === 'en' ? now.toDateString() : (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日'));
        return v;
    }

    // ---------- DOM ----------
    var root = document.createElement('div');
    root.className = 'pet-root';
    root.innerHTML =
        '<div class="pet-hint" id="pet-hint">' + L.hint + '</div>' +
        '<div class="pet-chat" id="pet-chat">' +
        '  <div class="pet-head">' +
        '    <div class="pet-title"><b>' + L.title + '</b><em>' + L.sub + '</em></div>' +
        '    <div class="pet-head-btns">' +
        '      <button class="pet-icon-btn" id="pet-clear" title="clear">🧹</button>' +
        '      <button class="pet-icon-btn" id="pet-close" title="close">✕</button>' +
        '    </div>' +
        '  </div>' +
        '  <div class="pet-msgs" id="pet-msgs"></div>' +
        '  <div class="pet-input-row">' +
        '    <input id="pet-input" maxlength="300" placeholder="' + L.ph + '" autocomplete="off">' +
        '    <button id="pet-send">' + L.send + '</button>' +
        '  </div>' +
        '  <div class="pet-foot">' + L.foot + '</div>' +
        '</div>' +
        '<button class="pet-dango" id="pet-dango" aria-label="' + L.open + '">' +
        '  <span class="pet-face">' +
        '    <span class="pet-eye pet-eye-l"></span><span class="pet-eye pet-eye-r"></span>' +
        '    <span class="pet-blush pet-blush-l"></span><span class="pet-blush pet-blush-r"></span>' +
        '    <span class="pet-mouth"></span>' +
        '  </span>' +
        '</button>';
    document.body.appendChild(root);

    var dango = root.querySelector('#pet-dango'),
        panel = root.querySelector('#pet-chat'),
        msgsEl = root.querySelector('#pet-msgs'),
        input = root.querySelector('#pet-input'),
        sendBtn = root.querySelector('#pet-send'),
        hintEl = root.querySelector('#pet-hint');

    // ---------- 历史（localStorage，上限 30 条） ----------
    var HKEY = 'pet-chat-history';
    function loadHist() { try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch (e) { return []; } }
    function saveHist(h) { try { localStorage.setItem(HKEY, JSON.stringify(h.slice(-30))); } catch (e) {} }
    var hist = loadHist();

    // ---------- 渲染 ----------
    function scrollBottom() { msgsEl.scrollTop = msgsEl.scrollHeight; }
    function addUser(text) {
        var d = document.createElement('div');
        d.className = 'pet-msg u';
        d.textContent = text;
        msgsEl.appendChild(d);
        scrollBottom();
    }
    function bubbleShell() {
        var d = document.createElement('div');
        d.className = 'pet-msg a pet-typing';
        d.innerHTML = '<span class="pet-dots"><i></i><i></i><i></i></span>';
        msgsEl.appendChild(d);
        scrollBottom();
        return d;
    }
    function appendLink(bubble, link) {
        if (!link) return;
        var a = document.createElement('a');
        a.className = 'pet-link';
        a.href = link[1];
        a.textContent = link[0];
        bubble.appendChild(document.createElement('br'));
        bubble.appendChild(a);
    }
    // 机器感最弱的一种"回复"：先思考半秒，再逐字打出，最后补链接。
    // 面板中途被关掉时，进行中的回复立即定格成全文（active 里的 finalize）。
    var active = [];
    function botSay(text, link) {
        hist.push({ r: 'a', c: text, l: link || null });
        saveHist(hist);
        var bubble = bubbleShell();
        var done = false, to = null, iv = null;
        var state = {
            finalize: function () {
                if (done) return;
                done = true;
                if (to) clearTimeout(to);
                if (iv) clearInterval(iv);
                root.classList.remove('thinking');
                bubble.classList.remove('pet-typing');
                bubble.textContent = text;
                appendLink(bubble, link);
                scrollBottom();
                var k = active.indexOf(state);
                if (k > -1) active.splice(k, 1);
            }
        };
        active.push(state);
        root.classList.add('thinking');
        to = setTimeout(function () {
            root.classList.remove('thinking');
            bubble.classList.remove('pet-typing');
            var i = 0, step = Math.max(1, Math.ceil(text.length / 90)); // 长句加速，总时长控制在 ~3s 内
            iv = setInterval(function () {
                i = Math.min(text.length, i + step);
                bubble.textContent = text.slice(0, i);
                scrollBottom();
                if (i >= text.length) state.finalize();
            }, 30);
        }, 480 + Math.random() * 650);
    }

    // ---------- 对话 ----------
    function send() {
        var text = input.value.trim();
        if (!text) return;
        input.value = '';
        addUser(text);
        hist.push({ r: 'u', c: text });
        saveHist(hist);
        var v = think(text);
        botSay(v[0], v.length > 2 ? [v[1], v[2]] : null);
    }

    // ---------- 开关面板 ----------
    function openPanel() {
        root.classList.add('open');
        hintEl.classList.remove('show');
        if (!hist.length) botSay(L.hi, null); // 首次见面打招呼（入历史）
        setTimeout(function () { input.focus(); }, 60);
    }
    function closePanel() {
        root.classList.remove('open');
        active.slice().forEach(function (s) { s.finalize(); });
    }

    // ---------- 拖拽搬家（Pointer Events，鼠标/触屏通吃；位移 <5px 仍算点击） ----------
    var posKey = 'pet-pos';
    function applyPos(x, y, save) {
        var w = window.innerWidth, h = window.innerHeight;
        var r = root.getBoundingClientRect();
        x = Math.max(8, Math.min(x, w - r.width - 8));   // 只许待在视口内
        y = Math.max(8, Math.min(y, h - r.height - 8));
        root.style.left = x + 'px';
        root.style.top = y + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';
        root.classList.toggle('pet-flip', x + r.width / 2 > w / 2); // 右半屏：面板朝左开
        root.classList.toggle('pet-top', y < 320);                  // 拖得高：面板朝下开
        if (save) { try { localStorage.setItem(posKey, JSON.stringify({ x: x, y: y })); } catch (e) {} }
    }
    try {
        var sp = JSON.parse(localStorage.getItem(posKey));
        if (sp && typeof sp.x === 'number' && typeof sp.y === 'number') applyPos(sp.x, sp.y, false);
    } catch (e) {}
    window.addEventListener('resize', function () {
        if (!localStorage.getItem(posKey)) return; // 没搬过家就保持默认锚点
        var r = root.getBoundingClientRect();
        applyPos(r.left, r.top, false);
    });

    var dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
    dango.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true; moved = false;
        sx = e.clientX; sy = e.clientY;
        var r = root.getBoundingClientRect();
        ox = r.left; oy = r.top;
        try { dango.setPointerCapture(e.pointerId); } catch (err) {}
    });
    dango.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && dx * dx + dy * dy < 25) return; // 5px 内不算拖
        moved = true;
        root.classList.add('pet-dragging');
        applyPos(ox + dx, oy + dy, false);
    });
    function endDrag() {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('pet-dragging');
        if (moved) {
            var r = root.getBoundingClientRect();
            applyPos(r.left, r.top, true); // 松手才落库
        }
    }
    dango.addEventListener('pointerup', endDrag);
    dango.addEventListener('pointercancel', endDrag);

    dango.addEventListener('click', function () {
        if (moved) { moved = false; return; } // 刚拖完的这次 click 不开面板
        root.classList.contains('open') ? closePanel() : openPanel();
    });
    root.querySelector('#pet-close').addEventListener('click', closePanel);
    root.querySelector('#pet-clear').addEventListener('click', function () {
        active.slice().forEach(function (s) { s.finalize(); });
        hist = [];
        saveHist(hist);
        msgsEl.innerHTML = '';
        botSay(L.cleared, null);
    });
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') send();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && root.classList.contains('open')) closePanel();
    });

    // ---------- 历史回放（打字过程不重演，直接成品） ----------
    hist.forEach(function (m) {
        if (m.r === 'u') { addUser(m.c); return; }
        var d = document.createElement('div');
        d.className = 'pet-msg a';
        d.textContent = m.c;
        appendLink(d, m.l ? [m.l[0], m.l[1]] : null);
        msgsEl.appendChild(d);
    });
    if (hist.length) scrollBottom();

    // ---------- 进场提示 & 闲置小动作 ----------
    setTimeout(function () {
        if (!root.classList.contains('open')) hintEl.classList.add('show');
    }, 1600);
    setTimeout(function () { hintEl.classList.remove('show'); }, 7000);
    var idleZh = ['（团子悄悄打了个滚）', '（团子打了个哈欠）', '（团子在原地滚成了更圆的圆）', '（团子瞄了你一眼，又假装看诗）'];
    var idleEn = ['(Tuanzi quietly rolls over)', '(Tuanzi yawns)'];
    setTimeout(function () {
        if (root.classList.contains('open')) return;
        var pool = lang === 'en' ? idleEn : idleZh;
        hintEl.textContent = pool[Math.floor(Math.random() * pool.length)];
        hintEl.classList.add('show');
        setTimeout(function () { hintEl.classList.remove('show'); }, 5000);
    }, 34000);
})();
