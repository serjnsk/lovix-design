/* Пакеты токенов — данные и чекаут покупки.
   Номиналы из токеномики (раздел 2, цены предварительные):
   100 — 390 ₽ (базовый), 300 — 1 090 ₽ (−7%, популярный), 700 — 2 490 ₽ (−9%).
   Правило П2: цена токена падает с размером; П3: даже мелкий пакет дороже тарифного токена. */

const PACKS = {
  p100: { tok: 100, price: 390,  priceUsd: 4.99,  hot: false },
  p300: { tok: 300, price: 1090, priceUsd: 13.99, hot: true  },
  p700: { tok: 700, price: 2490, priceUsd: 29.99, hot: false },
};
const PAY_NAMES = { ru: 'Карта РФ', world: 'Карта Worldwide', crypto: 'Криптовалюта' };
/* Валюта привязана к способу оплаты; при смене способа подставляется
   хардкод-прайс этой валюты (не курсовой пересчёт). */
const PAY_CUR = { ru: 'rub', world: 'usd', crypto: 'usd' };

let ckPack = 'p300';
let ckPay = 'ru';   // в проде: запомненный успешный способ → иначе гео-дефолт

const fmtN = n => n.toLocaleString('ru-RU');
const fmtD = n => '$' + n.toFixed(2);

function renderCk() {
  const p = PACKS[ckPack];
  const money = PAY_CUR[ckPay] === 'rub' ? fmtN(p.price) + ' ₽' : fmtD(p.priceUsd);
  document.getElementById('ck-pack-name').textContent = fmtN(p.tok) + ' токенов';
  document.getElementById('ck-pack').classList.toggle('hot', p.hot);
  document.getElementById('ck-price').textContent = money;
  document.getElementById('ck-go').textContent = 'Перейти к оплате — ' + money;
  document.querySelectorAll('[data-ckpay]').forEach(o => o.classList.toggle('on', o.dataset.ckpay === ckPay));
}

function openCk(pack) {
  ckPack = pack;
  renderCk();
  document.getElementById('ck').classList.add('open');
}
function closeCk() { document.getElementById('ck').classList.remove('open'); }

let toastTimer;
function toast(html) {
  const t = document.getElementById('toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

document.addEventListener('click', e => {
  const buy = e.target.closest('.js-buy');
  if (buy) { openCk(buy.dataset.pack); return; }
  const opt = e.target.closest('[data-ckpay]');
  if (opt) { ckPay = opt.dataset.ckpay; renderCk(); return; }
  if (e.target.closest('#ck-go')) {
    closeCk();
    toast('Переход к оплате: <b>' + fmtN(PACKS[ckPack].tok) + ' токенов</b> · <b>' + PAY_NAMES[ckPay] + '</b>');
    return;
  }
  const back = document.getElementById('ck');
  if (e.target.closest('#ck-x') || e.target === back) closeCk();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCk(); });
