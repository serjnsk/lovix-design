/* Демо-данные центра уведомлений — реальные сценарии колокольчика
   из документа «Сценарии взаимодействия» (состояние: Premium-пользователь).
   Т — транзакционные (неотключаемы), М — маркетинговые (отключаемы категориями, Д7). */

const NOTIFS = [
  { id: 1, type: 'tokens', kind: 'М', cat: 'sale', scenario: 'У2-7',
    title: 'Токены на исходе',
    text: 'Осталось 36 из 300 токенов месячного транша.',
    time: '5 минут назад', unread: true, cta: 'Пополнить токены' },
  { id: 2, type: 'limit', kind: 'М', cat: 'sale', scenario: 'У2-3',
    title: 'Дневной лимит сообщений исчерпан',
    text: '500 сообщений за день — вы в ударе! На VIP сообщения безлимитны.',
    time: '2 часа назад', unread: true, cta: 'Перейти на VIP' },
  { id: 3, type: 'expire', kind: 'М', cat: 'sale', scenario: 'У2-8',
    title: 'Остаток сгорит через 3 дня',
    text: '120 тарифных токенов сгорят 7 августа. Купленные пакеты не сгорают.',
    time: 'вчера', unread: true, cta: null },
  { id: 4, type: 'fail', kind: 'Т', cat: 'trans', scenario: 'У3-7',
    title: 'Сбой генерации фото',
    text: 'Фото не получилось — 12 токенов уже вернулись на баланс.',
    time: 'вчера', unread: false, cta: 'Попробовать снова' },
  { id: 5, type: 'pay', kind: 'Т', cat: 'trans', scenario: 'У3-2',
    title: 'Платёж не прошёл',
    text: 'Карта •• 4212 отклонила списание. Подписка не затронута — попробуйте другой способ.',
    time: '3 дня назад', unread: false, cta: 'Повторить оплату' },
  { id: 6, type: 'hello', kind: 'Т', cat: 'trans', scenario: 'У3-4',
    title: 'Добро пожаловать в Premium',
    text: 'Подписка активна: 300 токенов начислены, 500 сообщений в день.',
    time: '27 июля', unread: false, cta: null },
  { id: 7, type: 'news', kind: 'М', cat: 'engage', scenario: 'промо',
    title: 'Большое Летнее Обновление уже здесь!',
    text: 'Новые компаньоны, улучшенная генерация фото и скидки до 75%.',
    time: '27 июля', unread: false, cta: null },
];

/* Проактивы компаньонов (канал «чат компаньона», У1-4 / У2-2 / У7-1) —
   создают непрочитанное в чате, лимиты пользователя не расходуют. */
const PROACTIVE = [
  { name: 'Алиса', img: '../assets/img/model-1.webp',
    text: 'Я соскучилась… Придёшь поболтать? 💕', time: '12 минут назад', unread: true },
  { name: 'Майя', img: '../assets/img/model-2.webp',
    text: 'Придумала для нас кое-что интересное 😏', time: 'вчера', unread: true },
];

/* Иконка и цветовой класс по типу события */
const NICON  = { tokens: 'i-gem',  expire: 'i-gem',  limit: 'i-chat', fail: 'i-alert', pay: 'i-card', hello: 'i-heart-o', news: 'i-mega' };
const NCLASS = { tokens: 'nc-tok', expire: 'nc-tok', limit: 'nc-lim', fail: 'nc-fail', pay: 'nc-pay', hello: 'nc-hello',  news: 'nc-news' };

function notifsUnread() { return NOTIFS.filter(n => n.unread).length; }
function proactiveUnread() { return PROACTIVE.filter(p => p.unread).length; }
