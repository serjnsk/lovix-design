#!/usr/bin/env python3
"""Листы промо-баннеров главной в трёх языках: catalog/banners-{ru,en,de}.html.

Вёрстка карточек — та же, что в catalog/v2.html (assets/promo-banners.css),
здесь каждая из восьми карточек показана в десктопном виде и рядом — в
мобильном (340px). Мобильная версия — тот же HTML в фрейме шириной 340px
(catalog/banners-m-{lang}.html?card=…): медиа-запросы считают ширину
фрейма, поэтому карточка рендерится ровно как на телефоне, без второго CSS. Тексты — единственный источник переводов баннеров; при
правке копии в v2.html (RU) обновить и здесь, затем перегенерировать:

    python3 catalog/banners-build.py
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERIFIED = re.search(r'<symbol id="i-verified".*?</symbol>', (ROOT / 'catalog/v2.html').read_text(encoding='utf-8')).group(0)

PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2z"/></svg>'
PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
IMG = '../assets/img/hero/'

# ── интенты: порядок и арт общие, тексты — по языкам ──
CARDS = [
    dict(key='calls',  cls='pb-calls',  art=[('solo', 'red')],
         extra=lambda t: f'<span class="pb-pill"><span class="ph">{PHONE}</span><span class="txt">{t["pill"]}</span><span class="pb-eq"><i></i><i></i><i></i><i></i><i></i></span></span>'),
    dict(key='video',  cls='pb-video',  art=[('solo', 'blonde2')],
         extra=lambda t: f'<span class="pb-play">{PLAY}</span>'),
    dict(key='create', cls='pb-build',  art=[('l', 'glasses-blonde'), ('r', 'brown2')]),
    dict(key='spicy',  cls='pb-spicy',  art=[('solo', 'leather')]),
    dict(key='group',  cls='pb-group',  art=[('l', 'tanktop'), ('r', 'pink')],
         extra=lambda t: f'<span class="pb-duo">{t["pill"]}</span>'),
    dict(key='author', cls='pb-author', art=[('solo', 'ginger')],
         extra=lambda t: f'<span class="pb-creator"><span class="av"><img src="{IMG}ginger.webp" alt=""></span><b>@nika_ai <svg><use href="#i-verified"/></svg></b><span>{t["pill"]}</span></span>'),
    dict(key='anime',  cls='pb-anime',  art=[('a1', 'anime-office'), ('a2', 'anime-blonde'), ('a3', 'anime-elf')]),
    dict(key='sale',   cls='pb-sale',   art=[('solo', 'glasses')], hide_for='vip',
         extra=lambda t: f'<span class="pb-tag">−45%<small>{t["tag"]}</small></span>'),
]

# badge: (класс, текст); title: с <em>; sub: абзац; cta; pill/tag/price — по карточке
TEXT = {
  'ru': dict(
    lang='ru', name='Русский', title='Промо-баннеры главной · RU',
    lead='Восемь карточек главной страницы, как в catalog/v2.html: одна фича — одна карточка — один CTA. Слева десктоп, справа — телефон 340px.',
    note_vip='скрывается для тарифа VIP', note_vipmark='бейдж VIP — только не-VIP тарифам', mobile='Телефон · 340px', mobile_all='все на телефоне',
    cards=dict(
      calls=dict(badges=[('new', 'Новое'), ('vip', 'VIP')], title='Позвони ей <em>прямо сейчас</em>', sub='Живой голос, её характер и память о ваших разговорах — в реальном времени.', cta='Позвонить', pill='Мия'),
      video=dict(badges=[('new', 'Новое'), ('vip', 'VIP')], title='Она <em>станцует</em> для тебя', sub='Танцует, йога, воздушный поцелуй — видео по готовым сценам прямо в чате.', cta='Заказать видео'),
      create=dict(badges=[('', 'Конструктор')], title='Собери её <em>по своему вкусу</em>', sub='Внешность, характер, голос и имя — она будет именно такой, как ты решишь.', cta='Создать компаньона'),
      spicy=dict(badges=[('', '🌶 Spicy')], title='С чего <em>начнём</em> сегодня?', sub='Десятки готовых сценариев — от первого свидания до самых острых.', cta='Выбрать сценарий'),
      group=dict(badges=[('new', 'Новое'), ('vip', 'VIP')], title='Двое — это уже <em>сцена</em>', sub='Несколько компаньонок в одном чате, у каждой — свой характер.', cta='Открыть групповой чат', pill='2 компаньонки · 1 чат'),
      author=dict(badges=[('new', 'Новое')], title='Стань <em>автором</em> компаньонов', sub='Публикуй персонажей в каталоге, набирай подписчиков и лайки.', cta='Стать автором', pill='3,2k подписчиков'),
      anime=dict(badges=[('', 'Новый раздел')], title='Аниме <em>уже в каталоге</em>', sub='Эльфийки, тихони и строгие секретарши — в рисованном стиле.', cta='Смотреть аниме'),
      sale=dict(badges=[('', 'Акция')], title='VIP на год <em>выгоднее на 45%</em>', price=('875 ₽', '1 590 ₽', '/ мес'), cta='Оформить на год', tag='vip · год'),
    )),
  'en': dict(
    lang='en', name='English', title='Home promo banners · EN',
    lead='The eight home-page cards from catalog/v2.html: one feature — one card — one CTA. Desktop on the left, 340px phone on the right.',
    note_vip='hidden for the VIP plan', note_vipmark='VIP badge shown to non-VIP plans only', mobile='Phone · 340px', mobile_all='all on a phone',
    cards=dict(
      calls=dict(badges=[('new', 'New'), ('vip', 'VIP')], title='Call her <em>right now</em>', sub='Her live voice, her personality and the memory of your chats — in real time.', cta='Call now', pill='Mia'),
      video=dict(badges=[('new', 'New'), ('vip', 'VIP')], title='She’ll <em>dance</em> for you', sub='Dancing, yoga, a blown kiss — videos from ready-made scenes, right in the chat.', cta='Order a video'),
      create=dict(badges=[('', 'Builder')], title='Build her <em>your way</em>', sub='Looks, personality, voice and name — she’ll be exactly who you decide.', cta='Create a companion'),
      spicy=dict(badges=[('', '🌶 Spicy')], title='Where do we <em>start</em> today?', sub='Dozens of ready scenarios — from a first date to the spiciest.', cta='Pick a scenario'),
      group=dict(badges=[('new', 'New'), ('vip', 'VIP')], title='Two is already <em>a scene</em>', sub='Several companions in one chat, each with her own personality.', cta='Open a group chat', pill='2 companions · 1 chat'),
      author=dict(badges=[('new', 'New')], title='Become a companion <em>creator</em>', sub='Publish characters to the catalog, gain followers and likes.', cta='Become a creator', pill='3.2k followers'),
      anime=dict(badges=[('', 'New section')], title='Anime <em>is in the catalog</em>', sub='Elf girls, shy ones and strict secretaries — in a drawn style.', cta='Browse anime'),
      sale=dict(badges=[('', 'Sale')], title='VIP for a year <em>45% cheaper</em>', price=('$8.79', '$15.99', '/ mo'), cta='Get a year', tag='vip · year'),
    )),
  'de': dict(
    lang='de', name='Deutsch', title='Promo-Banner der Startseite · DE',
    lead='Die acht Karten der Startseite aus catalog/v2.html: ein Feature — eine Karte — ein CTA. Links Desktop, rechts Telefon mit 340px.',
    note_vip='für den VIP-Tarif ausgeblendet', note_vipmark='VIP-Badge nur für Nicht-VIP-Tarife', mobile='Telefon · 340px', mobile_all='alle am Telefon',
    cards=dict(
      calls=dict(badges=[('new', 'Neu'), ('vip', 'VIP')], title='Ruf sie <em>jetzt an</em>', sub='Ihre echte Stimme, ihr Charakter und die Erinnerung an eure Gespräche — in Echtzeit.', cta='Anrufen', pill='Mia'),
      video=dict(badges=[('new', 'Neu'), ('vip', 'VIP')], title='Sie <em>tanzt</em> für dich', sub='Tanz, Yoga, Kusshand — Videos aus fertigen Szenen direkt im Chat.', cta='Video bestellen'),
      create=dict(badges=[('', 'Baukasten')], title='Erstelle sie <em>nach deinem Geschmack</em>', sub='Aussehen, Charakter, Stimme und Name — sie wird genau so, wie du es willst.', cta='Companion erstellen'),
      spicy=dict(badges=[('', '🌶 Spicy')], title='Womit <em>starten</em> wir heute?', sub='Dutzende fertige Szenarien — vom ersten Date bis zum Heißesten.', cta='Szenario wählen'),
      group=dict(badges=[('new', 'Neu'), ('vip', 'VIP')], title='Zu zweit wird’s <em>eine Szene</em>', sub='Mehrere Companions in einem Chat, jede mit eigenem Charakter.', cta='Gruppenchat öffnen', pill='2 Companions · 1 Chat'),
      author=dict(badges=[('new', 'Neu')], title='Werde <em>Creator</em> von Companions', sub='Veröffentliche Charaktere im Katalog, sammle Follower und Likes.', cta='Creator werden', pill='3,2k Follower'),
      anime=dict(badges=[('', 'Neuer Bereich')], title='Anime <em>ist im Katalog</em>', sub='Elfen, stille Mädchen und strenge Sekretärinnen — im Zeichenstil.', cta='Anime ansehen'),
      sale=dict(badges=[('', 'Aktion')], title='VIP für ein Jahr <em>45 % günstiger</em>', price=('8,79 $', '15,99 $', '/ Monat'), cta='Ein Jahr holen', tag='vip · jahr'),
    )),
}

INTENT_NAMES = {
  'ru': dict(calls='Голосовые звонки', video='Видео по пресетам', create='Конструктор компаньона', spicy='Spicy-сценарии', group='Групповые чаты', author='Авторы компаньонов', anime='Аниме-раздел', sale='Акция: VIP на год'),
  'en': dict(calls='Voice calls', video='Preset videos', create='Companion builder', spicy='Spicy scenarios', group='Group chats', author='Companion creators', anime='Anime section', sale='Sale: VIP for a year'),
  'de': dict(calls='Sprachanrufe', video='Preset-Videos', create='Companion-Baukasten', spicy='Spicy-Szenarien', group='Gruppenchats', author='Companion-Creator', anime='Anime-Bereich', sale='Aktion: VIP für ein Jahr'),
}


def card_html(c, t, L):
    art = ''.join(f'<img class="{cls}" src="{IMG}{name}.webp" alt="">' for cls, name in c['art'])
    extra = c['extra'](t) if 'extra' in c else ''
    badges = ''.join(
        f'<span class="pb-badge{(" " + cls) if cls else ""}"{" data-vip-mark" if cls == "vip" else ""}>{txt}</span>'
        for cls, txt in t['badges'])
    body = f'<p class="pb-sub">{t["sub"]}</p>' if 'sub' in t else \
        f'<div class="pb-price"><b>{t["price"][0]}</b><s>{t["price"][1]}</s><span>{t["price"][2]}</span></div>'
    hide = ' data-hide-for="vip"' if c.get('hide_for') else ''
    return f'''<a class="pb-card {c['cls']}" href="#" data-intent="{c['key']}"{hide}>
          <div class="pb-bg" aria-hidden="true"></div>
          <div class="pb-art" aria-hidden="true">{art}{extra}</div>
          <div class="pb-txt">
            <div class="pb-badges">{badges}</div>
            <h2 class="pb-h">{t['title']}</h2>
            {body}
            <span class="pb-cta">{t['cta']} <i>→</i></span>
          </div>
        </a>'''


def page(lang):
    T = TEXT[lang]
    names = INTENT_NAMES[lang]
    switch = ' '.join(
        f'<a href="banners-{l}.html"{" class=on" if l == lang else ""}>{TEXT[l]["name"]}</a>' for l in ('ru', 'en', 'de'))
    items = []
    for i, c in enumerate(CARDS, 1):
        t = T['cards'][c['key']]
        notes = []
        if any(cls == 'vip' for cls, _ in t['badges']): notes.append(T['note_vipmark'])
        if c.get('hide_for'): notes.append(T['note_vip'])
        plain = lambda h: re.sub(r'<[^>]+>', '', h)
        copy = [plain(t['title']), t['sub'] if 'sub' in t else ' '.join(t['price']), t['cta'] + ' →']
        if 'pill' in t: copy.append(t['pill'])
        if 'tag' in t: copy.append('−45% · ' + t['tag'])
        cap = (f'<figcaption><b>{i:02d}</b> {names[c["key"]]}' + (f' <span>· {"; ".join(notes)}</span>' if notes else '')
               + '<small>' + ' · '.join(copy) + '</small></figcaption>')
        frame = (f'<iframe src="banners-m-{lang}.html?card={c["key"]}" width="340" height="278" loading="lazy" scrolling="no" '
                 f'title="{T["mobile"]} — {names[c["key"]]}"></iframe>')
        items.append(f'<figure><div class="pair">{card_html(c, t, L=lang)}{frame}</div>{cap}</figure>')
    cards = '\n        '.join(items)
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Lovix — {T['title']}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/lovix.css">
<link rel="stylesheet" href="../assets/promo-banners.css">
<style>
  /* Лист переводов: сгенерирован catalog/banners-build.py — править данные там. */
  body {{ background: linear-gradient(to bottom right, rgb(var(--page-from)) 0%, rgb(var(--page)) 60%); min-height: 100vh; }}
  .sheet {{ max-width: 1240px; margin: 0 auto; padding: 36px 44px 80px; }}
  .sheet-head {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px 24px; margin-bottom: 8px; }}
  .sheet-head h1 {{ margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -.015em; }}
  .sheet-m {{ font-size: 13px; color: rgb(var(--muted)); text-decoration: none; }}
  .sheet-m:hover {{ color: #fff; }}
  .sheet-lang {{ display: flex; gap: 4px; margin-left: auto; }}
  .sheet-lang a {{ padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #d5d5d9; text-decoration: none; background: rgba(255,255,255,.06); }}
  .sheet-lang a:hover {{ background: rgba(255,255,255,.12); color: #fff; }}
  .sheet-lang a.on {{ background: linear-gradient(90deg, rgb(var(--acc-from)), rgb(var(--acc-to))); color: #fff; }}
  .sheet-lead {{ margin: 0 0 28px; color: rgb(var(--muted)); font-size: .95rem; max-width: 80ch; }}
  .sheet-grid {{ display: grid; gap: 28px; }}
  .sheet-grid figure {{ margin: 0; min-width: 0; }}
  /* десктопная карточка в ширину, как на главной при 1600px (604px), рядом — фрейм телефона 340px */
  .pair {{ display: grid; grid-template-columns: minmax(0, 604px) 340px; gap: 24px; align-items: start; }}
  .pair iframe {{ display: block; border: 0; border-radius: 16px; background: #1b1830; }}
  @media (max-width: 1100px) {{ .pair {{ grid-template-columns: minmax(0, 1fr); }} .pair iframe {{ max-width: 100%; }} }}
  .sheet-grid figcaption {{ margin-top: 10px; font-size: 13px; color: rgb(var(--muted)); }}
  .sheet-grid figcaption b {{ color: #fff; font-weight: 800; margin-right: 6px; }}
  .sheet-grid figcaption span {{ color: rgb(var(--muted2)); }}
  /* полный текст карточки — для сверки перевода (на узких экранах часть текста в карточке скрыта бюджетом высоты) */
  .sheet-grid figcaption small {{ display: block; margin-top: 4px; font-size: 12px; line-height: 1.45; color: rgb(var(--muted2)); }}
  @media (max-width: 860px) {{ .sheet {{ padding: 24px 20px 60px; }} }}
  @media (max-width: 560px) {{ .sheet {{ padding: 16px 14px 48px; }} }}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">{VERIFIED}</svg>
<main class="sheet">
  <div class="sheet-head">
    <h1>{T['title']}</h1>
    <a class="sheet-m" href="banners-m-{lang}.html">{T['mobile']} · {T['mobile_all']} →</a>
    <nav class="sheet-lang" aria-label="Language">{switch}</nav>
  </div>
  <p class="sheet-lead">{T['lead']}</p>
  <div class="sheet-grid">
        {cards}
  </div>
</main>
</body>
</html>
'''


def mobile_page(lang):
    """Телефонная страница: карточки столбиком во всю ширину; ?card=<key> оставляет одну —
    так её встраивают фреймом 340px в лист. Без параметра — все восемь, для просмотра на телефоне."""
    T = TEXT[lang]
    cards = '\n    '.join(card_html(c, T['cards'][c['key']], L=lang) for c in CARDS)
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Lovix — {T['title']} · {T['mobile']}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/lovix.css">
<link rel="stylesheet" href="../assets/promo-banners.css">
<style>
  /* Телефонная версия листа: сгенерирована catalog/banners-build.py. Ширина карточки = ширина
     окна минус 14px по краям — на телефоне 375px это те же ~312px, что у карточки карусели (90%). */
  body {{ margin: 0; padding: 14px; background: linear-gradient(to bottom right, rgb(var(--page-from)) 0%, rgb(var(--page)) 60%); min-height: 100vh; box-sizing: border-box; }}
  .m {{ display: grid; gap: 12px; max-width: 420px; margin: 0 auto; }}
  body.one .m {{ max-width: none; }}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">{VERIFIED}</svg>
<div class="m">
    {cards}
</div>
<script>
  /* ?card=calls — показать одну карточку (режим фрейма в листе) */
  (function () {{
    var key = new URLSearchParams(location.search).get('card');
    if (!key) return;
    document.body.classList.add('one');
    document.querySelectorAll('.pb-card').forEach(function (c) {{ if (c.dataset.intent !== key) c.remove(); }});
  }})();
</script>
</body>
</html>
'''


if __name__ == '__main__':
    for lang in TEXT:
        for name, fn in ((f'catalog/banners-{lang}.html', page), (f'catalog/banners-m-{lang}.html', mobile_page)):
            out = ROOT / name
            out.write_text(fn(lang), encoding='utf-8')
            print('wrote', out.relative_to(ROOT))
