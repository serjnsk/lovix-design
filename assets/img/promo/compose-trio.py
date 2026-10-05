# Склейка трёх портретов в одну картинку для промо-карточек каталога (catalog/v2.html).
# Вход: три вертикальных портрета (лицо в верхней трети). Выход: квадрат 1080×1080,
# портреты с мягкими стыками, фон — размытый центральный портрет, тонировка в цвет
# карточки, снизу уход в фон. Запуск: python3 compose-trio.py (нужен Pillow).
# Текущие create-trio / sale-trio собраны из аватаров моделей secrets.ai
# (Juliana · Steffi · Cecee и Lana · Ava · Katrina) — временные, перед продом заменить на свои.
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
S = 1080

def crop(path, cx, cy, fx=300, w=600, h=1080):
    """Вырезать кроп w×h так, чтобы лицо (cx, cy) оказалось на fx от левого края и ~300 от верха."""
    im = Image.open(path).convert('RGB')
    x0 = max(0, min(im.width - w, cx - fx)); y0 = max(0, min(im.height - h, cy - 300))
    return im.crop((x0, y0, x0 + w, y0 + h))

def feather(im, edge=120):
    m = Image.new('L', im.size, 255); d = ImageDraw.Draw(m)
    for i in range(edge):
        a = int(255 * i / edge)
        d.line([(i, 0), (i, im.height)], fill=a); d.line([(im.width - 1 - i, 0), (im.width - 1 - i, im.height)], fill=a)
    im = im.copy(); im.putalpha(m); return im

def compose(trio, tint, out, bg):
    left, center, right = trio
    canvas = Image.new('RGB', (S, S), bg)
    back = ImageEnhance.Brightness(center.resize((S, S)).filter(ImageFilter.GaussianBlur(40))).enhance(.45)
    canvas.paste(back, (0, 0))
    for im, x in ((left, -60), (right, 540), (center, 240)):
        f = feather(im); canvas.paste(f, (x, 0), f)
    canvas = Image.blend(canvas, Image.new('RGB', (S, S), tint), .14)
    g = Image.new('L', (S, S), 0); d = ImageDraw.Draw(g)
    for y in range(S): d.line([(0, y), (S, y)], fill=int(255 * max(0, (y - S * .55) / (S * .45)) ** 1.2))
    canvas = Image.composite(Image.new('RGB', (S, S), bg), canvas, g)
    canvas.save(out, 'WEBP', quality=86)

if __name__ == '__main__':
    AV = 'src/'   # папка с исходными портретами (в репозиторий не кладём)
    compose([crop(AV + 'juliana.webp', 614, 270, fx=200), crop(AV + 'steffi.webp', 589, 295), crop(AV + 'cecee.webp', 393, 295, fx=400)],
            (120, 40, 170), 'create-trio.webp', (42, 17, 64))
    compose([crop(AV + 'lana.webp', 540, 160, fx=200), crop(AV + 'ava.webp', 491, 221), crop(AV + 'katrina.webp', 491, 319, fx=400)],
            (255, 140, 40), 'sale-trio.webp', (42, 20, 7))
