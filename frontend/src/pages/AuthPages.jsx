import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authRegister, authLogin, authOnboard } from '../api/api';
import { MAX_AMOUNT } from '../utils/constants';
import { Landmark, Wallet, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';



function Field({ label, children }) {
  return (
    <div className="field">
      {label && <label className="label">{label}</label>}
      {children}
    </div>
  );
}

export function AuthPage() {
  const [tab, setTab]   = useState('login');
  const [busy, setBusy] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const [lf, setLf] = useState({ email: '', password: '' });
  const doLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await authLogin(lf);
      loginSuccess(data);
      navigate(data.is_onboarded ? '/dashboard' : '/onboarding');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const [rf, setRf] = useState({ name: '', email: '', password: '', confirm: '' });
  const doRegister = async (e) => {
    e.preventDefault();
    if (rf.password !== rf.confirm) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    try {
      const data = await authRegister({ name: rf.name, email: rf.email, password: rf.password });
      loginSuccess(data);
      toast.success('Account created — welcome');
      navigate('/onboarding');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div style={{ position: 'absolute', top: 20, right: 20 }}><ThemeToggle /></div>
      <div className="auth-card scale-in">
        <div className="brand">
          <span className="brand-name">Expense Tracker</span>
        </div>
        <p className="tagline">Track every rupee, effortlessly.</p>

        <div className="tabs">
          <button className={`tab ${tab === 'login'    ? 'active' : ''}`} onClick={() => setTab('login')}>Login</button>
          <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
        </div>
        {tab === 'login' && (
          <form className="form" onSubmit={doLogin}>
            <Field label="Email">
              <input className="input" type="email" placeholder="you@example.com"
                value={lf.email} onChange={e => setLf(p => ({ ...p, email: e.target.value }))}
                required autoFocus maxLength={40}/>
            </Field>
            <Field label="Password">
              <input className="input" type="password" placeholder="••••••••"
                value={lf.password} onChange={e => setLf(p => ({ ...p, password: e.target.value }))}
                required maxLength={40}/>
            </Field>
            <button type="submit" className="btn-primary submit-btn" disabled={busy}>
              {busy ? <span className="spinner"/> : 'Sign In'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form className="form" onSubmit={doRegister}>
            <Field label="Full Name">
              <input className="input" type="text" placeholder="Your Name"
                value={rf.name} onChange={e => setRf(p => ({ ...p, name: e.target.value }))}
                required minLength={2} autoFocus maxLength={40}/>
            </Field>
            <Field label="Email">
              <input className="input" type="email" placeholder="you@example.com"
                value={rf.email} onChange={e => setRf(p => ({ ...p, email: e.target.value }))}
                required maxLength={40}/>
            </Field>
            <div className="field-row">
              <Field label="Password">
                <input className="input" type="password" placeholder="Min 8 chars"
                  value={rf.password} onChange={e => setRf(p => ({ ...p, password: e.target.value }))}
                  required minLength={8} maxLength={20}/>
              </Field>
              <Field label="Confirm">
                <input className="input" type="password" placeholder="Repeat"
                  value={rf.confirm} onChange={e => setRf(p => ({ ...p, confirm: e.target.value }))}
                  required />
              </Field>
            </div>
            <button type="submit" className="btn-primary submit-btn" disabled={busy}>
              {busy ? <span className="spinner"/> : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const STEPS = [
  { key: 'bank_balance',   Icon: Landmark, title: "What's your current bank balance?",  sub: 'Helps track how much you have after expenses.' },
  { key: 'monthly_income', Icon: Wallet,   title: "What's your monthly income?",         sub: 'Used to calculate your monthly remaining budget.' },
];

export function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ bank_balance: '', monthly_income: '' });
  const [busy, setBusy] = useState(false);
  const cur = STEPS[step];

  const next = () => {
    if (!vals[cur.key]) { toast.error('Please enter a value'); return; }
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    submit();
  };

  const submit = async (skip = false) => {
    setBusy(true);
    try {
      await authOnboard({ bank_balance: +vals.bank_balance || 0, monthly_income: +vals.monthly_income || 0 });
      await refreshUser();
      if (!skip) toast.success('All set — welcome');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card onboard-card scale-in" style={{ textAlign: 'center' }}>
        <div className="brand" style={{ justifyContent: 'center' }}>
          <span className="brand-name">Expense Tracker</span>
        </div>
        <div className="greeting">Welcome, {user?.name?.split(' ')[0]}</div>
        <div className="intro">Just 2 quick questions to get started.</div>

        <div className="dots" style={{ justifyContent: 'center' }}>
          {STEPS.map((_, i) => (
            <div key={i} className={`dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
          ))}
        </div>

        <div className="step-card">
          <cur.Icon size={26} className="step-icon" strokeWidth={1.6} />
          <div className="step-title">{cur.title}</div>
          <div className="step-sub">{cur.sub}</div>
          <div className="rupee-input">
            <span className="rupee-sign">₹</span>
            <input
              type="number"
              min="0"
              max={MAX_AMOUNT}
              placeholder="0"
              value={vals[cur.key]}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") { setVals(p => ({ ...p, [cur.key]: "" })); return; }
                const num = Number(value);
                if (num < 0) { toast.error("Value cannot be negative"); return; }
                if (num > MAX_AMOUNT) { toast.error("Amount exceeds the maximum allowed", { id: "limit-error" }); return; }
                setVals(p => ({ ...p, [cur.key]: value }));
              }}
              onKeyDown={(e) => e.key === "Enter" && next()}
              autoFocus
            />
          </div>
          <div className="hint-text">You can always update this in settings.</div>
        </div>

        <div className="onboard-actions">
          {step > 0 && <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>}
          <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={next} disabled={busy}>
            {busy ? <span className="spinner"/> : step < STEPS.length - 1 ? <>Next <ArrowRight size={15} /></> : 'Get Started'}
          </button>
        </div>
        <button className="skip-btn" onClick={() => submit(true)} disabled={busy}>Skip for now</button>
      </div>
    </div>
  );
}