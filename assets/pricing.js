/* Lovix pricing — пересчёт цен по периодам.
   Данные из токеномики: PREMIUM_PRICE_1M=990, VIP_PRICE_1M=1590,
   PERIOD_DISCOUNT_3M=10%, PERIOD_DISCOUNT_1Y=20%.
   Транш токенов одинаков во всех периодах (правило Т10). */

const PRICING = {
  premium: { m1: { pm: 990,  total: 990   }, m3: { pm: 890,  total: 2670  }, y1: { pm: 790,  total: 9490  } },
  vip:     { m1: { pm: 1590, total: 1590  }, m3: { pm: 1430, total: 4290  }, y1: { pm: 1272, total: 15260 } }
};
const SAVE = {
  premium: { m3: 300, y1: 2390 },
  vip:     { m3: 480, y1: 3820 }
};
const PERIOD_WORD = { m3: 'за 3 месяца', y1: 'за год' };

const fmt = n => n.toLocaleString('ru-RU');

function setPeriod(p) {
  document.querySelectorAll('[data-period]').forEach(b => {
    const on = b.dataset.period === p;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
  document.querySelectorAll('[data-pm]').forEach(el => {
    el.textContent = fmt(PRICING[el.dataset.pm][p].pm);
  });
  document.querySelectorAll('[data-total]').forEach(el => {
    const plan = el.dataset.total;
    if (p === 'm1') {
      el.innerHTML = 'оплата раз в месяц';
    } else {
      el.innerHTML = fmt(PRICING[plan][p].total) + ' ₽ ' + PERIOD_WORD[p] +
        ' · <b>экономия ' + fmt(SAVE[plan][p]) + ' ₽</b>';
    }
  });
  document.querySelectorAll('[data-fixed-note]').forEach(el => {
    el.style.visibility = p === 'm1' ? 'hidden' : 'visible';
  });
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-period]');
  if (b) setPeriod(b.dataset.period);
});

document.addEventListener('DOMContentLoaded', () => setPeriod('m1'));
