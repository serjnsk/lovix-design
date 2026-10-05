/* Lovix · общий хром прототипа — один источник для всех страниц проекта.

   Что делает:
   • рисует сайдбар, топбар и футер (эталон — главная, бывшая catalog/v2.html) с рабочими
     ссылками по URL-структуре lovix.ai: / · /purchase/ · /packages/ · /chat/ · /models/ …;
   • держит демо-сессию (аноним / Free / Premium / VIP + баланс токенов) в localStorage —
     одна на все страницы; переключается панелью прототипа сверху, вход — в модалке, выход —
     в меню аватара;
   • доступ к экранам — как на проде lovix.ai: анониму открыты каталог, чат с ботом
     (/chat/?bot=N ≈ /bot/{slug}/chat — писать нельзя, при попытке регвол), страницы бота
     и автора, тарифы; «Мои чаты», «Мои персонажи», аккаунт, уведомления, подписки
     перекидывают анонима на главную, пакеты — на тарифы;
   • панель прототипа над сайтом: тип пользователя и устройство (десктоп — во всю ширину окна,
     как настоящий сайт / мобилка 360) — адрес в браузере следует за переходами;
   • мобильное меню (бургер в топбаре, сайдбар выезжает шторкой) — ≤1080px;
   • подгружает центр уведомлений (assets/notifications.js) для вошедших;
   • переход на ещё не прорисованный экран — уведомление вместо 404 или «мёртвого» клика:
     разметка data-todo="Название экрана" на ссылке/кнопке, из скрипта — Lovix.todo('Название').

   Подключение на странице (пути — относительно страницы):
     <head> … <link rel="stylesheet" href="assets/shell.css"> …
     <aside class="sb"></aside>
     <div class="page">
       <header class="tb"></header>
       <script src="assets/shell.js"></script>   ← сразу после топбара: хром рисуется без мигания
       <main class="content">…</main>
       <footer class="site-foot"></footer>       ← необязательно
     </div>

   Параметр ?as=guest|free|premium|vip в адресе любой страницы задаёт демо-состояние
   (для ссылок из карты макетов /design/). API для страниц — window.Lovix (внизу). */
(function () {
  'use strict';

  var script = document.currentScript;
  var BASE = script ? script.src.replace(/assets\/shell\.js(\?.*)?$/, '') : location.origin + '/';
  var here = location.href.split(/[?#]/)[0];
  var REL = (here.indexOf(BASE) === 0 ? here.slice(BASE.length) : '').replace(/index\.html$/, '');
  var SECTION = REL.split('/')[0];                       // '' — главная, 'purchase', 'chat', 'en'…
  var html = document.documentElement;
  var LANG = (html.lang || 'ru').slice(0, 2);

  /* ── страницы проекта ── */
  // личные разделы: аноним, как на проде, получает редирект (302) — на главную, пакеты — на тарифы.
  // Чат с конкретным ботом (?bot= / ?with=) анониму открыт — это /bot/{slug}/chat прода.
  var GUEST_OFF = { chat: 'Мои чаты', models: 'Мои персонажи', profile: 'Мой аккаунт',
    notifications: 'Уведомления', subscriptions: 'Мои подписки', packages: 'Пакеты токенов' };
  // какой пункт сайдбара подсвечен в разделе
  var ACTIVE = { '': 'home', en: 'home', de: 'home', bot: 'home', creator: 'home',
    chat: 'chat', models: 'models', purchase: 'purchase', packages: 'purchase',
    profile: 'profile', subscriptions: 'profile' };
  // домашняя страница языка: русская — корень, en/de — свои папки (см. tools/build-locales.py)
  var HOME = { ru: '', en: 'en/', de: 'de/' };
  var LANGS = ['ru', 'en', 'de'];

  var T = {
    ru: { create: 'Создать', explore: 'Обзор', chats: 'Мои чаты', models: 'Мои персонажи', sub: 'Подписка',
      account: 'Мой аккаунт', support: 'Поддержка', lang: 'Русский', flag: '🇷🇺', menu: 'Меню',
      nav: ['Девушки', 'Аниме', 'Парни'], login: 'Войти', start: 'Начать бесплатно', start_short: 'Начать',
      bal: 'Баланс токенов — пополнить', bell: 'Уведомления',
      m_account: 'Мой аккаунт', m_subs: 'Мои подписки', m_plans: 'Тарифы', m_packs: 'Пакеты токенов',
      m_logout: 'Выйти', copy: '© 2026 Lovix. Все права защищены.', proto: 'Карта макетов',
      todo: '«{x}» — экран ещё не прорисован в макетах', todo_map: 'Все экраны',
      guest_off: 'Как на проде: без входа «{x}» перекидывает на {y}', to_home: 'главную', to_plans: 'тарифы', user_set: 'Прототип: пользователь — <b>{u}</b>',
      tier_set: 'Демо: тариф <b>{t}</b>', bye: 'Вы вышли из аккаунта', b_create: 'Конструктор компаньонов',
      b_support: 'Поддержка', b_anime: 'Раздел «Аниме»', b_boys: 'Раздел «Парни»' },
    en: { create: 'Create', explore: 'Explore', chats: 'My chats', models: 'My characters', sub: 'Subscription',
      account: 'My account', support: 'Support', lang: 'English', flag: '🇬🇧', menu: 'Menu',
      nav: ['Girls', 'Anime', 'Guys'], login: 'Sign in', start: 'Start for free', start_short: 'Start',
      bal: 'Token balance — top up', bell: 'Notifications',
      m_account: 'My account', m_subs: 'Following', m_plans: 'Plans', m_packs: 'Token packs',
      m_logout: 'Sign out', copy: '© 2026 Lovix. All rights reserved.', proto: 'Prototype map',
      todo: '“{x}” is not designed yet', todo_map: 'All screens',
      guest_off: 'As on prod: “{x}” redirects guests to {y}', to_home: 'the home page', to_plans: 'plans', user_set: 'Prototype: user — <b>{u}</b>',
      tier_set: 'Demo: <b>{t}</b> plan', bye: 'Signed out', b_create: 'Companion builder',
      b_support: 'Support', b_anime: 'Anime section', b_boys: 'Guys section' },
    de: { create: 'Erstellen', explore: 'Entdecken', chats: 'Meine Chats', models: 'Meine Charaktere', sub: 'Abo',
      account: 'Mein Konto', support: 'Support', lang: 'Deutsch', flag: '🇩🇪', menu: 'Menü',
      nav: ['Frauen', 'Anime', 'Männer'], login: 'Anmelden', start: 'Kostenlos starten', start_short: 'Starten',
      bal: 'Token-Guthaben — aufladen', bell: 'Benachrichtigungen',
      m_account: 'Mein Konto', m_subs: 'Abonniert', m_plans: 'Tarife', m_packs: 'Token-Pakete',
      m_logout: 'Abmelden', copy: '© 2026 Lovix. Alle Rechte vorbehalten.', proto: 'Prototyp-Karte',
      todo: '„{x}“ ist noch nicht gestaltet', todo_map: 'Alle Screens',
      guest_off: 'Wie auf Prod: „{x}“ leitet Gäste auf {y} um', to_home: 'die Startseite', to_plans: 'Tarife', user_set: 'Prototyp: Nutzer — <b>{u}</b>',
      tier_set: 'Demo: Tarif <b>{t}</b>', bye: 'Abgemeldet', b_create: 'Companion-Builder',
      b_support: 'Support', b_anime: 'Anime-Bereich', b_boys: 'Bereich „Männer“' }
  };
  var L = T[LANG] || T.ru;
  var TIER_NAME = { free: 'Free', premium: 'Premium', vip: 'VIP' };
  var USER_NAME = { guest: 'Аноним', free: 'Free', premium: 'Премиум (Premium)', vip: 'Платный · VIP' };
  var USER = { nick: 'lunaria', email: 'example@example.com', ava: 'Л' };   // демо-пользователь = автор @lunaria из черновиков

  /* ── демо-сессия ── */
  var KEY = 'lovix.session';
  var S = { auth: false, tier: 'free', balance: 90 };
  try { var saved = JSON.parse(localStorage.getItem(KEY)); if (saved && typeof saved === 'object') for (var k in saved) S[k] = saved[k]; } catch (e) {}
  if (!TIER_NAME[S.tier]) S.tier = 'free';
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  var pendingToast = null;
  (function fromQuery() {
    var m = location.search.match(/[?&]as=(guest|free|premium|vip)\b/);
    if (!m) return;
    if (m[1] === 'guest') { S.auth = false; S.tier = 'free'; } else { S.auth = true; S.tier = m[1]; }
    save();
    var q = location.search.replace(/([?&])as=[a-z]+&?/, '$1').replace(/[?&]$/, '');
    try { history.replaceState(null, '', location.pathname + q + location.hash); } catch (e) {}
  })();

  /* ── панель прототипа: сайт во фрейме «устройства» (см. buildViewer ниже) ── */
  var PKEY = 'lovix.proto', PV = { device: 'desktop', hidden: false };
  try { var pv = JSON.parse(localStorage.getItem(PKEY)); if (pv && typeof pv === 'object') for (var k2 in pv) PV[k2] = pv[k2]; } catch (e) {}
  function savePV() { try { localStorage.setItem(PKEY, JSON.stringify(PV)); } catch (e) {} }
  var IN_FRAME = false, VIEWER = null;
  try { IN_FRAME = window.top !== window.self; VIEWER = IN_FRAME ? (window.top.LovixViewer || null) : null; } catch (e) { IN_FRAME = true; }
  if (VIEWER && SECTION === 'design') { window.top.location.href = location.href; return; }   // карта макетов — без обёртки
  var PRODUCT = !!document.querySelector('aside.sb, header.tb');   // экран продукта, а не служебная страница
  // на узком экране (телефон) обёртка не нужна — сайт и так в своей ширине; там вместо панели — кнопка «Прототип»
  if (!IN_FRAME && PRODUCT && window.innerWidth >= 900 && !PV.hidden) { buildViewer(); return; }

  /* ── аноним на личной странице — как на проде: редирект (на главную, с пакетов — на тарифы) ── */
  if (!S.auth && GUEST_OFF[SECTION] && !(SECTION === 'chat' && /[?&](bot|with)=/.test(location.search))) {
    var off = SECTION === 'packages';
    toastNext(L.guest_off.replace('{x}', GUEST_OFF[SECTION]).replace('{y}', off ? L.to_plans : L.to_home));
    try { window.stop(); } catch (e) {}                  // остаток страницы не нужен
    location.replace(u(off ? 'purchase/' : (HOME[LANG] || '')));
    return;
  }
  var PAGE_TIER = S.auth ? S.tier : 'free';
  function paintRoot() {
    html.dataset.session = S.auth ? 'user' : 'guest';   // не data-auth: это триггер модалки в auth.js
    html.dataset.tariff = S.auth ? S.tier : 'free';      // промо-баннеры главной скрывают VIP-предложения для VIP
    html.dataset.section = SECTION || 'home';
  }
  paintRoot();

  /* ── иконки хрома (свой спрайт с префиксом lxi-, не зависит от спрайта страницы) ── */
  var P = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>' +
    '<linearGradient id="lx-g-acc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d946ef"/><stop offset="1" stop-color="#f43f5e"/></linearGradient>' +
    '<symbol id="lxi-logo" viewBox="0 0 24 24"><path d="M12 21C7 16.5 2 12.8 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 4.3-5 8-10 12.5z" fill="url(#lx-g-acc)"/><path d="m12.5 4.5-2 4.2 3.2 2.6-2.2 4.5" fill="none" stroke="rgba(20,10,20,.55)" stroke-width="1.4" stroke-linejoin="round"/></symbol>' +
    '<symbol id="lxi-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" ' + P + '/></symbol>' +
    '<symbol id="lxi-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" ' + P + '/></symbol>' +
    '<symbol id="lxi-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" ' + P + '/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" ' + P + '/></symbol>' +
    '<symbol id="lxi-chat" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" ' + P + '/></symbol>' +
    '<symbol id="lxi-users" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" ' + P + '/><circle cx="9" cy="7" r="4" ' + P + '/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" ' + P + '/></symbol>' +
    '<symbol id="lxi-gem" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 13L2 9z" ' + P + '/><path d="M2 9h20M12 22 8 9l3-6M12 22l4-13-3-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" opacity=".55"/></symbol>' +
    '<symbol id="lxi-user" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" ' + P + '/><circle cx="12" cy="7" r="4" ' + P + '/></symbol>' +
    '<symbol id="lxi-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" ' + P + '/><path d="m22 6-10 7L2 6" ' + P + '/></symbol>' +
    '<symbol id="lxi-bell" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" ' + P + '/></symbol>' +
    '<symbol id="lxi-heart-o" viewBox="0 0 24 24"><path d="M12 21C7 16.5 2 12.8 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 4.3-5 8-10 12.5z" ' + P + '/></symbol>' +
    '<symbol id="lxi-crown" viewBox="0 0 24 24"><path d="M2 8l4 10h12l4-10-6 4-4-7-4 7z" ' + P + '/></symbol>' +
    '<symbol id="lxi-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" ' + P + '/></symbol>' +
    '<symbol id="lxi-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" ' + P + '/></symbol>' +
    '<symbol id="lxi-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="lxi-checks" viewBox="0 0 24 24"><path d="M18 6 7 17l-5-5M22 10l-7.5 7.5L13 16" ' + P + '/></symbol>' +
    '<symbol id="lxi-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" ' + P + '/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" ' + P + '/></symbol>' +
    '<symbol id="lxi-back" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="lxi-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/></symbol>' +
    '<symbol id="lxi-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" ' + P + '/></symbol>' +
    '<symbol id="lxi-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" ' + P + '/><path d="M12 8v4M12 16h.01" ' + P + '/></symbol>' +
    '<symbol id="lxi-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" ' + P + '/><path d="M12 6v6l4 2" ' + P + '/></symbol>' +
    '<symbol id="lxi-card" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ' + P + '/><path d="M1 10h22" ' + P + '/></symbol>' +
    '<symbol id="lxi-mega" viewBox="0 0 24 24"><path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" ' + P + '/></symbol>' +
    '<symbol id="lxi-map" viewBox="0 0 24 24"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16" ' + P + '/></symbol>' +
    '</defs></svg>';
  function ic(id, cls) { return '<svg class="' + (cls || 'ic') + '" aria-hidden="true"><use href="#lxi-' + id + '"/></svg>'; }
  function u(path) { return BASE + path; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  /* ── сайдбар ── */
  function sbHtml() {
    var on = ACTIVE[SECTION];
    var next = LANGS[(LANGS.indexOf(LANG) + 1) % LANGS.length];
    function item(key, icon, label, attrs, extra) {
      return '<a class="sb-item' + (on === key ? ' on' : '') + '"' + attrs + '>' + icon + label + (extra || '') + '</a>';
    }
    return '<button class="sb-burger" type="button" aria-label="' + L.menu + '" data-lx-drawer>' + ic('menu') + '</button>' +
      '<nav class="sb-top">' +
        item('create', ic('plus'), L.create, ' href="#" data-todo="' + L.b_create + '"') +
        item('home', ic('compass'), L.explore, ' href="' + u(HOME[LANG] || '') + '"') +
        item('chat', ic('chat'), L.chats, ' id="sb-chat" href="' + u('chat/') + '"', '<i class="sbcnt" id="chatcnt" hidden>0</i>') +
        item('models', ic('users'), L.models, ' id="sb-models" href="' + u('models/') + '"', '<i class="sb-cnt" hidden>0</i>') +
        item('purchase', ic('gem'), L.sub, ' href="' + u('purchase/') + '"') +
      '</nav>' +
      '<nav class="sb-bottom">' +
        item('profile', ic('user'), L.account, S.auth ? ' href="' + u('profile/') + '"' : ' href="#" data-auth="signup"') +   // анониму — модалка, как на проде
        item('support', ic('mail'), L.support, ' href="#" data-todo="' + L.b_support + '"') +
        item('lang', '<span class="sb-flag">' + L.flag + '</span>', L.lang, ' href="' + u(HOME[next]) + '" title="→ ' + T[next].lang + '"') +
      '</nav>';
  }

  /* ── топбар ── */
  function tbHtml() {
    var right;
    if (!S.auth) {
      right = '<button class="tb-login" type="button" data-auth="login">' + L.login + '</button>' +
        '<button class="tb-start" type="button" data-auth="signup"><span class="full">' + L.start + '</span><span class="short">' + L.start_short + '</span></button>';
    } else {
      var t = S.tier;
      right =
        (t !== 'free' ? '<a class="lx-bal" id="lx-balw" href="' + u('packages/') + '" title="' + L.bal + '">' + ic('gem') + '<b id="lx-bal">' + S.balance + '</b></a>' : '') +
        '<div class="bell-wrap"><button class="bell" id="bell" type="button" aria-label="' + L.bell + '" aria-haspopup="dialog" aria-expanded="false">' + ic('bell') + '<i id="bb" hidden></i></button>' +
          '<div class="npanel" id="npanel" role="dialog" aria-label="' + L.bell + '"></div></div>' +
        '<div class="lx-acc"><button class="avatar" id="lx-ava" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="' + L.account + '">' + USER.ava + '</button>' +
          '<div class="lx-menu" id="lx-menu" role="menu">' + menuHtml() + '</div></div>';
    }
    return '<button class="lx-burger" type="button" aria-label="' + L.menu + '" data-lx-drawer>' + ic('menu') + '</button>' +
      '<a class="logo" href="' + u(HOME[LANG] || '') + '">' + ic('logo') + '<b>LOVI<span>X</span></b></a>' +
      '<nav class="tb-nav"><a href="' + u(HOME[LANG] || '') + '">' + L.nav[0] + '</a><a href="#" data-todo="' + L.b_anime + '">' + L.nav[1] + '</a><a href="#" data-todo="' + L.b_boys + '">' + L.nav[2] + '</a></nav>' +
      '<div class="tb-right' + (S.auth ? ' is-auth' : '') + '">' + right + '</div>';
  }
  function menuHtml() {
    return '<div class="lx-menu-h"><span class="lx-ava-sm">' + USER.ava + '</span><div><b>@' + USER.nick + '</b><small>' + USER.email + '</small></div>' +
        '<span class="lx-chip t-' + S.tier + '">' + TIER_NAME[S.tier] + '</span></div>' +
      '<a role="menuitem" href="' + u('profile/') + '">' + ic('user') + L.m_account + '</a>' +
      '<a role="menuitem" href="' + u('subscriptions/') + '">' + ic('heart-o') + L.m_subs + '</a>' +
      '<a role="menuitem" href="' + u('purchase/') + '">' + ic('crown') + L.m_plans + '</a>' +
      '<a role="menuitem" href="' + u('packages/') + '">' + ic('gem') + L.m_packs + '</a>' +
      '<button role="menuitem" type="button" data-lx-logout>' + ic('logout') + L.m_logout + '</button>';
  }

  /* ── футер ── */
  function footHtml() {
    return '<a class="logo" href="' + u(HOME[LANG] || '') + '">' + ic('logo') + '<b>LOVI<span>X</span></b></a>' +
      '<span>' + L.copy + '</span>' +
      '<a class="lx-proto" href="' + u('design/') + '" target="_top">' + ic('map') + L.proto + '</a>';
  }

  /* ── отрисовка ── */
  var sb, tb;
  function renderTop() {
    if (tb) tb.innerHTML = tbHtml();
    favBadge();
    if (S.auth) loadNotifs(); else if (window.LovixNotifs) window.LovixNotifs.detach();
  }
  function render() {
    if (!document.getElementById('lx-sprite')) {
      var d = document.createElement('div'); d.id = 'lx-sprite'; d.innerHTML = SPRITE;
      document.body.insertBefore(d, document.body.firstChild);
    }
    sb = document.querySelector('aside.sb'); tb = document.querySelector('header.tb');
    if (sb) sb.innerHTML = sbHtml();
    if (tb) { renderTop(); }
    if (sb && !document.querySelector('.lx-scrim')) {
      var s = document.createElement('div'); s.className = 'lx-scrim'; s.setAttribute('data-lx-drawer-close', '');
      document.body.appendChild(s);
    }
  }
  function renderFoot() {
    var f = document.querySelector('footer.site-foot');
    if (f && !f.dataset.lx) { f.dataset.lx = '1'; f.innerHTML = footHtml(); }
  }

  // счётчик избранного на «Мои персонажи» — ключ общий с главной и /models/
  function favBadge() {
    var b = document.querySelector('#sb-models .sb-cnt'); if (!b) return;
    var n = 0; try { n = (JSON.parse(localStorage.getItem('lovix.fav') || '[]') || []).length; } catch (e) {}
    b.textContent = n; b.hidden = !n;
  }

  /* ── центр уведомлений (только для вошедших) ── */
  var notifsLoading = false;
  function loadNotifs() {
    if (window.LovixNotifs) { window.LovixNotifs.attach(); return; }
    if (notifsLoading) return;
    notifsLoading = true;
    ['assets/notifs-data.js', 'assets/notifications.js'].forEach(function (p) {
      var s = document.createElement('script'); s.src = u(p); s.async = false; document.head.appendChild(s);
    });
  }

  /* ── тост ── */
  var toastEl, toastT;
  function toast(msg, ms) {
    if (!document.body) { pendingToast = msg; return; }
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'lx-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 3200);
  }
  function toastNext(msg) { try { sessionStorage.setItem('lovix.toast', msg); } catch (e) {} }
  // экран, которого нет в макетах: уведомление со ссылкой на карту всех экранов
  function todo(name) {
    drawer(false);
    toast(L.todo.replace('{x}', esc(name)) + ' · <a href="' + u('design/') + '" target="_top">' + L.todo_map + '</a>', 3800);
  }

  /* ── навигация ── */
  // регистрация с возвратом: после входа — переход на next (регвол чата, покупка тарифа…)
  function askAuth(next, mode, opts) {
    var abs = new URL(next, location.href).href;
    try { sessionStorage.setItem('lovix.next', abs); } catch (e) {}
    function openIt() {
      if (window.LovixAuth) window.LovixAuth.open(mode || 'signup', null, opts);
      else if (abs.split('#')[0] !== location.href.split('#')[0]) location.href = abs;   // страница без модалки входа
    }
    // auth.js подключается в конце страницы — если спросили раньше, ждём его
    if (!window.LovixAuth && document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openIt); else openIt();
  }
  // открыть чат с персонажем вне каталога (проактив, черновые страницы автора/бота):
  // данные — через sessionStorage, адрес — /chat/?with=Имя
  function chatWith(c) {
    try { sessionStorage.setItem('lovix.chatwith', JSON.stringify(c)); } catch (e) {}
    go('chat/?with=' + encodeURIComponent(c.name));
  }
  function go(path) { location.href = /^[a-z]+:/.test(path) ? path : u(path); }

  /* ── смена сессии ── */
  function changed(prevTier) {
    save(); paintRoot();
    if (sb) sb.innerHTML = sbHtml();
    renderTop();
    var ev = new CustomEvent('lovix:session', { cancelable: true, detail: { auth: S.auth, tier: S.tier, balance: S.balance, prevTier: prevTier } });
    var handled = !document.dispatchEvent(ev);
    // страница не перехватила событие, а тариф поменялся — перезагрузить, чтобы гейты и баннеры пересчитались
    if (!handled && (S.auth ? S.tier : 'free') !== PAGE_TIER) { location.reload(); return true; }
    return false;
  }
  function login(msg) {
    var prev = S.tier;
    S.auth = true; S.tier = 'free';                       // регистрация — бесплатный тариф
    var next = null; try { next = sessionStorage.getItem('lovix.next'); sessionStorage.removeItem('lovix.next'); } catch (e) {}
    if (next) { save(); if (msg) toastNext(msg); location.href = next; return; }
    if (changed(prev)) { if (msg) toastNext(msg); } else if (msg) toast(msg);
  }
  function logout() {
    var prev = S.tier;
    S.auth = false; S.tier = 'free';
    if (GUEST_OFF[SECTION] && !(SECTION === 'chat' && /[?&](bot|with)=/.test(location.search))) { save(); toastNext(L.bye); location.href = u(HOME[LANG] || ''); return; }
    if (changed(prev)) toastNext(L.bye); else toast(L.bye);
  }
  function setTier(t) {
    if (!TIER_NAME[t] || (S.auth && S.tier === t)) return;
    var prev = S.tier, msg = L.tier_set.replace('{t}', TIER_NAME[t]);
    S.auth = true; S.tier = t;
    if (changed(prev)) toastNext(msg); else toast(msg);
  }
  function setBalance(n, flash) {
    S.balance = Math.max(0, Math.round(n)); save();
    var b = document.getElementById('lx-bal'); if (b) b.textContent = S.balance;
    if (flash) { var w = document.getElementById('lx-balw'); if (w) { w.classList.remove('flash'); void w.offsetWidth; w.classList.add('flash'); } }
  }

  /* ── меню аккаунта и шторка ── */
  function closeMenu() {
    var m = document.getElementById('lx-menu'), a = document.getElementById('lx-ava');
    if (m) m.classList.remove('open'); if (a) a.setAttribute('aria-expanded', 'false');
  }
  function drawer(open) {
    if (open !== html.classList.contains('lx-drawer')) html.classList.add('lx-drawer-anim');
    html.classList.toggle('lx-drawer', open);
    document.querySelectorAll('[data-lx-drawer]').forEach(function (b) { b.setAttribute('aria-expanded', open); });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var todoEl = t.closest('[data-todo]');
    if (todoEl) { e.preventDefault(); todo(todoEl.dataset.todo); return; }
    if (t.closest('.lx-burger, .sb-burger')) { drawer(!html.classList.contains('lx-drawer')); return; }
    if (t.closest('[data-lx-drawer-close]')) { drawer(false); return; }
    var ava = t.closest('#lx-ava');
    if (ava) {
      var m = document.getElementById('lx-menu'), open = !m.classList.contains('open');
      m.classList.toggle('open', open); ava.setAttribute('aria-expanded', open);
      if (window.LovixNotifs) window.LovixNotifs.close();
      return;
    }
    if (t.closest('[data-lx-logout]')) { closeMenu(); logout(); return; }
    var pu = t.closest('[data-lx-user]'); if (pu) { setUser(pu.dataset.lxUser); location.reload(); return; }
    if (t.closest('.lx-pill')) { pill(); return; }
    if (!t.closest('.lx-menu')) closeMenu();
    if (!t.closest('.lx-pillbox')) { var pb = document.querySelector('.lx-pillbox'); if (pb) pb.classList.remove('open'); }
    var a = t.closest('a[href]');
    // действие требует аккаунта (например, «Стать автором») — анониму регистрация с возвратом
    if (a && a.hasAttribute('data-need-auth') && !S.auth) { e.preventDefault(); askAuth(a.href); return; }
    // внешние ссылки из фрейма панели прототипа — в новой вкладке, а не внутри «устройства»
    if (a && IN_FRAME && a.href.indexOf(BASE) !== 0 && /^https?:/.test(a.href) && !a.target) a.target = '_blank';
    if (a && t.closest('.sb')) drawer(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); drawer(false); } });
  // модалку входа закрыли без входа — забыть, куда шёл гость
  document.addEventListener('lovix:auth-close', function () { try { sessionStorage.removeItem('lovix.next'); } catch (e) {} });
  // избранное меняется на странице — счётчик в сайдбаре следует
  window.addEventListener('storage', function (e) { if (e.key === 'lovix.fav') favBadge(); });

  /* ── тип пользователя (панель прототипа / кнопка «Прототип») ── */
  function setUser(v) {
    if (v === 'paid') v = S.auth && S.tier === 'vip' ? 'vip' : 'premium';
    if (v === 'guest') { S.auth = false; S.tier = 'free'; } else { S.auth = true; S.tier = v; }
    save(); toastNext(L.user_set.replace('{u}', USER_NAME[v]));
  }
  function userSegHtml(cur, attr) {
    var paid = cur === 'premium' || cur === 'vip';
    return '<div class="lxv-seg">' +
        '<button type="button" ' + attr + '="guest" class="' + (cur === 'guest' ? 'on' : '') + '">Аноним</button>' +
        '<button type="button" ' + attr + '="free" class="' + (cur === 'free' ? 'on' : '') + '">Free</button>' +
        '<button type="button" ' + attr + '="paid" class="' + (paid ? 'on' : '') + '">Платный</button>' +
      '</div>' +
      '<div class="lxv-seg sm' + (paid ? '' : ' off') + '" title="Тариф платного пользователя">' +
        '<button type="button" ' + attr + '="premium" class="' + (cur === 'premium' ? 'on' : '') + '">Premium</button>' +
        '<button type="button" ' + attr + '="vip" class="' + (cur === 'vip' ? 'on' : '') + '">VIP</button>' +
      '</div>';
  }

  /* ── панель прототипа над сайтом: тип пользователя + устройство. Страница (верхний документ)
     останавливает свою загрузку и показывает себя же во фрейме под строкой управления: десктоп —
     во всю ширину окна, 1 в 1 как настоящий сайт; мобилка — 360px в рамке телефона. Переходы внутри фрейма переписывают адрес
     в браузере (LovixViewer.sync), перезагрузка и «поделиться ссылкой» открывают тот же экран. ── */
  function buildViewer() {
    try { window.stop(); } catch (e) {}                  // свой контент верхнему документу не нужен
    html.classList.add('lx-viewer');
    var box = document.createElement('div'); box.id = 'lx-viewer';
    box.innerHTML =
      '<div class="lxv-bar" role="toolbar" aria-label="Панель прототипа">' +
        '<a class="lxv-brand" href="' + u('design/') + '" title="Карта макетов">LOVI<span>X</span><em>прототип</em></a>' +
        '<div class="lxv-grp"><small>Пользователь</small><div class="lxv-user"></div></div>' +
        '<div class="lxv-grp"><small>Устройство</small><div class="lxv-seg">' +
          '<button type="button" data-d="desktop">Десктоп</button><button type="button" data-d="mobile">Мобилка 360</button>' +
        '</div><span class="lxv-scale"></span></div>' +
        '<span class="lxv-path" title="Текущий экран"></span>' +
        '<a class="lxv-link" href="' + u('design/') + '">Карта макетов</a>' +
        '<button type="button" class="lxv-x" title="Скрыть панель — сайт во всё окно" aria-label="Скрыть панель">×</button>' +
      '</div>' +
      '<div class="lxv-stage"><div class="lxv-dev"><iframe title="Прототип lovix.ai" src="' + esc(location.href) + '"></iframe></div></div>';
    document.body.appendChild(box);
    var frame = box.querySelector('iframe'), dev = box.querySelector('.lxv-dev'), stage = box.querySelector('.lxv-stage');
    function paintBar() {
      box.querySelector('.lxv-user').innerHTML = userSegHtml(S.auth ? S.tier : 'guest', 'data-u');
      box.querySelectorAll('[data-d]').forEach(function (b) { b.classList.toggle('on', b.dataset.d === PV.device); });
    }
    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight, sc = box.querySelector('.lxv-scale');
      if (PV.device === 'mobile') {
        var h = Math.min(H - 40, 820);
        dev.className = 'lxv-dev is-mobile'; dev.style.width = '360px'; dev.style.height = h + 'px';
        frame.style.width = '360px'; frame.style.height = h + 'px'; frame.style.transform = '';
        sc.textContent = '360 × ' + h;
      } else {
        // десктоп — 1 в 1 как настоящий сайт: во всю ширину окна, без масштаба и рамок
        dev.className = 'lxv-dev is-desktop'; dev.style.width = '100%'; dev.style.height = H + 'px';
        frame.style.width = '100%'; frame.style.height = H + 'px'; frame.style.transform = '';
        sc.textContent = W + ' × ' + H;
      }
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-u]');
      if (b) {
        setUser(b.dataset.u); paintBar();
        try { frame.contentWindow.location.reload(); } catch (err) { frame.src = frame.src; }
        return;
      }
      var d = e.target.closest('[data-d]');
      if (d) { PV.device = d.dataset.d; savePV(); paintBar(); layout(); return; }
      if (e.target.closest('.lxv-x')) { PV.hidden = true; savePV(); location.reload(); }
    });
    window.addEventListener('resize', layout);
    // сессию поменяли изнутри фрейма (вход, выход, оплата) — панель показывает актуальное
    window.addEventListener('storage', function (e) {
      if (e.key !== KEY) return;
      try { var n = JSON.parse(e.newValue); if (n) { S.auth = n.auth; S.tier = n.tier; } } catch (err) {}
      paintBar();
    });
    window.LovixViewer = {
      sync: function (href, title) {
        if (href.indexOf(BASE) === 0) { try { history.replaceState(null, '', href); } catch (e) {} }
        document.title = title;
        box.querySelector('.lxv-path').textContent = '/' + href.slice(BASE.length).replace(/#.*$/, '');
      },
      session: function (n) { S.auth = n.auth; S.tier = n.tier; paintBar(); }
    };
    paintBar(); layout();
  }

  // внутри фрейма панели: сообщать адрес и заголовок наверх (и при смене якоря / replaceState)
  function syncTop() { if (VIEWER) try { VIEWER.sync(location.href, document.title); VIEWER.session(S); } catch (e) {} }
  if (VIEWER) {
    ['replaceState', 'pushState'].forEach(function (m) {
      var orig = history[m];
      history[m] = function () { var r = orig.apply(history, arguments); syncTop(); return r; };
    });
    window.addEventListener('hashchange', syncTop);
    window.addEventListener('load', syncTop);
  }

  // без панели (узкий экран или панель скрыта): кнопка «Прототип» в углу
  function pill() {
    if (window.innerWidth >= 900) { PV.hidden = false; savePV(); location.reload(); return; }
    var box = document.querySelector('.lx-pillbox'); box.classList.toggle('open');
  }
  function renderPill() {
    if (IN_FRAME || !PRODUCT || document.querySelector('.lx-pill')) return;
    var w = document.createElement('div'); w.className = 'lx-pillwrap';
    w.innerHTML = '<div class="lx-pillbox" role="dialog" aria-label="Панель прототипа"><small>Пользователь</small>' +
      userSegHtml(S.auth ? S.tier : 'guest', 'data-lx-user') + '<a href="' + u('design/') + '">Карта макетов →</a></div>' +
      '<button type="button" class="lx-pill" title="Панель прототипа">Прототип</button>';
    document.body.appendChild(w);
  }

  render();
  function ready() {
    renderFoot();
    renderPill();
    syncTop();
    var msg = null; try { msg = sessionStorage.getItem('lovix.toast'); sessionStorage.removeItem('lovix.toast'); } catch (e) {}
    if (msg || pendingToast) setTimeout(function () { toast(msg || pendingToast, 4200); }, 350);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  window.Lovix = {
    base: BASE, section: SECTION, lang: LANG,
    session: function () { return { auth: S.auth, tier: S.tier, balance: S.balance }; },
    url: u, go: go, chatWith: chatWith, toast: toast, toastNext: toastNext, todo: todo, askAuth: askAuth, inFrame: IN_FRAME,
    login: login, logout: logout, setTier: setTier, setBalance: setBalance, favBadge: favBadge,
    tierName: function (t) { return TIER_NAME[t || S.tier]; }
  };
})();
