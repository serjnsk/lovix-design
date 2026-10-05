/* Lovix pricing — пересчёт цен по периодам. Значения — как на проде lovix.ai/ru/purchase
   (сверено 2026-10-05): PREMIUM_PRICE_1M=990, VIP_PRICE_1M=1590,
   PERIOD_DISCOUNT_3M=10%, PERIOD_DISCOUNT_1Y=45%. Сумма за период считается от цены
   без округления (990 × 0,55 × 12 = 6 534), в месяц — округлённая (545).
   Транш токенов одинаков во всех периодах (правило Т10). */

const PRICING = {
  premium: { m1: { pm: 990,  total: 990   }, m3: { pm: 891,  total: 2673  }, y1: { pm: 545, total: 6534  } },
  vip:     { m1: { pm: 1590, total: 1590  }, m3: { pm: 1431, total: 4293  }, y1: { pm: 875, total: 10494 } }
};
const SAVE = {
  premium: { m3: 297, y1: 5346 },
  vip:     { m3: 477, y1: 8586 }
};

/* Мультивалютный прайс: цены НЕ пересчитываются по курсу — у каждой валюты
   свой хардкод с маркетинговыми значениями (цифры предварительные).
   Валюта привязана к способу оплаты: Карта РФ → RUB, Worldwide и Крипта → USD. */
const PRICING_USD = {
  premium: { m1: { pm: 9.99,  total: 9.99  }, m3: { pm: 8.99,  total: 26.99  }, y1: { pm: 5.49, total: 65.93  } },
  vip:     { m1: { pm: 15.99, total: 15.99 }, m3: { pm: 14.39, total: 42.99  }, y1: { pm: 8.79, total: 105.53 } }
};
const SAVE_USD = {
  premium: { m3: 2.98, y1: 53.95 },
  vip:     { m3: 4.98, y1: 86.35 }
};
const fmtUsd = n => '$' + n.toFixed(2);
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
