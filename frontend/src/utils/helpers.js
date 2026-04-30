export const CATS = [
  { id: 'Food & Drinks',        icon: '🍜', color: '#ff6b6b' },
  { id: 'Travel',               icon: '✈️', color: '#4f7cff' },
  { id: 'Health & Wellness',    icon: '💊', color: '#2de8b0' },
  { id: 'Online Subscriptions', icon: '📱', color: '#c77dff' },
  { id: 'Shopping',             icon: '🛍️', color: '#ffb84f' },
  { id: 'Other',                icon: '📦', color: '#7a85a3' },
];

export const getCat = (id) => CATS.find(c => c.id === id) || CATS[CATS.length - 1];

export const fmt = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
export const firstDay    = (m, y) => new Date(y, m - 1, 1).getDay();
export const padDate     = (y, m, d) =>
  `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
