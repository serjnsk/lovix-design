/* Формы регистрации и входа — модалка по референсу secrets.ai. Стили — assets/auth.css.
   Подключение: <script src="…/assets/auth.js"></script> + в топбаре кнопки
   <button data-auth="login"> и <button data-auth="signup">. Открывается и по
   хэшу #signup / #login (ссылка на конкретную форму).

   Язык — из <html lang> (ru / en / de), регион — из <html data-region>:
     ru    → провайдеры Google + Telegram, капча Yandex SmartCaptcha
     world → провайдеры Google + Apple,    капча Cloudflare Turnstile
   (без атрибута: lang=ru → ru, иначе world).

   Слева — слайдер фич: те же интенты и вырезы, что у промо-баннеров главной,
   смена раз в 10 с, пауза при наведении, точки. Справа — форма: сперва
   провайдеры, email-путь вторым шагом; вход ↔ регистрация ↔ восстановление
   пароля переключаются внутри модалки. Все действия в прототипе — демо:
   спиннер, модалка закрывается, в топбаре вместо кнопок появляется аватар. */
(function () {
  'use strict';

  /* ── словари ── */
  var I18N = {
    ru: {
      su_t: 'Начни бесплатно', su_s: 'Сотни новых знакомств уже ждут тебя',
      si_t: 'С возвращением', si_s: 'Войди, чтобы продолжить общение с компаньонками',
      or: 'или через', email: 'Email',
      legal: 'Продолжая, ты подтверждаешь, что тебе есть 18 лет, и принимаешь <a href="#">Условия использования</a> и <a href="#">Политику конфиденциальности</a>.',
      have: 'Уже есть аккаунт?', signin: 'Войти', noacc: 'Нет аккаунта?', signup: 'Зарегистрироваться',
      nick: 'Никнейм', pass: 'Пароль', create: 'Создать бесплатный аккаунт', back: 'Назад',
      forgot: 'Забыл пароль?', signin_btn: 'Войти',
      fp_t: 'Восстановить пароль', fp_s: 'Пришлём ссылку для сброса на твой email', fp_btn: 'Отправить ссылку',
      fp_done_t: 'Письмо отправлено', fp_done: 'Если этот email есть в базе, ссылка уже в пути. Не видишь — проверь «Спам».', to_login: 'Вернуться ко входу',
      captcha: 'Я не робот',
      err_req: 'Заполни все поля', err_email: 'Проверь email — похоже, опечатка', err_pass: 'Пароль — минимум 8 символов', err_captcha: 'Подтверди, что ты не робот',
      toast_prov: 'Демо: вход через {p} выполнен', toast_created: 'Демо: аккаунт создан, ты вошёл', toast_in: 'Демо: вход выполнен',
      close: 'Закрыть', show_pw: 'Показать пароль', hide_pw: 'Скрыть пароль', slide: 'Слайд {n} из {m}', slides_label: 'Возможности сервиса',
      slides: {
        calls:  ['Новое', 'Позвони ей <em>прямо сейчас</em>', 'Живой голос, её характер и память о ваших разговорах'],
        video:  ['Новое', 'Она <em>станцует</em> для тебя', 'Видео по готовым сценам прямо в чате'],
        create: ['Конструктор', 'Собери её <em>по своему вкусу</em>', 'Внешность, характер, голос и имя — как решишь ты'],
        spicy:  ['🌶 Spicy', 'С чего <em>начнём</em> сегодня?', 'Десятки сценариев — от первого свидания до самых острых'],
        group:  ['Новое', 'Двое — это уже <em>сцена</em>', 'Несколько компаньонок в одном чате, у каждой свой характер'],
        author: ['Новое', 'Стань <em>автором</em> компаньонов', 'Публикуй персонажей, набирай подписчиков и лайки'],
        anime:  ['Новый раздел', 'Аниме <em>уже в каталоге</em>', 'Эльфийки, тихони и строгие секретарши']
      }
    },
    en: {
      su_t: 'Sign up for free', su_s: 'Hundreds of new connections are waiting for you',
      si_t: 'Welcome back', si_s: 'Sign in to continue chatting with your companions',
      or: 'or continue with', email: 'Email',
      legal: 'By continuing, you confirm that you are over 18 years old and agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.',
      have: 'Already have an account?', signin: 'Sign in', noacc: 'Don’t have an account?', signup: 'Sign up',
      nick: 'Username', pass: 'Password', create: 'Create free account', back: 'Back',
      forgot: 'Forgot password?', signin_btn: 'Sign in',
      fp_t: 'Reset your password', fp_s: 'We’ll email you a link to set a new one', fp_btn: 'Send link',
      fp_done_t: 'Check your inbox', fp_done: 'If that email is registered, the link is on its way. Check the spam folder too.', to_login: 'Back to sign in',
      captcha: 'Verify you are human',
      err_req: 'Please fill in all fields', err_email: 'Check your email address', err_pass: 'Password must be at least 8 characters', err_captcha: 'Please complete the check',
      toast_prov: 'Demo: signed in with {p}', toast_created: 'Demo: account created, you’re in', toast_in: 'Demo: signed in',
      close: 'Close', show_pw: 'Show password', hide_pw: 'Hide password', slide: 'Slide {n} of {m}', slides_label: 'What you can do',
      slides: {
        calls:  ['New', 'Call her <em>right now</em>', 'Her live voice, her personality and the memory of your chats'],
        video:  ['New', 'She’ll <em>dance</em> for you', 'Videos from ready-made scenes, right in the chat'],
        create: ['Builder', 'Build her <em>your way</em>', 'Looks, personality, voice and name — exactly who you decide'],
        spicy:  ['🌶 Spicy', 'Where do we <em>start</em> today?', 'Dozens of scenarios — from a first date to the spiciest'],
        group:  ['New', 'Two is already <em>a scene</em>', 'Several companions in one chat, each with her own personality'],
        author: ['New', 'Become a companion <em>creator</em>', 'Publish characters, gain followers and likes'],
        anime:  ['New section', 'Anime <em>is in the catalog</em>', 'Elf girls, shy ones and strict secretaries']
      }
    },
    de: {
      su_t: 'Kostenlos registrieren', su_s: 'Hunderte neue Bekanntschaften warten auf dich',
      si_t: 'Willkommen zurück', si_s: 'Melde dich an, um weiter mit deinen Companions zu chatten',
      or: 'oder weiter mit', email: 'E-Mail',
      legal: 'Indem du fortfährst, bestätigst du, dass du über 18 Jahre alt bist, und akzeptierst unsere <a href="#">Nutzungsbedingungen</a> und <a href="#">Datenschutzerklärung</a>.',
      have: 'Schon ein Konto?', signin: 'Anmelden', noacc: 'Noch kein Konto?', signup: 'Registrieren',
      nick: 'Benutzername', pass: 'Passwort', create: 'Kostenloses Konto erstellen', back: 'Zurück',
      forgot: 'Passwort vergessen?', signin_btn: 'Anmelden',
      fp_t: 'Passwort zurücksetzen', fp_s: 'Wir schicken dir per E-Mail einen Link für ein neues Passwort', fp_btn: 'Link senden',
      fp_done_t: 'E-Mail gesendet', fp_done: 'Wenn diese E-Mail registriert ist, ist der Link unterwegs. Prüfe auch den Spam-Ordner.', to_login: 'Zurück zur Anmeldung',
      captcha: 'Ich bin ein Mensch',
      err_req: 'Bitte fülle alle Felder aus', err_email: 'Prüfe deine E-Mail-Adresse', err_pass: 'Passwort: mindestens 8 Zeichen', err_captcha: 'Bitte bestätige die Prüfung',
      toast_prov: 'Demo: mit {p} angemeldet', toast_created: 'Demo: Konto erstellt, du bist drin', toast_in: 'Demo: angemeldet',
      close: 'Schließen', show_pw: 'Passwort anzeigen', hide_pw: 'Passwort ausblenden', slide: 'Folie {n} von {m}', slides_label: 'Was du hier kannst',
      slides: {
        calls:  ['Neu', 'Ruf sie <em>jetzt an</em>', 'Ihre echte Stimme, ihr Charakter und die Erinnerung an eure Gespräche'],
        video:  ['Neu', 'Sie <em>tanzt</em> für dich', 'Videos aus fertigen Szenen direkt im Chat'],
        create: ['Baukasten', 'Erstelle sie <em>nach deinem Geschmack</em>', 'Aussehen, Charakter, Stimme und Name — genau so, wie du es willst'],
        spicy:  ['🌶 Spicy', 'Womit <em>starten</em> wir heute?', 'Dutzende Szenarien — vom ersten Date bis zum Heißesten'],
        group:  ['Neu', 'Zu zweit wird’s <em>eine Szene</em>', 'Mehrere Companions in einem Chat, jede mit eigenem Charakter'],
        author: ['Neu', 'Werde <em>Creator</em> von Companions', 'Veröffentliche Charaktere, sammle Follower und Likes'],
        anime:  ['Neuer Bereich', 'Anime <em>ist im Katalog</em>', 'Elfen, stille Mädchen und strenge Sekretärinnen']
      }
    }
  };

  /* слайды = промо-баннеры главной (catalog/v2.html, assets/promo-banners.css): классы pb-*,
     вырезы и декор (пилюля звонка, «2 компаньонки», пилюля автора) те же. Набор и порядок —
     по решению: без «видео», «конструктора» и акции (цена региональная); порядок перемешан
     относительно баннеров. Подписи пилюль — PILL[lang]. */
  var SLIDES = [
    { key: 'spicy',  cls: 'pb-spicy',  imgs: [['solo', 'leather']] },
    { key: 'calls',  cls: 'pb-calls',  imgs: [['solo', 'red']],
      extra: function (t) { return '<span class="pb-pill"><span class="ph">' + ICON.phone + '</span><span class="txt">' + t.calls + '</span><span class="pb-eq"><i></i><i></i><i></i><i></i><i></i></span></span>'; } },
    { key: 'author', cls: 'pb-author', imgs: [['solo', 'ginger']],
      extra: function (t) { return '<span class="pb-creator"><span class="av"><img src="' + IMG + 'ginger.webp" alt=""></span><b>@nika_ai ' + ICON.verified + '</b><span>' + t.author + '</span></span>'; } },
    { key: 'anime',  cls: 'pb-anime',  imgs: [['a1', 'anime-office'], ['a2', 'anime-blonde'], ['a3', 'anime-elf']] },
    { key: 'group',  cls: 'pb-group',  imgs: [['l', 'tanktop'], ['r', 'pink']],
      extra: function (t) { return '<span class="pb-duo">' + t.group + '</span>'; } }
  ];
  var PILL = {
    ru: { calls: 'Мия', group: '2 компаньонки · 1 чат', author: '3,2k подписчиков' },
    en: { calls: 'Mia', group: '2 companions · 1 chat', author: '3.2k followers' },
    de: { calls: 'Mia', group: '2 Companions · 1 Chat', author: '3,2k Follower' }
  };
  var INTERVAL = 10000;

  var ICON = {
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.76c-.02-2.3 1.88-3.4 1.96-3.45-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3-.79-1.55.02-2.97.9-3.77 2.28-1.61 2.79-.41 6.92 1.16 9.18.77 1.11 1.68 2.35 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.02.73c1.25-.02 2.04-1.13 2.8-2.24.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.44-3.7zM14.1 6.03c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.03.08 2.07-.52 2.71-1.29z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#2AABEE"/><path fill="#fff" d="M5.4 11.8l11.3-4.4c.5-.2 1 .1.8.9l-1.9 9c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.3-4.8c.2-.2 0-.3-.3-.1l-6.6 4.1-2.8-.9c-.6-.2-.6-.6.1-.9z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    eye: '<svg class="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><svg class="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    verified: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Z" fill="currentColor"/><path d="m8.6 12.25 2.25 2.25 4.55-5.4" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  var PROVIDERS = { google: 'Google', apple: 'Apple', telegram: 'Telegram' };
  var REGION = {
    ru:    { providers: ['google', 'telegram'], captcha: ['Yandex', 'SmartCaptcha'] },
    world: { providers: ['google', 'apple'],    captcha: ['Cloudflare', 'Turnstile'] }
  };

  var html = document.documentElement;
  var lang = (html.lang || 'ru').slice(0, 2).toLowerCase(); if (!I18N[lang]) lang = 'en';
  var region = REGION[html.dataset.region] ? html.dataset.region : (lang === 'ru' ? 'ru' : 'world');
  var T = I18N[lang], R = REGION[region];
  var src = document.currentScript ? document.currentScript.src : 'assets/auth.js';
  var IMG = src.replace(/auth\.js(\?.*)?$/, '') + 'img/hero/';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var root = null, side = null, form = null, lastFocus = null, mode = 'signup';

  /* ── разметка ── */
  function provButtons() {
    return R.providers.map(function (p) {
      return '<button type="button" class="au-prov" data-prov="' + p + '">' + ICON[p] + PROVIDERS[p] + '</button>';
    }).join('');
  }
  function field(type, name, icon, placeholder, extra) {
    return '<div class="au-field">' + ICON[icon] +
      '<input type="' + type + '" name="' + name + '" placeholder="' + placeholder + '" aria-label="' + placeholder + '"' + (extra || '') + '>' +
      (type === 'password' ? '<button type="button" class="au-eye" aria-pressed="false" aria-label="' + T.show_pw + '">' + ICON.eye + '</button>' : '') +
      '</div>';
  }
  function captcha() {
    return '<label class="au-captcha"><input type="checkbox" name="captcha"><span class="box">' + ICON.check + '</span>' +
      '<span class="lbl">' + T.captcha + '</span><span class="by">' + R.captcha[0] + '<b>' + R.captcha[1] + '</b></span></label>';
  }
  function legal() { return '<p class="au-legal">' + T.legal + '</p>'; }
  function back(step, label) { return '<button type="button" class="au-back" data-go="' + step + '">' + ICON.back + (label || T.back) + '</button>'; }

  function build() {
    root = document.createElement('div');
    root.className = 'au'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.innerHTML =
      '<div class="au-panel">' +
        '<button type="button" class="au-x" data-close aria-label="' + T.close + '">' + ICON.x + '</button>' +
        '<div class="au-side" aria-roledescription="carousel" aria-label="' + T.slides_label + '">' +
          SLIDES.map(function (s, i) {
            var t = T.slides[s.key];
            var imgs = s.imgs.map(function (im) { return '<img class="' + im[0] + '" src="' + IMG + im[1] + '.webp" alt=""' + (i ? ' loading="lazy"' : '') + '>'; }).join('');
            var badge = t[0] === '🌶 Spicy' || s.key === 'create' || s.key === 'anime' ? '' : ' new';
            return '<div class="au-slide ' + s.cls + '" role="group" aria-label="' + T.slide.replace('{n}', i + 1).replace('{m}', SLIDES.length) + '">' +
              '<div class="pb-bg" aria-hidden="true"></div>' +
              '<div class="pb-art" aria-hidden="true">' + imgs + (s.extra ? s.extra(PILL[lang]) : '') + '</div>' +
              '<div class="pb-txt"><div class="pb-badges"><span class="pb-badge' + badge + '">' + t[0] + '</span></div>' +
              '<h3 class="pb-h">' + t[1] + '</h3><p class="pb-sub">' + t[2] + '</p></div></div>';
          }).join('') +
          '<div class="au-dots" role="tablist">' + SLIDES.map(function (s, i) {
            return '<button type="button" class="au-dot" role="tab" data-slide="' + i + '" aria-label="' + T.slide.replace('{n}', i + 1).replace('{m}', SLIDES.length) + '"></button>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="au-form">' +

          /* регистрация: провайдеры */
          '<div class="au-step" data-step="su" hidden>' +
            '<h2 class="au-t">' + T.su_t + '</h2><p class="au-s">' + T.su_s + '</p>' +
            provButtons() +
            '<div class="au-or">' + T.or + '</div>' +
            '<button type="button" class="au-prov email" data-go="su-email">' + ICON.mail + T.email + '</button>' +
            legal() +
            '<p class="au-alt">' + T.have + ' <button type="button" class="au-link" data-go="si">' + T.signin + '</button></p>' +
          '</div>' +

          /* регистрация: email */
          '<form class="au-step" data-step="su-email" novalidate hidden>' +
            '<h2 class="au-t">' + T.su_t + '</h2><p class="au-s">' + T.su_s + '</p>' +
            field('text', 'nick', 'user', T.nick, ' autocomplete="username"') +
            field('email', 'email', 'mail', T.email, ' autocomplete="email"') +
            field('password', 'pass', 'lock', T.pass, ' autocomplete="new-password"') +
            captcha() +
            '<p class="au-err" role="alert"></p>' +
            '<button type="submit" class="au-submit">' + T.create + '</button>' +
            legal() +
            '<p class="au-alt">' + T.have + ' <button type="button" class="au-link" data-go="si">' + T.signin + '</button></p>' +
            back('su') +
          '</form>' +

          /* вход: провайдеры */
          '<div class="au-step" data-step="si" hidden>' +
            '<h2 class="au-t">' + T.si_t + '</h2><p class="au-s">' + T.si_s + '</p>' +
            provButtons() +
            '<div class="au-or">' + T.or + '</div>' +
            '<button type="button" class="au-prov email" data-go="si-email">' + ICON.mail + T.email + '</button>' +
            legal() +
            '<p class="au-alt">' + T.noacc + ' <button type="button" class="au-link" data-go="su">' + T.signup + '</button></p>' +
          '</div>' +

          /* вход: email */
          '<form class="au-step" data-step="si-email" novalidate hidden>' +
            '<h2 class="au-t">' + T.si_t + '</h2><p class="au-s">' + T.si_s + '</p>' +
            field('email', 'email', 'mail', T.email, ' autocomplete="email"') +
            field('password', 'pass', 'lock', T.pass, ' autocomplete="current-password"') +
            '<button type="button" class="au-link au-forgot" data-go="fp">' + T.forgot + '</button>' +
            '<p class="au-err" role="alert"></p>' +
            '<button type="submit" class="au-submit">' + T.signin_btn + '</button>' +
            '<p class="au-alt">' + T.noacc + ' <button type="button" class="au-link" data-go="su">' + T.signup + '</button></p>' +
            back('si') +
          '</form>' +

          /* восстановление пароля */
          '<form class="au-step" data-step="fp" novalidate hidden>' +
            '<h2 class="au-t">' + T.fp_t + '</h2><p class="au-s">' + T.fp_s + '</p>' +
            field('email', 'email', 'mail', T.email, ' autocomplete="email"') +
            '<p class="au-err" role="alert"></p>' +
            '<button type="submit" class="au-submit">' + T.fp_btn + '</button>' +
            back('si-email') +
          '</form>' +
          '<div class="au-step" data-step="fp-done" hidden>' +
            '<div class="au-done"><span class="ok">' + ICON.check + '</span><h2 class="au-t">' + T.fp_done_t + '</h2><p>' + T.fp_done + '</p></div>' +
            back('si-email', T.to_login) +
          '</div>' +

        '</div>' +
      '</div>';
    document.body.appendChild(root);
    side = root.querySelector('.au-side'); form = root.querySelector('.au-form');

    root.addEventListener('click', function (e) {
      if (e.target === root || e.target.closest('[data-close]')) { close(); return; }
      var go = e.target.closest('[data-go]'); if (go) { show(go.dataset.go); return; }
      var prov = e.target.closest('[data-prov]'); if (prov) { provider(prov); return; }
      var eye = e.target.closest('.au-eye'); if (eye) { toggleEye(eye); return; }
      var dot = e.target.closest('[data-slide]'); if (dot) { goSlide(+dot.dataset.slide); restart(); }
    });
    root.querySelectorAll('form').forEach(function (f) { f.addEventListener('submit', submit); });
    root.addEventListener('keydown', trap);
    side.addEventListener('pointerenter', function () { paused = true; });
    side.addEventListener('pointerleave', function () { paused = false; });
    side.addEventListener('focusin',  function () { paused = true; });
    side.addEventListener('focusout', function () { paused = false; });
  }

  /* ── шаги ── */
  function show(step) {
    root.querySelectorAll('.au-step').forEach(function (s) { s.hidden = s.dataset.step !== step; });
    var cur = root.querySelector('[data-step="' + step + '"]');
    var err = cur.querySelector('.au-err'); if (err) { err.classList.remove('show'); }
    form.scrollTop = 0;
    var first = cur.querySelector('input, .au-prov, .au-back');
    if (first) first.focus({ preventScroll: true });
  }
  function toggleEye(btn) {
    var on = btn.getAttribute('aria-pressed') !== 'true', input = btn.parentNode.querySelector('input');
    btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', on ? T.hide_pw : T.show_pw);
    input.type = on ? 'text' : 'password'; input.focus();
  }
  function busy(btn, ms, then) { btn.classList.add('is-busy'); setTimeout(function () { btn.classList.remove('is-busy'); then(); }, ms); }
  function provider(btn) { busy(btn, 900, function () { signedIn(T.toast_prov.replace('{p}', PROVIDERS[btn.dataset.prov])); }); }
  function submit(e) {
    e.preventDefault();
    var f = e.target, step = f.dataset.step, err = f.querySelector('.au-err'), btn = f.querySelector('.au-submit');
    var v = function (n) { var i = f.querySelector('[name="' + n + '"]'); return i ? i.value.trim() : ''; };
    var msg = '';
    if (step === 'su-email') {
      if (!v('nick') || !v('email') || !v('pass')) msg = T.err_req;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) msg = T.err_email;
      else if (v('pass').length < 8) msg = T.err_pass;
      else if (!f.querySelector('[name="captcha"]').checked) msg = T.err_captcha;
    } else if (step === 'si-email') {
      if (!v('email') || !v('pass')) msg = T.err_req;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) msg = T.err_email;
    } else if (step === 'fp') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) msg = T.err_email;
    }
    if (msg) { err.textContent = msg; err.classList.add('show'); var bad = f.querySelector('input:placeholder-shown, input'); if (bad) bad.focus(); return; }
    err.classList.remove('show');
    busy(btn, 1000, function () {
      if (step === 'fp') { show('fp-done'); return; }
      signedIn(step === 'su-email' ? T.toast_created : T.toast_in);
    });
  }
  /* демо-вход: закрыть, в топбаре — аватар вместо кнопок */
  function signedIn(msg) {
    close();
    document.querySelectorAll('.tb-right').forEach(function (r) {
      if (!r.querySelector('.tb-ava')) { var a = document.createElement('div'); a.className = 'tb-ava'; a.textContent = 'A'; a.title = 'demo'; r.appendChild(a); }
      r.classList.add('is-auth');
    });
    toast(msg);
  }

  /* ── слайдер ── */
  var idx = 0, timer = 0, paused = false;
  function goSlide(n) {
    var slides = side.querySelectorAll('.au-slide'), dots = side.querySelectorAll('.au-dot');
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('on', i === idx); });
    dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); d.setAttribute('aria-selected', i === idx); });
    var next = slides[(idx + 1) % slides.length].querySelector('img'); if (next && next.loading === 'lazy') next.loading = 'eager';
  }
  function tick() { if (!paused && !document.hidden) goSlide(idx + 1); }
  function restart() { clearInterval(timer); if (!calm) timer = setInterval(tick, INTERVAL); }

  /* ── открытие / закрытие ── */
  function open(m, trigger) {
    if (!root) build();
    mode = m === 'login' ? 'login' : 'signup';
    lastFocus = trigger || document.activeElement;
    root.hidden = false; document.body.style.overflow = 'hidden';
    void root.offsetWidth;                       // зафиксировать стартовый кадр, чтобы сработал переход
    root.classList.add('show');
    show(mode === 'login' ? 'si' : 'su');
    goSlide(idx); restart();
    try { history.replaceState(null, '', '#' + mode); } catch (e) {}
  }
  function close() {
    if (!root || root.hidden) return;
    root.classList.remove('show'); clearInterval(timer);
    document.body.style.overflow = '';
    setTimeout(function () { root.hidden = true; }, calm ? 0 : 200);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function trap(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(root.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])'), function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  var toastEl, toastT;
  function toast(html) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'au-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = html; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-auth]'); if (!b) return;
    e.preventDefault(); open(b.dataset.auth, b);
  });
  document.addEventListener('visibilitychange', function () { if (root && !root.hidden && !document.hidden) restart(); });
  function fromHash() { var h = location.hash.replace('#', ''); if (h === 'signup' || h === 'login') open(h); }
  window.addEventListener('hashchange', fromHash);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fromHash); else fromHash();

  window.LovixAuth = { open: open, close: close };
})();
