/* Карточка бота — поведение при наведении, общее для каталога главной (catalog/v2.html)
   и «Мои персонажи → Избранное» (models/v2.html). По референсу secrets.ai: в покое все
   карточки статичные, ролик играет только у карточки под курсором (или в фокусе
   с клавиатуры), она же подсвечивается классом is-active. Ничего не стартует само.
   Файл прогревается заранее (только метаданные), когда карточка подошла к экрану.
   Разметка: .cc[tabindex] > img.cc-photo + video.cc-video[data-src] (видео необязательно).
   Страница, которая перерисовывает сетку, вызывает initBotCards(корень) после рендера. */
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
