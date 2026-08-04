/* Пакеты токенов — данные и чекаут покупки.
   Номиналы из токеномики (раздел 2, цены предварительные):
   100 — 390 ₽ (базовый), 300 — 1 090 ₽ (−7%, популярный), 700 — 2 490 ₽ (−9%).
   Правило П2: цена токена падает с размером; П3: даже мелкий пакет дороже тарифного токена. */

const PACKS = {
  p100: { tok: 100, price: 390,  per: '3,90 ₽', disc: null,   hot: false },
  p300: { tok: 300, price: 1090, per: '3,63 ₽', disc: '−7%',  hot: true  },
  p700: { tok: 700, price: 2490, per: '3,56 ₽', disc: '−9%',  hot: false },
};
const PAY_NAMES = { ru: 'Карта РФ', world: 'Карта Worldwide', crypto: 'Криптовалюта' };

let ckPack = 'p300';
let ckPay = 'ru';   // в проде: запомненный успешный способ → иначе гео-дефолт

const fmtN = n => n.toLocaleString('ru-RU');

function renderCk() {
  const p = PACKS[ckPack];
  document.getElementById('ck-pack-name').textContent = fmtN(p.tok) + ' токенов';
  document.getElementById('ck-pack').classList.toggle('hot', p.hot);
  document.getElementById('ck-price').textContent = fmtN(p.price) + ' ₽';
  document.getElementById('ck-per').textContent = p.per + ' за токен';
  const saveRow = document.getElementById('ck-save-row');
  if (p.disc) {
    saveRow.style.display = 'flex';
    document.getElementById('ck-save').textContent = 'токены ' + p.disc + ' к базовому';
  } else {
    saveRow.style.display = 'none';
  }
  document.getElementById('ck-go').textContent = 'Перейти к оплате — ' + fmtN(p.price) + ' ₽';
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
