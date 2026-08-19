import { useState } from 'react';
import { Search, X, Trash2 } from 'lucide-react';
import { useSearch } from '../hooks/useData';
import { getCat, fmt, CATS } from '../utils/helpers';
import { MAX_AMOUNT } from '../utils/constants';
import { expDelete } from '../api/api';
import toast from 'react-hot-toast';

export default function SearchPanel({ onClose }) {
  const [q, setQ]         = useState('');
  const [category, setCategory] = useState('');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { results, loading, hasSearched, search } = useSearch();

  const runSearch = (e) => {
    e?.preventDefault();
    const filters = {};
    if (q.trim()) filters.search = q.trim();
    if (category) filters.category = category;
    if (minAmt) filters.min_amount = +minAmt;
    if (maxAmt) filters.max_amount = +maxAmt;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    search(filters);
  };

  const doDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await expDelete(id); toast.success('Deleted'); runSearch(); }
    catch { toast.error('Failed to delete'); }
  };

  const total = results.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="overlay">
      <div className="panel scale-in" style={{ maxWidth: 560 }}>
        <div className="panel-head">
          <div className="panel-head-left">
            <Search size={18} style={{ marginTop: 3 }} />
            <div>
              <div className="panel-date">Search Expenses</div>
              {hasSearched && (
                <div className="panel-meta">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                  {results.length > 0 && <span className="panel-total">{fmt(total)}</span>}
                </div>
              )}
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="panel-body">
          <form onSubmit={runSearch} className="exp-form" style={{ marginBottom: 18 }}>
            <div className="field">
              <label className="label">Search title or note</label>
              <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. coffee, uber…" autoFocus />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Category</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">All categories</option>
                  {CATS.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </div>
              <div className="field" />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Min amount (₹)</label>
                <input className="input" type="number" min="0" max={MAX_AMOUNT} value={minAmt} onChange={e => setMinAmt(e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label className="label">Max amount (₹)</label>
                <input className="input" type="number" min="0" max={MAX_AMOUNT} value={maxAmt} onChange={e => setMaxAmt(e.target.value)} placeholder="Any" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">From date</label>
                <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">To date</label>
                <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner" /> : 'Search'}
            </button>
          </form>

          {hasSearched && !loading && (
            results.length === 0 ? (
              <div className="panel-empty">
                <Search size={26} className="panel-empty-icon" />
                <p>No expenses match those filters</p>
              </div>
            ) : (
              <div className="exp-list fade-in">
                {results.map(exp => {
                  const meta = getCat(exp.category);
                  const Icon = meta.icon;
                  return (
                    <div key={exp.id} className="exp-row">
                      <div className="exp-dot2" style={{ background: meta.color }} />
                      <div className="exp-info">
                        <div className="exp-title">{exp.title}</div>
                        <div className="exp-cat"><Icon size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />{exp.category} · {exp.date}</div>
                        {exp.note && <div className="exp-note">{exp.note}</div>}
                      </div>
                      <span className="exp-amount mono">{fmt(exp.amount)}</span>
                      <div className="exp-actions">
                        <button className="icon-btn del" onClick={() => doDelete(exp.id)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}