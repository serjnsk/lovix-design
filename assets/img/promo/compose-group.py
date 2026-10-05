# Групповой снимок из трёх вырезанных фигур (PNG с альфой, фон удалён rembg) на одном общем фоне —
# для промо-карточек каталога (catalog/v2.html). Квадрат 1080×1080: размытый фон из одного из исходных
# фото, тонировка в цвет карточки, фигуры стоят вместе (центральная впереди, боковые чуть сзади и мельче),
# снизу уход в фон карточки под текст. Запуск: python3 compose-group.py (нужен Pillow).
# Текущие create-trio / sale-trio: фигуры — аватары моделей secrets.ai (Juliana · Steffi · Cecee и
# Li Hua · Mei · Gloria), временные; перед продом заменить на свои рендеры.
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
S = 1080

def figure(path, face_cx, face_cy, face_h, target_face=150):
    """Вырезанная фигура, отмасштабированная так, чтобы высота лица стала target_face.
    Возвращает (изображение RGBA, координата центра лица после масштабирования)."""
    im = Image.open(path).convert('RGBA')
    k = target_face / face_h
    im = im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS)
    return im, (face_cx * k, face_cy * k)

def shadow(fig, blur=18, alpha=.45):
    a = fig.split()[3].filter(ImageFilter.GaussianBlur(blur))
    sh = Image.new('RGBA', fig.size, (0, 0, 0, 0)); sh.putalpha(a.point(lambda v: int(v * alpha)))
    return sh

def compose(bg_photo, figs, tint, out, bg, head_y=275):
    """figs: [(fig, face_xy, canvas_face_x, dy, scale)] — слева, справа, центр (центр кладётся последним)."""
    canvas = Image.open(bg_photo).convert('RGB')
    canvas = canvas.resize((S, int(canvas.height * S / canvas.width)), Image.LANCZOS).crop((0, 0, S, S))
    canvas = ImageEnhance.Brightness(canvas.filter(ImageFilter.GaussianBlur(28))).enhance(.55)
    canvas = Image.blend(canvas, Image.new('RGB', (S, S), tint), .22).convert('RGBA')
    for fig, (fx, fy), cx, dy, k in figs:
        f = fig.resize((int(fig.width * k), int(fig.height * k)), Image.LANCZOS) if k != 1 else fig
        x = int(cx - fx * k); y = int(head_y + dy - fy * k)
        sh = shadow(f); canvas.alpha_composite(sh, (x + 10, y + 16))
        canvas.alpha_composite(f, (x, y))
    canvas = canvas.convert('RGB')
    canvas = Image.blend(canvas, Image.new('RGB', (S, S), tint), .10)
    g = Image.new('L', (S, S), 0); d = ImageDraw.Draw(g)
    for y in range(S): d.line([(0, y), (S, y)], fill=int(255 * max(0, (y - S * .55) / (S * .45)) ** 1.2))
    canvas = Image.composite(Image.new('RGB', (S, S), bg), canvas, g)
    canvas.save(out, 'WEBP', quality=86)

if __name__ == '__main__':
    import sys
    CUT = sys.argv[1] if len(sys.argv) > 1 else 'cut/'   # вырезанные PNG (в репозиторий не кладём)
    AV = sys.argv[2] if len(sys.argv) > 2 else 'src/'    # исходные фото для фона
    j, jf = figure(CUT + 'juliana.png', 614, 270, 175)
    s, sf = figure(CUT + 'steffi.png', 589, 295, 180)
    c, cf = figure(CUT + 'cecee.png', 450, 300, 230)
    compose(AV + 'steffi.webp', [(j, jf, 270, 40, .94), (c, cf, 810, 40, .94), (s, sf, 540, 0, 1)],
            (120, 40, 170), 'create-trio.webp', (42, 17, 64))
    l, lf = figure(CUT + 'lihua.png', 510, 230, 190)
    m, mf = figure(CUT + 'mei.png', 540, 295, 180)
    g, gf = figure(CUT + 'gloria.png', 417, 393, 150)
    compose(AV + 'gloria.webp', [(l, lf, 270, 40, .94), (g, gf, 810, 40, .94), (m, mf, 540, 0, 1)],
            (255, 140, 40), 'sale-trio.webp', (42, 20, 7))
