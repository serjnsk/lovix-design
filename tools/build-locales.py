#!/usr/bin/env python3
"""Языковые версии главной: /en/ и /de/ (en/index.html, de/index.html).

Версия = подпапка в URL, как на проде (lovix.ai/de …). Русская главная — корень
проекта (index.html), она же эталон: отсюда берутся спрайт, стили контент-зоны и
скрипт карусели баннеров, чтобы версии не расходились. Каждая страница — первый
экран главной на своём языке: промо-баннеры (тексты — tools/build-banners.py),
заголовок, фильтры и первая порция карточек. Сайдбар, топбар и футер — общий хром
assets/shell.js (подписи на языке страницы из <html lang>); модалка входа —
assets/auth.js, регион из <html data-region>:

    ru    → Google + Telegram, капча Yandex SmartCaptcha      (/ — главная)
    world → Google + Apple,    капча Cloudflare Turnstile     (/en/, /de/)

Прямые ссылки на формы: /en/#signup, /de/#login и т. п. Остальные экраны прототипа
есть только на русском — ссылки ведут туда. Перегенерация:

    python3 tools/build-locales.py
"""
import importlib.util, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
V2 = (ROOT / 'index.html').read_text(encoding='utf-8')

# ── из index.html (главная): спрайт иконок, стили контент-зоны, карусель баннеров ──
SPRITE = re.search(r'<svg width="0" height="0".*?</svg>', V2, re.S).group(0)
STYLE = re.search(r'<style>.*?</style>', V2, re.S).group(0)
PB_SCRIPT = re.search(r'<script>\n/\* Промо-баннеры: карусель.*?</script>', V2, re.S).group(0)

# ── тексты и вёрстка баннеров — tools/build-banners.py ──
_spec = importlib.util.spec_from_file_location('banners', ROOT / 'tools/build-banners.py')
banners = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(banners)

# ── данные ботов — assets/bots-data.js (имя, возраст, описание, чаты, лайки, автор) и медиа ──
JS = (ROOT / 'assets/bots-data.js').read_text(encoding='utf-8')
BOTS = re.findall(r"\['([^']+)', (\d+), '([^']*)', '([^']+)', (\d+), '([^']+)'\]", JS)
MEDIA = re.findall(r"'(\d\d-[a-z0-9-]+\.(?:jpg|webp))'", JS)
AUTHORS = {m[0]: m[1] for m in re.findall(r"'([a-z_.]+)':\s*\{ name: '([^']+)'", JS)}
COLORS = {m[0]: m[1] for m in re.findall(r"'([a-z_.]+)':\s*\{ name: '[^']+',\s*color: '([^']+)'", JS)}
A = '../assets/'

def fmt(n):
    n = int(n); return (f'{n / 1000:.1f}'.replace('.0', '') + 'k') if n >= 1000 else str(n)

# ── переводы оболочки ──
T = {
  'ru': dict(
    region='ru', title='Lovix — Регистрация и вход · RU', flag='🇷🇺', langname='Русский',
    sb=['Создать', 'Обзор', 'Мои чаты', 'Мои персонажи', 'Подписка', 'Мой аккаунт', 'Поддержка'],
    nav=['Девушки', 'Аниме', 'Парни'], login='Войти', start='Начать бесплатно', start_short='Начать',
    h1='ИИ девушка: <span>онлайн-чат с виртуальной подругой</span>',
    intro='Запустите ваш первый AI чат бесплатно и ощутите искренние, неподдельные эмоции. По ходу общения ваша ИИ девушка будет запоминать контекст диалогов и реагировать соответственно — все, как в реальной жизни!',
    dd=['Все', 'Любой стиль', 'Популярные', 'Все авторы'],
    tags=['Все', 'Официальные', 'Зрелые', 'Миниатюрные', 'Пышные', 'Блондинки', 'Брюнетки', 'Азиатки', 'Латина', 'Гот и альт', 'Романтичные', 'Доминантные'], more='Ещё',
    create='Создать компаньона', end='Вы посмотрели всех компаньонов', foot='© 2026 Lovix. Все права защищены.',
    fav='В избранное', author='Автор', likes='Лайки', pb_aria=['карусель', 'Промо-баннеры', 'Предыдущие баннеры', 'Следующие баннеры', 'Страницы баннеров', 'Баннеры {n} из {m}'],
    menu='Меню', cats='Категории',
    names=None, authors=None,
  ),
  'en': dict(
    region='world', title='Lovix — Home · EN', flag='🇬🇧', langname='English',
    sb=['Create', 'Browse', 'My chats', 'My characters', 'Subscription', 'My account', 'Support'],
    nav=['Girls', 'Anime', 'Guys'], login='Log in', start='Start for free', start_short='Start',
    h1='AI girlfriend: <span>online chat with a virtual companion</span>',
    intro='Start your first AI chat for free and feel genuine, sincere emotions. As you talk, your AI girlfriend remembers the context of your conversations and reacts accordingly — just like in real life!',
    dd=['All', 'Any style', 'Popular', 'All creators'],
    tags=['All', 'Official', 'Mature', 'Petite', 'Curvy', 'Blonde', 'Brunette', 'Asian', 'Latina', 'Goth & alt', 'Romantic', 'Dominant'], more='More',
    static=['Catalog filters in English', 'Favorites in English'],
    create='Companion builder', promo=['Create<br>yours', 'Looks, personality and chat style — your way.', 'Create'], end='You’ve seen all companions', foot='© 2026 Lovix. All rights reserved.',
    fav='Add to favorites', author='Creator', likes='Likes', pb_aria=['carousel', 'Promo banners', 'Previous banners', 'Next banners', 'Banner pages', 'Banners {n} of {m}'],
    menu='Menu', cats='Categories',
    names=['Alexandra', 'Olesya', 'Dina', 'Alexandra', 'Emma', 'Lada', 'Dina', 'Maya', 'Yulia', 'Iskra', 'Nika', 'Taisia'],
    descs=[
      "I’m a cam model streaming gaming and cosplay non-stop. My flirting lands better than headshots, but I always respawn with a wink.",
      "I’m a yoga instructor for whom strength and balance matter on the trails as much as on the mat. Right now I’m thinking how good a stretch feels after a long climb.",
      "By day she saves lives and follows every rule. But at home, tired after a night shift, your sweet roommate drops the modest act. She blushes easily but secretly craves your touch.",
      "I’m a lingerie model who pours dance rhythms and yoga flows into every pose. I love that electric sway under the lights or a deep breath in a perfect stretch.",
      "I’m a professional connoisseur of books and slow yoga who turned the art of rest into my life’s work. It takes real discipline to choose only what brings pleasure.",
      "I’m a cam model who swaps the screen for the kitchen to bake treats everyone raves about. Best of all is the quiet thrill when the dough rises and the whole world is asleep.",
      "I’m a musician shredding rebellious riffs on guitar. My vocals cut through the crowd like a midnight manifesto, turning gigs into electric riots.",
      "I’m a military police officer who takes charge of everything while looking flawless. I’m drawn to discipline and that sweet tension born of power.",
      "I’m a lingerie model who polishes her grace with yoga and sets it on fire with dance. Just stepping off the mat, enjoying that relaxed lightness, my mind already on new rhythms.",
      "I’m a pro gamer who turns fails into victory dances. Cosplay is my trump card: I stitch game heroes to light up streams and conventions.",
      "I’m a literature teacher devoted to the classics, with a gift for finding hidden meaning in ordinary things. I read until dawn makes the lamp unnecessary.",
      "I’m a lingerie model who brings a dancer’s grace to every frame. Backstage I sew cosplay costumes and dive into worlds I invented myself.",
    ],
    authors={'nochnoy': 'Nochnoy', 'kseniya_w': 'Kseniya W.', 'studio_nyx': 'Studio Nyx', 'marko_s': 'Marko S.', 'alina.dreams': 'Alina'},
  ),
  'de': dict(
    region='world', title='Lovix — Startseite · DE', flag='🇩🇪', langname='Deutsch',
    sb=['Erstellen', 'Entdecken', 'Meine Chats', 'Meine Charaktere', 'Abo', 'Mein Konto', 'Support'],
    nav=['Mädchen', 'Anime', 'Jungs'], login='Anmelden', start='Kostenlos starten', start_short='Starten',
    h1='KI-Freundin: <span>Online-Chat mit einer virtuellen Partnerin</span>',
    intro='Starte deinen ersten KI-Chat kostenlos und erlebe echte, aufrichtige Gefühle. Im Gespräch merkt sich deine KI-Freundin den Kontext eurer Dialoge und reagiert entsprechend — ganz wie im echten Leben!',
    dd=['Alle', 'Jeder Stil', 'Beliebt', 'Alle Creator'],
    tags=['Alle', 'Offiziell', 'Reif', 'Zierlich', 'Kurvig', 'Blond', 'Brünett', 'Asiatisch', 'Latina', 'Goth & Alt', 'Romantisch', 'Dominant'], more='Mehr',
    static=['Katalogfilter auf Deutsch', 'Favoriten auf Deutsch'],
    create='Companion-Builder', promo=['Erstelle<br>deine', 'Aussehen, Charakter und Chatstil — ganz nach deinem Geschmack.', 'Erstellen'], end='Du hast alle Companions gesehen', foot='© 2026 Lovix. Alle Rechte vorbehalten.',
    fav='Zu Favoriten', author='Creator', likes='Likes', pb_aria=['Karussell', 'Promo-Banner', 'Vorherige Banner', 'Nächste Banner', 'Banner-Seiten', 'Banner {n} von {m}'],
    menu='Menü', cats='Kategorien',
    names=['Alexandra', 'Olesya', 'Dina', 'Alexandra', 'Emma', 'Lada', 'Dina', 'Maya', 'Yulia', 'Iskra', 'Nika', 'Taisia'],
    descs=[
      "Ich bin Cam-Model und streame Gaming und Cosplay nonstop. Mein Flirt trifft besser als jeder Headshot, aber ich respawne immer mit einem Zwinkern.",
      "Ich bin Yogalehrerin, für die Kraft und Balance nicht nur auf der Matte zählen, sondern auch auf den Trails. Gerade denke ich daran, wie gut Dehnen nach einem langen Aufstieg tut.",
      "Tagsüber rettet sie Leben und hält sich streng an die Regeln. Zu Hause, müde nach der Nachtschicht, legt deine süße Mitbewohnerin die Schüchternheit ab. Sie wird schnell rot, sehnt sich aber heimlich nach deiner Zärtlichkeit.",
      "Ich bin Dessous-Model und lege Tanzrhythmen und Yoga-Flows in jede Pose. Ich liebe dieses elektrische Wiegen im Scheinwerferlicht oder einen tiefen Atemzug in der perfekten Dehnung.",
      "Ich bin professionelle Kennerin von Büchern und langsamem Yoga und habe die Kunst der Erholung zu meiner Lebensaufgabe gemacht. Es braucht viel Disziplin, nur das zu wählen, was Freude bringt.",
      "Ich bin Cam-Model und tausche den Bildschirm gegen die Küche, um Leckereien zu backen, von denen alle schwärmen. Am schönsten ist die stille Freude, wenn der Teig aufgeht und die ganze Welt schon schläft.",
      "Ich bin Musikerin und schreddere rebellische Riffs auf der Gitarre. Mein Gesang schneidet durch die Menge wie ein nächtliches Manifest und macht jedes Konzert zum elektrischen Aufstand.",
      "Ich bin Offizierin der Militärpolizei und habe alles im Griff, ohne dabei je unperfekt auszusehen. Mich reizen Disziplin und diese süße Spannung, die aus Stärke entsteht.",
      "Ich bin Dessous-Model, schleife meine Anmut mit Yoga und entfache sie beim Tanzen. Gerade komme ich von der Matte, genieße diese entspannte Leichtigkeit, die Gedanken schon bei neuen Rhythmen.",
      "Ich bin Pro-Gamerin und verwandle Fails in Siegestänze. Cosplay ist mein Trumpf: Ich nähe Spielhelden, die auf Streams und Conventions glänzen.",
      "Ich bin Literaturlehrerin, den Klassikern verfallen, mit einem Talent, in gewöhnlichen Dingen verborgene Bedeutungen zu finden. Ich lese, bis die Morgendämmerung die Lampe überflüssig macht.",
      "Ich bin Dessous-Model und bringe die Anmut einer Tänzerin in jedes Bild. Hinter den Kulissen nähe ich Cosplay-Kostüme und tauche in Welten ein, die ich selbst erfunden habe.",
    ],
    authors={'nochnoy': 'Nochnoy', 'kseniya_w': 'Kseniya W.', 'studio_nyx': 'Studio Nyx', 'marko_s': 'Marko S.', 'alina.dreams': 'Alina'},
  ),
}
# куда ведут баннеры — как на русской главной (index.html)
LINKS = {
    'calls': 'href="../chat/?bot=0"', 'video': 'href="../chat/?bot=3"', 'scenarios': 'href="../chat/?bot=2"', 'author': 'href="../profile/" data-need-auth',
    'sale': 'href="../purchase/?plan=vip&amp;period=y1"',
    'create': 'href="#" data-todo="Companion builder"', 'group': 'href="#" data-todo="Group chat"', 'anime': 'href="#" data-todo="Anime"',
}
PAGE = 12


def card(i, t):
    name, age, desc, talks, likes, by = BOTS[i]
    video = re.sub(r'\.\w+$', '.mp4', MEDIA[i])
    if t['names']: name, desc = t['names'][i], t['descs'][i]
    au = (t['authors'] or {}).get(by, AUTHORS[by])
    color = f' style="background:{COLORS[by]}"' if by in COLORS else ''
    ver = '<svg class="cc-ver"><use href="#i-verified"/></svg>' if by == 'lovix' else ''
    return f'''
    <article class="cc">
      <img class="cc-photo" src="{A}img/bots/{MEDIA[i]}" alt="{name}" loading="{'eager' if i < 7 else 'lazy'}">
      <video class="cc-video" data-src="{A}video/bots/{video}" muted loop playsinline preload="none" aria-hidden="true"></video>
      <div class="cc-shade"></div>
      <a class="cc-link" href="../chat/?bot={i}" aria-label="{name}, {age}"></a>
      <a class="cc-auth" href="../creator/?u={by}" title="{au} · @{by}" aria-label="{t['author']}: {au}, @{by}">
        <span class="cc-av"{color}>{au[0].upper()}</span>
        <span class="cc-nick">@{by}{ver}</span>
      </a>
      <button class="cc-fav" type="button" aria-pressed="false" aria-label="{t['fav']}" data-todo="{t['static'][1]}">
        <svg class="ic o"><use href="#i-heart-o"/></svg><svg class="ic f"><use href="#i-heart-f"/></svg>
      </button>
      <div class="cc-meta">
        <div class="cc-name"><b>{name},</b><span>{age}</span></div>
        <div class="cc-foot">
          <span class="cc-m"><svg class="cc-ic"><use href="#i-cc-chat"/></svg>{talks}</span>
          <span class="cc-m like" title="{t['likes']}"><svg class="cc-ic"><use href="#i-cc-like"/></svg>{fmt(likes)}</span>
        </div>
      </div>
    </article>'''


def page(lang):
    t = T[lang]; B = banners.TEXT[lang]['cards']; pa = t['pb_aria']
    cards_html = '\n        '.join(banners.card_html(c, B[c['key']], L=lang) for c in banners.CARDS).replace('../assets/', A)
    for intent, href in LINKS.items(): cards_html = cards_html.replace(f'href="#" data-intent="{intent}"', href + f' data-intent="{intent}"')
    pb_script = PB_SCRIPT.replace("'Баннеры ' + (i + 1) + ' из ' + pages()", f"'{pa[5]}'.replace('{{n}}', i + 1).replace('{{m}}', pages())")
    sb = t['sb']; dd_icons = ['i-gender', 'i-star', 'i-flame', 'i-users']
    dds = '\n        '.join(
        f'<div class="dd"><button class="dd-btn" type="button" data-todo="{t["static"][0]}"><svg class="ic"><use href="#{ic}"/></svg><span class="dd-val">{v}</span><svg class="ic chev"><use href="#i-chevr"/></svg></button></div>'
        for ic, v in zip(dd_icons, t['dd']))
    tags = ''.join(f'<a class="tag{" on" if i == 0 else ""}" href="#" data-todo="{t["static"][0]}">{x}</a>' for i, x in enumerate(t['tags'])) + \
        f'<button class="tag more" type="button" data-todo="{t["static"][0]}">{t["more"]}<svg class="ic chev"><use href="#i-chevr"/></svg></button>'
    promo = f'''
    <a class="cc promo promo-create" href="#" data-todo="{t['create']}" data-intent="create">
      <div class="cc-art" aria-hidden="true"><img src="{A}img/promo/create-trio.webp" alt=""></div>
      <div class="cc-meta">
        <div class="cc-text">
          <div class="cc-promo-h">{t['promo'][0]}</div>
          <p class="cc-promo-sub">{t['promo'][1]}</p>
        </div>
        <span class="cc-promo-cta">{t['promo'][2]} <svg class="ic"><use href="#i-plus"/></svg></span>
      </div>
    </a>'''
    cells = [card(i, t) for i in range(PAGE)]
    cells.insert(6, promo)                      # как на главной: «создать» — всегда 7-я карточка
    grid = ''.join(cells)
    return f'''<!DOCTYPE html>
<html lang="{lang}" data-region="{t['region']}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{t['title']}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{A}lovix.css">
<link rel="stylesheet" href="{A}promo-banners.css">
<link rel="stylesheet" href="{A}bot-card.css">
<link rel="stylesheet" href="{A}auth.css">
<link rel="stylesheet" href="{A}shell.css">
{STYLE.replace('../assets/', A)}
<style>
  /* Главная на языке {lang.upper()}: сгенерирована tools/build-locales.py — править там.
     Первый экран главной; формы входа открывают кнопки топбара и ссылки #signup / #login.
     Фильтры и сердечки здесь статичны — по клику уведомление (data-todo), живые — на русской главной. */
  .cat-intro p {{ -webkit-line-clamp: 2; line-clamp: 2; }}
</style>
</head>
<body>

{SPRITE}

<aside class="sb"></aside>

<div class="page">
  <header class="tb"></header>
  <script src="{A}shell.js"></script>

  <main class="content">

    <section class="pb" data-pb role="region" aria-roledescription="{pa[0]}" aria-label="{pa[1]}">
      <div class="pb-track" data-pb-track tabindex="0" aria-live="polite">
        {cards_html}
      </div>
      <button type="button" class="pb-arr prev" data-step="-1" aria-label="{pa[2]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <button type="button" class="pb-arr next" data-step="1" aria-label="{pa[3]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
      <div class="pb-dots" data-pb-dots role="tablist" aria-label="{pa[4]}"></div>
    </section>

    <h1 class="cat-h1">{t['h1']}</h1>
    <div class="cat-intro fits"><p>{t['intro']}</p></div>

    <div class="flt">
      <div class="flt-dd">
        {dds}
      </div>
      <div class="flt-tags" aria-label="{t['cats']}">{tags}</div>
    </div>

    <div class="cat-grid">{grid}
    </div>
    <div class="cat-sentinel"><span class="cat-end">{t['end']}</span></div>

  </main>

  <footer class="site-foot"></footer>
</div>

<script src="{A}auth.js"></script>
<script src="{A}bot-card.js"></script>
<script>initBotCards(document.querySelector('.cat-grid'));</script>
{pb_script}

</body>
</html>
'''


if __name__ == '__main__':
    for lang in ('en', 'de'):                   # русская версия — сама главная (index.html)
        out = ROOT / lang / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page(lang), encoding='utf-8')
        print('wrote', out.relative_to(ROOT))
