/* Слайдер фото персонажей в панели девушки (.muse / .muse-card).
   Автопрокрутка 5с, пауза при наведении, стрелки, точки, синхронизация имени. */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-muse]').forEach(box => {
    const imgs = [...box.querySelectorAll('.slides img')];
    if (imgs.length < 2) return;
    const dots = [...box.querySelectorAll('.dot')];
    const nameEl = box.querySelector('[data-muse-name]');
    let cur = Math.max(0, imgs.findIndex(i => i.classList.contains('on')));
    let timer;

    const go = i => {
      cur = (i + imgs.length) % imgs.length;
      imgs.forEach((im, k) => im.classList.toggle('on', k === cur));
      dots.forEach((d, k) => d.classList.toggle('on', k === cur));
      if (nameEl && imgs[cur].dataset.name) nameEl.textContent = imgs[cur].dataset.name;
      restart();
    };
    const restart = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), 5000); };

    box.querySelector('.sl-prev')?.addEventListener('click', () => go(cur - 1));
    box.querySelector('.sl-next')?.addEventListener('click', () => go(cur + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    box.addEventListener('mouseenter', () => clearInterval(timer));
    box.addEventListener('mouseleave', restart);
    restart();
  });
});
