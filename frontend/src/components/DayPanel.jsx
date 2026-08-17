import { useState } from 'react';
import { useDayExpenses } from '../hooks/useData';
import { getCat, fmt, MONTHS } from '../utils/helpers';
import { CATS } from '../utils/helpers';
import { MAX_AMOUNT, MAX_TITLE_LEN } from '../utils/constants';
import { expParse } from '../api/api';
import toast from 'react-hot-toast';

function QuickAdd({ onParsed }) {
  const [text, setText] = useState('');
  const [busy, setBusy]  = useState(false);

  const run = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const parsed = await expParse(text.trim());
      onParsed(parsed);
      setText('');
      if (parsed.source === 'keyword') toast.success('Parsed instantly');
      else if (parsed.source === 'ai') toast.success('Parsed with AI');
      else toast('Fill in the rest manually', { icon: '✏️' });
    } catch {
      toast.error('Could not parse — try the form below');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="quick-add" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
      <input
        className="input"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); run(); } }}
        placeholder='Try "420 on swiggy dinner"'
        maxLength={200}
      />
      <button type="button" className="btn-primary" disabled={busy} onClick={run} style={{ padding: '7px 14px', fontSize: '.8rem', whiteSpace: 'nowrap' }}>
        {busy ? <span className="spinner" /> : 'Quick Add'}
      </button>
    </div>
  );
}

function ExpenseForm({ initial, onSubmit, onCancel, loading }) {
  const [f, setF] = useState(
    initial ? { title:initial.title, amount:initial.amount, category:initial.category, note:initial.note||'' }
            : { title:'', amount:'', category:'Food & Drinks', note:'' }
  );
  const set = (k) => (e) => setF(p => ({ ...p, [k]: e.target.value }));
  const handleAmount=(e)=>{
      const val= e.target.value;
      if (val !==''&& parseFloat(val)>MAX_AMOUNT){toast.error('Amount exceeds the maximum allowed',{
       id: "limit-error"
       });
        return;
      }
      setF(p=>({...p,amount:val}));
  };
   const handleSubmit = (e) => {
      e.preventDefault();
      if (f.title.trim().length > MAX_TITLE_LEN) { toast.error(`Expense name cannot exceed ${MAX_TITLE_LEN} characters`); return; }
      if (parseFloat(f.amount) > MAX_AMOUNT) { toast.error('Amount exceeds the maximum allowed'); return; }
      if (f.note.length > 50) { toast.error('Note cannot exceed 50 characters'); return; }
      onSubmit({ ...f, amount: +f.amount });
    };

  const applyPrefill = (p) => setF({ title: p.title, amount: p.amount, category: p.category, note: p.note || '' });

  return (
    <form className="exp-form" onSubmit={handleSubmit}>
      <QuickAdd onParsed={applyPrefill} />
      <div className="field">
        <label className="label">Title
          <span style={{fontWeight:400,fontSize:'.75rem',color:'var(--dim)',marginLeft:6}}>
            {f.title.length}/{MAX_TITLE_LEN}
          </span>
        </label>
        <input className="input" value={f.title} onChange={set('title')} placeholder="e.g. Dinner" required autoFocus
          maxLength={MAX_TITLE_LEN} />
      </div>
      <div className="field-row">
        <div className="field">
          <label className="label">Amount (₹)</label>
          <input
            className="input"
            type="number"
            min="1"
            step="1"
            max={MAX_AMOUNT}
            value={f.amount}
            onChange={handleAmount}
            placeholder="0"
            required
          />
        </div>
        <div className="field">
          <label className="label">Category</label>
          <select className="input" value={f.category} onChange={set('category')}>
            {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label">Note <span style={{fontWeight:400,textTransform:'none',letterSpacing:0}}>(optional)</span>
          <span style={{fontWeight:400,fontSize:'.75rem',color: f.note.length > 50 ? 'var(--red)' : 'var(--dim)',marginLeft:6}}>
            {f.note.length}/50
          </span>
        </label>
        <textarea className="input" rows={2} value={f.note}
          onChange={e => {
            if (e.target.value.length > 50) { toast.error('Note cannot exceed 50 characters'); return; }
            set('note')(e);
          }}
          placeholder="Add a note…" maxLength={50}/>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : initial ? 'Update' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}

export default function DayPanel({ dateStr, onClose, onRefresh }) {
  const [mode, setMode]       = useState('list');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const { list, loading, add, update, remove } = useDayExpenses(dateStr);

  const [y, m, d] = dateStr.split('-').map(Number);
  const label = `${d} ${MONTHS[m-1]} ${y}`;
  const total = list.reduce((s, e) => s + e.amount, 0);

  const doAdd = async (data) => { setSaving(true); const ok = await add(data); setSaving(false); if (ok) { setMode('list'); onRefresh(); } };
  const doUpdate = async (data) => { setSaving(true); const ok = await update(editing.id, data); setSaving(false); if (ok) { setMode('list'); setEditing(null); onRefresh(); } };
  const doDelete = async (id) => { if (!confirm('Delete this expense?')) return; await remove(id); onRefresh(); };

  return (
    <div className="overlay" >
      <div className="panel scale-in">
        <div className="panel-head">
          <div className="panel-head-left">
            <button className="btn-ghost" style={{padding:'5px 10px',fontSize:'.78rem'}} onClick={onClose}>‹ Back</button>
            <div>
              <div className="panel-date">{label}</div>
              {list.length > 0 && (
                <div className="panel-meta">
                  Total: <span className="panel-total">{fmt(total)}</span>
                  <span className="count-badge">{list.length} item{list.length>1?'s':''}</span>
                </div>
              )}
            </div>
          </div>
          {mode === 'list' && (
            <button className="btn-primary" style={{padding:'7px 14px',fontSize:'.8rem'}} onClick={() => setMode('add')}>
              + Add
            </button>
          )}
        </div>

        <div className="panel-body">
          {mode === 'add' && (
            <div className="form-section">
              <div className="form-section-title">New Expense</div>
              <ExpenseForm onSubmit={doAdd} onCancel={() => setMode('list')} loading={saving} />
            </div>
          )}
          {mode === 'edit' && editing && (
            <div className="form-section">
              <div className="form-section-title">Edit Expense</div>
              <ExpenseForm initial={editing} onSubmit={doUpdate} onCancel={() => { setMode('list'); setEditing(null); }} loading={saving} />
            </div>
          )}
          {mode === 'list' && (
            loading
              ? [1,2].map(i => <div key={i} className="skeleton" style={{height:60,marginBottom:8}} />)
              : list.length === 0
              ? (
                <div className="panel-empty">
                  <div className="panel-empty-icon">💸</div>
                  <p>No expenses recorded</p>
                  <button className="add-first-btn" onClick={() => setMode('add')}>Add your first expense</button>
                </div>
              ) : (
                <div className="exp-list fade-in">
                  {list.map(exp => {
                    const meta = getCat(exp.category);
                    return (
                      <div key={exp.id} className="exp-row">
                        <div className="exp-dot2" style={{ background: meta.color }} />
                        <div className="exp-info">
                          <div className="exp-title">{exp.title}</div>
                          <div className="exp-cat">{meta.icon} {exp.category}</div>
                          {exp.note && <div className="exp-note">{exp.note}</div>}
                        </div>
                        <span className="exp-amount mono">{fmt(exp.amount)}</span>
                        <div className="exp-actions">
                          <button className="icon-btn edit" onClick={() => { setEditing(exp); setMode('edit'); }}>✏️</button>
                          <button className="icon-btn del"  onClick={() => doDelete(exp.id)}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="total-row">
                    <span className="total-row-label">Total</span>
                    <span className="total-row-val">{fmt(total)}</span>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}