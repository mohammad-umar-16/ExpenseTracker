import { Utensils, Plane, HeartPulse, Smartphone, ShoppingBag, Package } from 'lucide-react';

export const CATS = [
  { id: 'Food & Drinks',        icon: Utensils,   color: '#7A2E2E' },
  { id: 'Travel',               icon: Plane,      color: '#2B4570' },
  { id: 'Health & Wellness',    icon: HeartPulse, color: '#3F6C51' },
  { id: 'Online Subscriptions', icon: Smartphone, color: '#5B4636' },
  { id: 'Shopping',             icon: ShoppingBag, color: '#9C6B30' },
  { id: 'Other',                icon: Package,    color: '#6B6459' },
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