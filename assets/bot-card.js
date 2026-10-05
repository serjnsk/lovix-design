/* Карточка бота — общий компонент (стили — assets/bot-card.css): разметка botCardHtml()
   и поведение при наведении для всех страниц — каталог главной, «Мои персонажи» (свои модели
   и «Избранное»), страница автора, страница компаньона. По референсу secrets.ai: в покое все
   карточки статичные, ролик играет только у карточки под курсором (или в фокусе
   с клавиатуры), она же подсвечивается классом is-active. Ничего не стартует само.
   Файл прогревается заранее (только метаданные), когда карточка подошла к экрану.
   Разметка: .cc > img.cc-photo + video.cc-video[data-src] (видео необязательно).
   Страница, которая перерисовывает сетку, вызывает initBotCards(корень) после рендера. */

/* botCardHtml(o) — карточка как на главной: фото на всю карточку, имя и возраст, метрики.
   Описания на карточке нет (решение главной). Поля:
     name, age, img                      — обязательные
     video                               — превью-ролик (играет при наведении)
     bg                                  — градиент-подложка: img — вырез, фигура сверху по центру
     href, linkAttrs                     — вся карточка ссылка (обычно в чат с ботом)
     author { nick, name, color, verified, href } — бейдж автора сверху слева
     action { kind: 'fav'|'unfav'|'del', attrs, label } — кнопка сверху справа
     metrics [чаты, лайки]               — пилюли с иконками; или pills [{ text, cls }]
     eager                               — грузить фото сразу (первый экран) */
window.botCardHtml = function (o) {
  var I = {
    chat: '<svg class="cc-ic" viewBox="0 0 12.375 11.5" aria-hidden="true"><path d="M4.21875 4.4375C4.21875 4.55831 4.12081 4.65625 4 4.65625C3.87919 4.65625 3.78125 4.55831 3.78125 4.4375C3.78125 4.31669 3.87919 4.21875 4 4.21875C4.12081 4.21875 4.21875 4.31669 4.21875 4.4375ZM4.21875 4.4375H4M6.40625 4.4375C6.40625 4.55831 6.30831 4.65625 6.1875 4.65625C6.06669 4.65625 5.96875 4.55831 5.96875 4.4375C5.96875 4.31669 6.06669 4.21875 6.1875 4.21875C6.30831 4.21875 6.40625 4.31669 6.40625 4.4375ZM6.40625 4.4375H6.1875M8.59375 4.4375C8.59375 4.55831 8.49581 4.65625 8.375 4.65625C8.25419 4.65625 8.15625 4.55831 8.15625 4.4375C8.15625 4.31669 8.25419 4.21875 8.375 4.21875C8.49581 4.21875 8.59375 4.31669 8.59375 4.4375ZM8.59375 4.4375H8.375M0.5 6.19295C0.5 7.12691 1.15532 7.93986 2.07935 8.07573C2.71291 8.16888 3.35338 8.24082 4 8.29079V11L6.44037 8.55963C6.56096 8.43904 6.72378 8.37048 6.89427 8.36626C8.04668 8.33772 9.18181 8.23955 10.2956 8.0758C11.2197 7.93994 11.875 7.12699 11.875 6.19302V2.68199C11.875 1.74802 11.2197 0.935065 10.2956 0.799212C8.95485 0.602091 7.58318 0.5 6.18767 0.5C4.79203 0.5 3.42023 0.602109 2.07936 0.799265C1.15533 0.935128 0.5 1.74808 0.5 2.68204V6.19295Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    like: '<svg class="cc-ic" viewBox="0 0 11.5 10.625" aria-hidden="true"><path d="M11 3.125C11 1.67525 9.77578 0.5 8.26562 0.5C7.13651 0.5 6.16725 1.157 5.75 2.09449C5.33275 1.157 4.36349 0.5 3.23438 0.5C1.72422 0.5 0.5 1.67525 0.5 3.125C0.5 7.33699 5.75 10.125 5.75 10.125C5.75 10.125 11 7.33699 11 3.125Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heartO: '<svg class="ic o" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C7 16.5 2 12.8 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 4.3-5 8-10 12.5z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    heartF: '<svg class="ic f" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C7 16.5 2 12.8 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 4.3-5 8-10 12.5z" fill="currentColor"/></svg>',
    trash: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ver: '<svg class="cc-ver" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 3.8A4.5 4.5 0 0 1 12 2.25c1.36 0 2.57.6 3.4 1.55a4.5 4.5 0 0 1 3.5 1.3 4.5 4.5 0 0 1 1.3 3.5A4.5 4.5 0 0 1 21.75 12c0 1.36-.6 2.57-1.55 3.4a4.5 4.5 0 0 1-1.3 3.5 4.5 4.5 0 0 1-3.5 1.3A4.5 4.5 0 0 1 12 21.75c-1.36 0-2.57-.6-3.4-1.55a4.5 4.5 0 0 1-3.5-1.3 4.5 4.5 0 0 1-1.3-3.5A4.5 4.5 0 0 1 2.25 12c0-1.36.6-2.57 1.55-3.4a4.5 4.5 0 0 1 1.3-3.5 4.5 4.5 0 0 1 3.5-1.3Z" fill="currentColor"/><path d="m8.6 12.25 2.25 2.25 4.55-5.4" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  var e = function (t) { return String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var h = '<article class="cc">';
  if (o.bg) h += '<div class="cc-bg" style="background:' + o.bg + '"></div>';
  h += '<img class="cc-photo' + (o.bg ? ' is-cut' : '') + '" src="' + o.img + '" alt="' + e(o.name) + '" loading="' + (o.eager ? 'eager' : 'lazy') + '">';
  if (o.video) h += '<video class="cc-video" data-src="' + o.video + '" muted loop playsinline preload="none" aria-hidden="true"></video>';
  h += '<div class="cc-shade"></div>';
  if (o.href) h += '<a class="cc-link" href="' + o.href + '"' + (o.linkAttrs || '') + ' aria-label="' + e(o.label || (o.name + (o.age ? ', ' + o.age : ''))) + '"></a>';
  var a = o.author;
  if (a) h += '<a class="cc-auth" href="' + a.href + '" title="' + e(a.name) + ' · @' + a.nick + '" aria-label="Автор: ' + e(a.name) + ', @' + a.nick + '">' +
    '<span class="cc-av"' + (a.color ? ' style="background:' + a.color + '"' : '') + '>' + e(a.name[0].toUpperCase()) + '</span>' +
    '<span class="cc-nick">@' + a.nick + (a.verified ? I.ver : '') + '</span></a>';
  var x = o.action;
  if (x) {
    if (x.kind === 'del') h += '<button class="cc-fav cc-del" type="button"' + (x.attrs || '') + ' aria-label="' + (x.label || 'Удалить') + '" title="' + (x.label || 'Удалить') + '">' + I.trash + '</button>';
    else h += '<button class="cc-fav' + (x.kind === 'unfav' ? ' on' : '') + '" type="button"' + (x.attrs || '') + ' aria-pressed="' + (x.kind === 'unfav') + '" aria-label="' + (x.label || (x.kind === 'unfav' ? 'Убрать из избранного' : 'В избранное')) + '">' + I.heartO + I.heartF + '</button>';
  }
  h += '<div class="cc-meta"><div class="cc-name"><b>' + e(o.name) + (o.age ? ',' : '') + '</b>' + (o.age ? '<span>' + o.age + '</span>' : '') + '</div>';
  var foot = '';
  if (o.metrics) foot = '<span class="cc-m">' + I.chat + o.metrics[0] + '</span><span class="cc-m like" title="Лайки">' + I.like + o.metrics[1] + '</span>';
  if (o.pills) foot = o.pills.map(function (p) { return '<span class="cc-m' + (p.cls ? ' ' + p.cls : '') + '">' + e(p.text) + '</span>'; }).join('');
  if (foot) h += '<div class="cc-foot">' + foot + '</div>';
  return h + '</div></article>';
};

(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverable = window.matchMedia('(hover: hover)').matches;
  var active = null;

  function video(card) { return card.querySelector('.cc-video'); }
  function warm(v) { if (v && !v.src) { v.src = v.dataset.src; v.preload = 'metadata'; v.load(); } }
  function attempt(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () { retry(v); });   // AbortError при быстром уходе курсора — норма
  }
  /* Chrome может отклонить play() или сам поставить немой ролик на паузу (энергосбережение
     для «фонового» видео) — пока карточка активна, пробуем ещё, но не больше 5 раз */
  function retry(v) {
    if (v.dataset.on !== '1') return;
    var n = +v.dataset.tries || 0; if (n >= 5) return;
    v.dataset.tries = n + 1;
    setTimeout(function () { if (v.dataset.on === '1' && v.paused) attempt(v); }, 200 + 150 * n);
  }
  function play(card) {
    var v = video(card); if (!v || calm) return;
    warm(v);
    v.dataset.on = '1'; v.dataset.tries = '0';
    attempt(v);
  }
  function stop(card) {
    var v = video(card); if (!v) return;
    v.dataset.on = '0'; v.classList.remove('is-visible'); v.pause();
  }
  function enter(card) {
    if (active === card) return;
    if (active) leave(active);                    // активная всегда одна
    active = card; card.classList.add('is-active'); play(card);
  }
  function leave(card) {
    card.classList.remove('is-active'); stop(card);
    if (active === card) active = null;
  }

  /* прогрев: метаданные ролика подтягиваются, когда карточка в 200px от экрана */
  var io = (hoverable && !calm && 'IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { warm(video(e.target)); io.unobserve(e.target); } });
  }, { rootMargin: '200px 0px' }) : null;

  function bind(card) {
    if (card.dataset.bound === '1') return;
    card.dataset.bound = '1';
    var v = video(card);
    if (v) {
      // видео проявляется по событию playing — когда кадры реально пошли, а не по промису play()
      v.addEventListener('playing', function () { if (v.dataset.on === '1') v.classList.add('is-visible'); });
      v.addEventListener('pause', function () { retry(v); });   // своя остановка ставит on=0 раньше — повтора не будет
      if (io) io.observe(card);
    }
    if (hoverable) {
      card.addEventListener('mouseenter', function () { enter(card); });
      card.addEventListener('mouseleave', function () { leave(card); });
    }
    // focusin/focusout, а не focus/blur: фокус на сердечке или бейдже внутри карточки не гасит её
    card.addEventListener('focusin', function () { enter(card); });
    card.addEventListener('focusout', function (e) { if (!card.contains(e.relatedTarget)) leave(card); });
  }

  window.initBotCards = function (root) {
    Array.prototype.slice.call((root || document).querySelectorAll('.cc')).forEach(bind);
  };
  document.addEventListener('visibilitychange', function () { if (document.hidden && active) leave(active); });
  window.initBotCards();
})();
