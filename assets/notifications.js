/* Центр уведомлений Lovix — дропдаун у колокольчика топбара + виджет проактива компаньона.
   Общий компонент: подгружается assets/shell.js для вошедшего пользователя на любой странице
   (данные — assets/notifs-data.js). Состояние (прочитано, удалено, «Готово», настройки
   категорий, стопка проактивов) хранится в localStorage → одно на все страницы прототипа.
   Полные флоу и правила — notifications/FLOWS.md; демо-панель симуляции — /notifications/.

   CTA уведомлений ведут на настоящие экраны прототипа (в проде — те же маршруты):
   пополнить токены → /packages/, VIP и оплата → чекаут /purchase/, повтор операции → /chat/. */
(function () {
  'use strict';
  if (!window.Lovix || typeof NOTIFS === 'undefined') return;

  var KEY = 'lovix.notifs';
  var CTA_ROUTE = {
    'Пополнить токены': 'packages/',
    'Перейти на VIP': 'purchase/?plan=vip',
    'Повторить оплату': 'purchase/?plan=premium',
    'Попробовать снова': 'chat/',
    'Оплатить сейчас': 'purchase/?plan=premium'
  };
  var ic = function (id) { return '<svg class="ic" aria-hidden="true"><use href="#lxi-' + id.replace(/^i-/, '') + '"/></svg>'; };
  var img = function (src) { return src.replace(/^(\.\.\/)+/, Lovix.base); };   // пути из notifs-data.js — от папки страницы
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ── состояние ── */
  var st = null;
  try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!st || !Array.isArray(st.notifs)) st = fresh();
  function fresh() {
    return { notifs: clone(NOTIFS), crit: null, oldLoaded: false, cats: { sale: true, engage: true },
      proStack: [], proSeeded: false, proIdx: 0, simId: 200 };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var proExpanded = null;      // развёрнутый баббл — только для прилетевшего на этой странице
  var lastDeleted = null;

  var $ = function (id) { return document.getElementById(id); };
  var panel = function () { return $('npanel'); };

  /* ── колокольчик ── */
  function visible() { return st.notifs.filter(function (n) { return n.kind === 'Т' || st.cats[n.cat] !== false; }); }
  function unreadCount() { return visible().filter(function (n) { return n.unread; }).length + (st.crit ? 1 : 0); }
  function updateBadge(pulse) {
    var c = unreadCount(), b = $('bb'), cnt = $('ncnt');
    if (b) {
      b.textContent = c > 9 ? '9+' : c; b.hidden = !c;
      if (pulse && c) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    }
    if (cnt) cnt.textContent = c ? '· ' + c + ' новых' : '';
  }
  function ctaHtml(n) {
    if (n.done) return '<div class="ncta"><span class="donechip">' + ic('check') + 'Готово</span></div>';
    if (n.cta) return '<div class="ncta"><button class="btn btn-grad" data-cta="' + n.id + '">' + n.cta + '</button></div>';
    return '';
  }
  function itemHtml(n) {
    return '<div class="nitem' + (n.unread ? ' unread' : '') + (n.fresh ? ' fresh' : '') + '" data-id="' + n.id + '">' +
      '<div class="nicon ' + NCLASS[n.type] + '">' + ic(NICON[n.type]) + '</div>' +
      '<div class="nbody"><div class="ntitle">' + n.title + '</div>' +
      '<div class="ntext">' + n.text + '</div>' + ctaHtml(n) +
      '<div class="ntime">' + n.time + '</div></div>' +
      '<div class="ndot"></div>' +
      '<div class="hacts">' +
        '<button class="iconbtn" data-tr="' + n.id + '" title="' + (n.unread ? 'Прочитано' : 'Вернуть в непрочитанные') + '">' + ic(n.unread ? 'check' : 'dot') + '</button>' +
        '<button class="iconbtn" data-del="' + n.id + '" title="Удалить">' + ic('trash') + '</button>' +
      '</div></div>';
  }
  function critHtml() {
    var c = st.crit;
    return '<div class="ncrit"><div class="crow">' +
      '<div class="nicon nc-pay">' + ic('alert') + '</div>' +
      '<div class="nbody"><div class="ntitle">' + c.title + '</div>' +
      '<div class="ntext">' + c.text + '</div>' +
      '<div class="timer">' + ic('clock') + c.timer + '</div>' +
      '<div class="ncta"><button class="btn btn-grad" data-crit-cta>' + c.cta + '</button></div>' +
      '<div class="ntime">' + c.time + ' · не скрывается до решения</div></div>' +
      '</div></div>';
  }
  function shellHtml() {
    return '<div class="vlist" id="vlist">' +
        '<div class="nhead"><div><b>Уведомления</b><span class="cnt" id="ncnt"></span></div>' +
          '<div class="nacts"><button class="iconbtn" id="nreadall" type="button" title="Прочитать все">' + ic('checks') + '</button>' +
          '<button class="iconbtn" id="nsettings" type="button" title="Настройки уведомлений">' + ic('gear') + '</button></div></div>' +
        '<div class="nlist" id="nlist"></div>' +
      '</div>' +
      '<div id="vset" style="display:none"><div class="nset">' +
        '<button class="backrow" id="nback" type="button">' + ic('back') + 'Настройки уведомлений</button>' +
        '<div class="nrow-set"><div>Транзакционные<small>платежи, доступ, токены — всегда включены</small></div><button class="sw on lock" type="button" title="Неотключаемы (Д7)"></button></div>' +
        '<div class="nrow-set"><div>Продажи и предложения<small>лимиты, пакеты, апгрейды</small></div><button class="sw' + (st.cats.sale ? ' on' : '') + '" id="sw-sale" type="button"></button></div>' +
        '<div class="nrow-set"><div>Новости и вовлечение<small>обновления продукта</small></div><button class="sw' + (st.cats.engage ? ' on' : '') + '" id="sw-engage" type="button"></button></div>' +
        '<p class="hint">Выключенная категория перестаёт приходить в колокольчик. Изменение действует сразу и не влияет на email-рассылки — у них своя отписка.</p>' +
      '</div></div>';
  }
  function render() {
    var list = $('nlist'); if (!list) return;
    var all = visible(), fresh = all.filter(function (n) { return n.unread; }), older = all.filter(function (n) { return !n.unread; });
    var h = '';
    if (st.crit) h += critHtml();
    if (fresh.length) h += '<div class="ngroup">Новые</div>' + fresh.map(itemHtml).join('');
    if (older.length) h += '<div class="ngroup">Ранее</div>' + older.map(itemHtml).join('');
    if (!st.oldLoaded) h += '<button class="nmore" id="nmore" type="button">Показать ещё</button>';
    if (!h) h = '<div class="nempty">' + ic('bell') + 'Пока тихо — уведомлений нет</div>';
    list.innerHTML = h;
    st.notifs.forEach(function (n) { n.fresh = false; });
    updateBadge(false);
  }
  function showView(v) {
    if (!$('vlist')) return;
    $('vlist').style.display = v === 'list' ? 'flex' : 'none';
    $('vset').style.display = v === 'set' ? 'block' : 'none';
  }
  function open() {
    var p = panel(); if (!p) return;
    p.classList.add('open'); showView('list');
    var b = $('bell'); if (b) b.setAttribute('aria-expanded', 'true');
  }
  function close() {
    var p = panel(); if (p) p.classList.remove('open');
    var b = $('bell'); if (b) b.setAttribute('aria-expanded', 'false');
  }

  /* ── виджет проактива ── */
  function dock() {
    var d = $('lwdock');
    if (!d) { d = document.createElement('div'); d.className = 'lwdock'; d.id = 'lwdock'; d.setAttribute('aria-live', 'polite'); document.body.appendChild(d); }
    return d;
  }
  function updateChatBadge() {
    var b = $('chatcnt'); if (!b) return;
    b.textContent = st.proStack.length; b.hidden = !st.proStack.length;
  }
  function markCut() {
    var t = document.querySelector('#lwdock .lw-text');
    if (t) t.closest('.lw-bubble').classList.toggle('is-cut', t.scrollHeight > t.clientHeight + 1);
  }
  function renderProactive() {
    var exp = st.proStack.filter(function (p) { return p.name === proExpanded; })[0];
    var h = '';
    if (exp) {
      h += '<div class="lw"><div class="lw-bubble">' +
        '<button class="lw-x" type="button" aria-label="Скрыть">' + ic('x') + '</button>' +
        '<div class="lw-name">' + exp.name + '</div>' +
        '<div class="lw-text" data-answer="' + exp.name + '" title="' + exp.text.replace(/"/g, '&quot;') + '">' + exp.text + '</div>' +
        '<div class="lw-act"><button class="btn btn-grad" type="button" data-answer="' + exp.name + '">Ответить</button></div>' +
        '</div><div class="lw-ava" data-answer="' + exp.name + '"><div class="ph"><img src="' + img(exp.img) + '" alt="' + exp.name + '"></div></div></div>';
    }
    var rest = st.proStack.filter(function (p) { return p.name !== proExpanded; });
    if (rest.length) {
      // в стопке не больше трёх аватаров, старшие — плиткой «+N»
      var MAX = 3, over = Math.max(0, rest.length - MAX), hidden = rest.slice(0, over), stack = '';
      if (over) {
        var nx = hidden[hidden.length - 1];
        stack += '<button class="sava more" type="button" data-expand="' + nx.name + '" title="Ещё ' + over + ': ' + hidden.map(function (p) { return p.name; }).join(', ') + '">+' + over + '</button>';
      }
      stack += rest.slice(over).map(function (p) {
        return '<button class="sava" type="button" data-expand="' + p.name + '" title="' + p.name + '"><span class="ph"><img src="' + img(p.img) + '" alt="' + p.name + '"></span><i></i></button>';
      }).join('');
      h += '<div class="lw-stack">' + stack + '</div>';
    }
    dock().innerHTML = h;
    markCut();
    updateChatBadge();
  }
  function pushProactive(p) {
    var ex = st.proStack.filter(function (x) { return x.name === p.name; })[0];
    if (ex) ex.text = p.text; else st.proStack.push({ name: p.name, img: p.img, text: p.text });
    proExpanded = p.name;     // новый проактив разворачивается, прежние — в стопку
    save(); renderProactive();
  }

  /* ── симуляция (демо-панель на /notifications/) ── */
  var sim = {
    newEvent: function () {
      var src = SIM_POOL[Math.floor(Math.random() * SIM_POOL.length)];
      var n = clone(src); n.id = st.simId++; n.time = 'только что'; n.unread = true; n.fresh = true;
      st.notifs.unshift(n); save(); render(); updateBadge(true);
    },
    crit: function () {
      if (st.crit) { Lovix.toast('Окно восстановления уже активно'); return; }
      st.crit = clone(NOTIF_CRIT); save(); render(); updateBadge(true); open();
    },
    proactive: function () { pushProactive(PROACTIVE[st.proIdx % PROACTIVE.length]); st.proIdx++; save(); },
    clear: function () { st.notifs = []; st.oldLoaded = true; st.crit = null; save(); render(); },
    reset: function () { st = fresh(); proExpanded = null; save(); render(); renderProactive(); }
  };

  /* ── клики ── */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('#bell')) { var p = panel(); if (p && p.classList.contains('open')) close(); else open(); return; }
    if (t.closest('[data-sim-new]')) { sim.newEvent(); return; }
    if (t.closest('[data-sim-crit]')) { sim.crit(); return; }
    if (t.closest('[data-sim-pro]')) { sim.proactive(); return; }
    if (t.closest('[data-sim-clear]')) { sim.clear(); return; }
    if (t.closest('[data-sim-reset]')) { sim.reset(); Lovix.toast('Уведомления и проактивы сброшены к исходным'); return; }

    // виджет проактива: развернуть из стопки / ответить (→ чат с этим компаньоном) / свернуть
    var exp = t.closest('[data-expand]');
    if (exp) { proExpanded = exp.dataset.expand; renderProactive(); return; }
    var ans = t.closest('[data-answer]');
    if (ans) {
      var who = st.proStack.filter(function (p) { return p.name === ans.dataset.answer; })[0];
      st.proStack = st.proStack.filter(function (p) { return p.name !== ans.dataset.answer; });
      proExpanded = null; save(); renderProactive();
      // в чате реплика проактива — первое сообщение диалога
      Lovix.chatWith(who ? { name: who.name, img: img(who.img), text: who.text } : { name: ans.dataset.answer });
      return;
    }
    if (t.closest('.lw-x')) { proExpanded = null; renderProactive(); return; }

    if (!t.closest('.npanel')) { close(); return; }

    // критичное: решается только целевым действием (оплатой)
    if (t.closest('[data-crit-cta]')) {
      st.crit = null; save(); close();
      Lovix.go(CTA_ROUTE['Оплатить сейчас']);
      return;
    }
    // CTA-конверсия (Д2): кнопка становится «Готово», переход на целевой экран
    var cta = t.closest('[data-cta]');
    if (cta) {
      var n = st.notifs.filter(function (x) { return x.id == cta.dataset.cta; })[0];
      n.done = true; n.unread = false; save(); render();
      setTimeout(function () { Lovix.go(CTA_ROUTE[n.cta] || ''); }, 250);
      return;
    }
    var tr = t.closest('[data-tr]');
    if (tr) { var m = st.notifs.filter(function (x) { return x.id == tr.dataset.tr; })[0]; m.unread = !m.unread; save(); render(); return; }
    var del = t.closest('[data-del]');
    if (del) {
      var idx = st.notifs.findIndex(function (x) { return x.id == del.dataset.del; });
      lastDeleted = { item: st.notifs[idx], idx: idx };
      st.notifs.splice(idx, 1); save(); render();
      Lovix.toast('Уведомление удалено<button class="tundo" id="lx-undo" type="button">Вернуть</button>', 5000);
      return;
    }
    var item = t.closest('.nitem');
    if (item) { var r = st.notifs.filter(function (x) { return x.id == item.dataset.id; })[0]; if (r.unread) { r.unread = false; save(); render(); } return; }
    if (t.closest('#nreadall')) { st.notifs.forEach(function (x) { x.unread = false; }); save(); render(); return; }
    if (t.closest('#nsettings')) { showView('set'); return; }
    if (t.closest('#nback')) { showView('list'); return; }
    if (t.closest('#sw-sale')) { st.cats.sale = !st.cats.sale; t.closest('.sw').classList.toggle('on', st.cats.sale); save(); render(); return; }
    if (t.closest('#sw-engage')) { st.cats.engage = !st.cats.engage; t.closest('.sw').classList.toggle('on', st.cats.engage); save(); render(); return; }
    if (t.closest('#nmore')) { st.oldLoaded = true; st.notifs = st.notifs.concat(clone(NOTIFS_OLD)); save(); render(); return; }
  });
  // «Вернуть» живёт в общем тосте — вне панели
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#lx-undo')) return;
    if (lastDeleted) { st.notifs.splice(Math.min(lastDeleted.idx, st.notifs.length), 0, lastDeleted.item); lastDeleted = null; save(); render(); }
    var t = document.querySelector('.lx-toast'); if (t) t.classList.remove('show');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', markCut);
  if (document.fonts) document.fonts.ready.then(markCut);
  // другая вкладка прочитала / удалила — подтянуть
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    try { st = JSON.parse(e.newValue) || fresh(); } catch (err) { st = fresh(); }
    render(); renderProactive();
  });

  /* ── подключение к топбару (shell.js перерисовывает его при смене сессии) ── */
  function attach() {
    var p = panel(); if (!p) return;
    if (!p.dataset.ready) { p.dataset.ready = '1'; p.innerHTML = shellHtml(); }
    render(); renderProactive();
  }
  function detach() { close(); var d = $('lwdock'); if (d) d.innerHTML = ''; }

  attach();
  // демо: проактивы, накопившиеся за отсутствие (Алиса — позавчера, Майя — вчера), прилетают
  // один раз — на первой странице после входа, не в самом чате (повторить — сброс на /design/)
  if (!st.proSeeded && Lovix.section !== 'chat') {
    st.proSeeded = true; save();
    setTimeout(function () { pushProactive(PROACTIVE[0]); }, 2500);
    setTimeout(function () { pushProactive(PROACTIVE[1]); st.proIdx = Math.max(st.proIdx, 2); save(); }, 4200);
  }

  window.LovixNotifs = { attach: attach, detach: detach, open: open, close: close, sim: sim };
  document.dispatchEvent(new CustomEvent('lovix:notifs-ready'));
})();
