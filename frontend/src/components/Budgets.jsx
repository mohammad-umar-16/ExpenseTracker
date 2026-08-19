import { useState } from 'react';
import { Target, Plus, X } from 'lucide-react';
import { getCat, fmt, CATS } from '../utils/helpers';
import { MAX_AMOUNT } from '../utils/constants';

export function BudgetProgressCard({ progress, loading, onManage }) {
  if (loading) return <div className="card skeleton" style={{ height: 90 }} />;
  if (!progress.length) {
    return (
      <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div className="chart-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Target size={14} /> Budgets
        </div>
        <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: 10 }}>No budgets set yet.</p>
        <button className="btn-ghost" onClick={onManage} style={{ fontSize: '.78rem' }}>
          <Plus size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} /> Set a budget
        </button>
      </div>
    );
  }
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="chart-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Target size={14} /> Budgets
        </div>
        <button className="btn-ghost" onClick={onManage} style={{ padding: '4px 10px', fontSize: '.72rem' }}>Manage</button>
      </div>
      <div className="cat-list">
        {progress.map(p => {
          const meta = getCat(p.category);
          const over = p.percentage > 100;
          const barColor = over ? 'var(--red)' : p.percentage > 80 ? 'var(--yellow)' : meta.color;
          return (
            <div key={p.category} className="cat-item">
              <div className="cat-row">
                <span className="cat-name">{p.category}</span>
                <span className="cat-amt mono">{fmt(p.spent)} / {fmt(p.limit)}</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${Math.min(p.percentage, 100)}%`, background: barColor }} />
              </div>
              {over && <div style={{ fontSize: '.68rem', color: 'var(--red)', marginTop: 2 }}>Over by {fmt(p.spent - p.limit)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ManageBudgetsModal({ budgets, onSave, onDelete, onClose }) {
  const [category, setCategory] = useState(CATS[0].id);
  const [limit, setLimit]       = useState('');
  const [saving, setSaving]     = useState(false);

  const existingCategories = budgets.map(b => b.category);

  const add = async () => {
    if (!limit || +limit <= 0) return;
    setSaving(true);
    await onSave(category, +limit);
    setLimit('');
    setSaving(false);
  };

  return (
    <div className="settings-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="settings-card scale-in" style={{ maxWidth: 380 }}>
        <div className="settings-title">Manage Budgets</div>

        <div className="field-row">
          <div className="field">
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATS.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Monthly limit (₹)</label>
            <input className="input" type="number" min="1" max={MAX_AMOUNT} value={limit} onChange={e => setLimit(e.target.value)} placeholder="0" />
          </div>
        </div>
        <button className="btn-primary" onClick={add} disabled={saving} style={{ width: '100%' }}>
          {saving ? <span className="spinner" /> : existingCategories.includes(category) ? 'Update Budget' : 'Add Budget'}
        </button>

        {budgets.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
            <div className="label" style={{ marginBottom: 8 }}>Current budgets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {budgets.map(b => (
                <div key={b.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.82rem' }}>
                  <span>{b.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono">{fmt(b.monthly_limit)}</span>
                    <button className="icon-btn del" onClick={() => onDelete(b.category)}><X size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="settings-actions">
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}