import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSummary } from '../hooks/useData';
import { authSettings, expList } from '../api/api';
import { fmt, MONTHS, CATS } from '../utils/helpers';
import Calendar from '../components/Calendar';
import { PieChartWidget, TrendChart, CategoryList } from '../components/Charts';
import DayPanel from '../components/DayPanel';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function StatsCard({ label, value, cls, onClick }) {
  return (
    <div className={`card stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${cls||''}`}>{value}</span>
    </div>
  );
}

function SettingsModal({ current, onSave, onClose }) {
  const [bal, setBal]   = useState(current.bank_balance || '');
  const [inc, setInc]   = useState(current.monthly_income || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave({ bank_balance: +bal||0, monthly_income: +inc||0 });
    setSaving(false); onClose();
  };

  return (
    <div className="settings-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="settings-card scale-in">
        <div className="settings-title">Update Settings</div>
        <div className="field">
          <label className="label">Bank Balance (₹)</label>
          <input className="input" type="number" max="1000000000000" value={bal} onChange={e=>setBal(e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label className="label">Monthly Income (₹)</label>
          <input className="input" type="number" max="1000000000000" value={inc} onChange={e=>setInc(e.target.value)} placeholder="0" />
        </div>
        <div className="settings-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

async function generateReport({ user, month, year, data, income, balance }) {
  const monthName   = MONTHS[month - 1];
  const total       = data?.total ?? 0;
  const remaining   = income > 0 ? income - total : null;
  const byCategory  = data?.by_category ?? [];
  const dailyTotals = data?.daily_totals ?? [];

  let expenses = [];
  try {
    expenses = await expList({ month, year });
  } catch {
    toast.error('Could not fetch expense details');
  }

  const byDate = {};
  expenses.forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });
  const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));

  const topDay = [...dailyTotals].sort((a, b) => b.total - a.total)[0];
  const topDayStr = topDay
    ? `${new Date(topDay.date + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'short' })} — ${fmt(topDay.total)}`
    : '—';
  const avgDaily = dailyTotals.length > 0 ? Math.round(total / dailyTotals.length) : 0;

  const catRowsHtml = byCategory.map(c => {
    const meta = CATS.find(x => x.id === c.category) || { icon: '📦', color: '#888' };
    const pct  = total > 0 ? ((c.total / total) * 100).toFixed(1) : '0.0';
    const bar  = Math.round((c.total / total) * 100);
    return `<tr>
      <td style="padding:11px 10px;border-bottom:1px solid #f3f4f6"><span style="margin-right:6px">${meta.icon}</span>${c.category}</td>
      <td style="padding:11px 10px;border-bottom:1px solid #f3f4f6"><div style="background:#f0f4ff;border-radius:99px;height:8px;width:140px;overflow:hidden"><div style="width:${bar}%;height:100%;background:${meta.color||'#5b8dee'};border-radius:99px"></div></div></td>
      <td style="padding:11px 10px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700">${fmt(c.total)}</td>
      <td style="padding:11px 10px;border-bottom:1px solid #f3f4f6;text-align:right;color:#888;font-size:.8rem">${pct}%</td>
      <td style="padding:11px 10px;border-bottom:1px solid #f3f4f6;text-align:right">${c.count}</td>
    </tr>`;
  }).join('');

  const dailySectionHtml = sortedDates.map(date => {
    const dayExps  = byDate[date];
    const dayTotal = dayExps.reduce((s, e) => s + e.amount, 0);
    const formatted = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
    const expRowsHtml = dayExps.map(e => {
      const meta = CATS.find(x => x.id === e.category) || { icon: '📦', color: '#888' };
      return `<tr>
        <td style="padding:9px 12px;border-bottom:1px solid #f8f9fb">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${meta.color};margin-right:8px;vertical-align:middle"></span>
          ${e.title}${e.note ? `<span style="color:#aaa;font-size:.78rem"> — ${e.note}</span>` : ''}
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid #f8f9fb">
          <span style="background:#f0f4ff;color:#3b5998;border-radius:99px;padding:2px 10px;font-size:.75rem">${meta.icon} ${e.category}</span>
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid #f8f9fb;text-align:right;font-weight:700">${fmt(e.amount)}</td>
      </tr>`;
    }).join('');
    return `<div style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;background:#f0f4ff;border-radius:10px;padding:10px 16px;margin-bottom:8px">
        <span style="font-weight:700;font-size:.88rem;color:#1e2a4a">${formatted}</span>
        <span style="font-weight:800;font-size:.95rem;color:#ef4444">${fmt(dayTotal)}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:.84rem">
        <thead><tr>
          <th style="text-align:left;padding:7px 12px;color:#aaa;font-size:.72rem;text-transform:uppercase;border-bottom:1px solid #f3f4f6">Expense</th>
          <th style="text-align:left;padding:7px 12px;color:#aaa;font-size:.72rem;text-transform:uppercase;border-bottom:1px solid #f3f4f6">Category</th>
          <th style="text-align:right;padding:7px 12px;color:#aaa;font-size:.72rem;text-transform:uppercase;border-bottom:1px solid #f3f4f6">Amount</th>
        </tr></thead>
        <tbody>${expRowsHtml}</tbody>
      </table>
    </div>`;
  }).join('');

  const remColor = remaining === null ? '#6b7280' : remaining >= 0 ? '#22c55e' : '#ef4444';
  const remVal   = remaining === null ? '—' : (remaining < 0 ? '-' : '') + fmt(Math.abs(remaining));

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <title>Expense Tracker — ${monthName} ${year}</title></head>
  <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4ff;color:#1a1a2e">
  <div style="max-width:860px;margin:0 auto;padding:32px 16px">

    <div style="background:linear-gradient(135deg,#1e2a4a 0%,#2d3f6e 100%);border-radius:20px;padding:36px 40px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;color:#fff">
      <div>
        <div style="font-size:1.4rem;font-weight:800;color:#7eb3ff;margin-bottom:4px">◈ Expense Tracker</div>
        <div style="font-size:2rem;font-weight:800;margin-bottom:4px">${monthName} ${year}</div>
        <div style="font-size:.82rem;color:#8ca5d8">Monthly Expense Report</div>
      </div>
      <div style="text-align:right;font-size:.8rem;color:#8ca5d8;line-height:1.8">
        <div style="font-weight:700;color:#fff">${user?.name || ''}</div>
        <div>Generated on</div>
        <div>${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px">
      <div style="background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <div style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#888;margin-bottom:8px">Total Spent</div>
        <div style="font-size:1.25rem;font-weight:800;color:#ef4444">${fmt(total)}</div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <div style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#888;margin-bottom:8px">Monthly Income</div>
        <div style="font-size:1.25rem;font-weight:800;color:#3b82f6">${income > 0 ? fmt(income) : '—'}</div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <div style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#888;margin-bottom:8px">Remaining</div>
        <div style="font-size:1.25rem;font-weight:800;color:${remColor}">${remVal}</div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <div style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#888;margin-bottom:8px">Avg / Active Day</div>
        <div style="font-size:1.25rem;font-weight:800;color:#f59e0b">${avgDaily > 0 ? fmt(avgDaily) : '—'}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px">
      <div style="background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <div style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#888;margin-bottom:8px">Total Transactions</div>
        <div style="font-size:1.25rem;font-weight:800;color:#3b82f6">${expenses.length}</div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <div style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#888;margin-bottom:8px">Active Days</div>
        <div style="font-size:1.25rem;font-weight:800;color:#f59e0b">${dailyTotals.length}</div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <div style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#888;margin-bottom:8px">Highest Spend Day</div>
        <div style="font-size:1rem;font-weight:800;color:#ef4444">${topDayStr}</div>
      </div>
    </div>

    <div style="background:#fff;border-radius:16px;padding:28px 32px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
      <div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#3b82f6;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #e8f0ff">📊 Spending by Category</div>
      ${byCategory.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;font-size:.86rem">
        <thead><tr>
          <th style="text-align:left;padding:8px 10px;color:#888;font-size:.74rem;text-transform:uppercase">Category</th>
          <th style="text-align:left;padding:8px 10px;color:#888;font-size:.74rem;text-transform:uppercase">Share</th>
          <th style="text-align:right;padding:8px 10px;color:#888;font-size:.74rem;text-transform:uppercase">Amount</th>
          <th style="text-align:right;padding:8px 10px;color:#888;font-size:.74rem;text-transform:uppercase">%</th>
          <th style="text-align:right;padding:8px 10px;color:#888;font-size:.74rem;text-transform:uppercase">Note</th>
        </tr></thead>
        <tbody>${catRowsHtml}</tbody>
      </table>` : '<div style="color:#aaa;text-align:center;padding:24px 0">No expenses recorded.</div>'}
    </div>

    <div style="background:#fff;border-radius:16px;padding:28px 32px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
      <div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#3b82f6;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #e8f0ff">📅 Daily Expense Breakdown</div>
      ${sortedDates.length > 0 ? dailySectionHtml : '<div style="color:#aaa;text-align:center;padding:24px 0">No expenses recorded.</div>'}
    </div>

    <div style="text-align:center;font-size:.75rem;color:#aaa;padding:16px">Expense Tracker · Track every rupee, effortlessly.</div>
  </div></body></html>`;

  toast('Generating PDF…', { icon: '⏳' });

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:1px;border:none;visibility:hidden';
  document.body.appendChild(iframe);

  await new Promise(resolve => {
    iframe.onload = resolve;
    iframe.srcdoc = html;
  });

  await new Promise(r => setTimeout(r, 800));

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  const reportEl  = iframeDoc.body;
  iframe.style.height = reportEl.scrollHeight + 'px';
  await new Promise(r => setTimeout(r, 200));

  try {
    const canvas = await html2canvas(reportEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f0f4ff',
      scrollY: 0,
      windowWidth: 900,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfW    = 210;
    const pdfH    = (canvas.height * pdfW) / canvas.width;
    const pdf     = new jsPDF({ orientation: 'p', unit: 'mm', format: [pdfW, pdfH] });

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    pdf.save(`ExpenseTracker_${monthName}_${year}_Report.pdf`);
    toast.success(`${monthName} ${year} PDF downloaded!`);
  } catch (err) {
    console.error(err);
    toast.error('PDF generation failed');
  } finally {
    document.body.removeChild(iframe);
  }
}

export default function Dashboard() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year,  setYear]  = useState(today.getFullYear());
  const [selDay, setSelDay] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { user, logout, refreshUser } = useAuth();
  const { data, loading, refresh }    = useSummary(month, year);

  const dailyMap = {};
  data?.daily_totals?.forEach(d => { dailyMap[d.date] = d; });

  const total    = data?.total ?? 0;
  const balance  = user?.bank_balance  ?? 0;
  const income   = user?.monthly_income ?? 0;
  const remaining = income > 0 ? income - total : null;

  const saveSettings = async (d) => {
    await authSettings(d);
    await refreshUser();
    refresh();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const handleReport = async () => {
    setGenerating(true);
    await generateReport({ user, month, year, data, income, balance });
    setGenerating(false);
  };

  return (
    <div className="dash-page">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="brand-icon">◈</span>
          <span className="brand-name">Expense Tracker</span>
        </div>
        <div className="topbar-right">
          <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <span className="user-name">{user?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <main className="dash-main">
        {/* Stats */}
        <div className="stats-row">
          <StatsCard label="Total Spent"    value={fmt(total)}  cls="yellow" />
          <StatsCard label="Bank Balance"   value={balance > 0 ? fmt(balance) : '— set —'} onClick={() => setShowSettings(true)} />
          <StatsCard label="Monthly Income" value={income  > 0 ? fmt(income)  : '— set —'} onClick={() => setShowSettings(true)} />
          {remaining !== null && (
            <StatsCard
              label="Remaining"
              value={<>{fmt(Math.abs(remaining))}{remaining < 0 && <span className="over-badge">over</span>}</>}
              cls={remaining >= 0 ? 'green' : 'red'}
            />
          )}
        </div>

        {/* Grid */}
        <div className="dash-grid">
          <div className="left-col">
            {loading
              ? <div className="skeleton" style={{ minHeight:360 }} />
              : <Calendar month={month} year={year} onMonth={setMonth} onYear={setYear} dailyMap={dailyMap} onDay={setSelDay} />
            }
            <TrendChart dailyTotals={data?.daily_totals} />
          </div>
          <div className="right-col">
            <PieChartWidget data={data?.by_category} />
            <CategoryList   categories={data?.by_category} />
          </div>
        </div>
      </main>

      {selDay && <DayPanel dateStr={selDay} onClose={() => setSelDay(null)} onRefresh={refresh} />}
      {showSettings && (
        <SettingsModal
          current={{ bank_balance: balance, monthly_income: income }}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <button className="report-fab" onClick={handleReport} disabled={generating} title="Download Monthly Report">
        <span className="report-fab-icon">{generating ? '⏳' : '📊'}</span>
        <span className="report-fab-label">{generating ? 'Generating…' : 'Monthly Report'}</span>
      </button>
    </div>
  );
}