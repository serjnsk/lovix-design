# Склейка трёх портретов в одну картинку для промо-карточек каталога (catalog/v2.html).
# Вход: три вертикальных портрета (лицо в верхней трети). Выход: квадрат 1080×1080,
# три равные колонки без наложений, мягкие швы, фон — размытый центральный портрет, тонировка в цвет
# карточки, снизу уход в фон. Запуск: python3 compose-trio.py (нужен Pillow).
# Текущие create-trio / sale-trio собраны из аватаров моделей secrets.ai
# (Juliana · Steffi · Cecee и Li Hua · Mei · Gloria) — временные, перед продом заменить на свои.
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
S = 1080

def crop(path, cx, cy, sw=480, sh=1440):
    """Кроп sw×sh вокруг лица (cx, cy): лицо по центру по горизонтали, сверху запас ~0.2 высоты."""
    im = Image.open(path).convert('RGB')
    x0 = max(0, min(im.width - sw, cx - sw // 2)); y0 = max(0, min(im.height - sh, cy - int(sh * .2)))
    return im.crop((x0, y0, x0 + sw, y0 + sh))

def feather(im, edge=36):
    m = Image.new('L', im.size, 255); d = ImageDraw.Draw(m)
    for i in range(edge):
        a = int(255 * i / edge)
        d.line([(i, 0), (i, im.height)], fill=a); d.line([(im.width - 1 - i, 0), (im.width - 1 - i, im.height)], fill=a)
    im = im.copy(); im.putalpha(m); return im

def compose(trio, tint, out, bg):
    """Три равные колонки по 360px без наложений: портреты уменьшены (480→360), лица целиком в кадре."""
    cw = S // 3
    canvas = Image.new('RGB', (S, S), bg)
    back = ImageEnhance.Brightness(trio[1].resize((S, S)).filter(ImageFilter.GaussianBlur(40))).enhance(.45)
    canvas.paste(back, (0, 0))
    for i, im in enumerate(trio):
        f = feather(im.resize((cw, S), Image.LANCZOS)); canvas.paste(f, (i * cw, 0), f)
    canvas = Image.blend(canvas, Image.new('RGB', (S, S), tint), .14)
    g = Image.new('L', (S, S), 0); d = ImageDraw.Draw(g)
    for y in range(S): d.line([(0, y), (S, y)], fill=int(255 * max(0, (y - S * .55) / (S * .45)) ** 1.2))
    canvas = Image.composite(Image.new('RGB', (S, S), bg), canvas, g)
    canvas.save(out, 'WEBP', quality=86)

if __name__ == '__main__':
    AV = 'src/'   # папка с исходными портретами (в репозиторий не кладём)
    compose([crop(AV + 'juliana.webp', 614, 270), crop(AV + 'steffi.webp', 589, 295), crop(AV + 'cecee.webp', 450, 295)],
            (120, 40, 170), 'create-trio.webp', (42, 17, 64))
    compose([crop(AV + 'lihua.webp', 510, 230), crop(AV + 'mei.webp', 540, 295), crop(AV + 'gloria.webp', 417, 393)],
            (255, 140, 40), 'sale-trio.webp', (42, 20, 7))
