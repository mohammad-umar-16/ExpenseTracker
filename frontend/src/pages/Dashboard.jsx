import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSummary } from '../hooks/useData';
import { authSettings } from '../api/api';
import { fmt } from '../utils/helpers';
import { MAX_AMOUNT } from '../utils/constants';
import Calendar from '../components/Calendar';
import { PieChartWidget, TrendChart, CategoryList } from '../components/Charts';
import DayPanel from '../components/DayPanel';
import { generateReport } from '../services/reportGenerator';

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
          <input className="input" type="number" max={MAX_AMOUNT} value={bal} onChange={e=>setBal(e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label className="label">Monthly Income (₹)</label>
          <input className="input" type="number" max={MAX_AMOUNT} value={inc} onChange={e=>setInc(e.target.value)} placeholder="0" />
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

export default function Dashboard() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year,  setYear]  = useState(today.getFullYear());
  const [selDay, setSelDay] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { data, loading, refresh } = useSummary(month, year);

  const dailyMap = {};
  data?.daily_totals?.forEach(d => { dailyMap[d.date] = d; });

  const total     = data?.total ?? 0;
  const balance   = user?.bank_balance  ?? 0;
  const income    = user?.monthly_income ?? 0;
  const remaining = income > 0 ? income - total : null;

  const saveSettings = async (d) => {
    await authSettings(d);
    await refreshUser();
    refresh();
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleReport = async () => {
    setGenerating(true);
    await generateReport({ user, month, year, data, income });
    setGenerating(false);
  };

  return (
    <div className="dash-page">
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