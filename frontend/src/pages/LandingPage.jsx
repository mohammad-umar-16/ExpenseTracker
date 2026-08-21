import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, Target, Lightbulb, ArrowRight, TrendingUp } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const FEATURES = [
  {
    n: '01',
    icon: Sparkles,
    title: 'Quick Add',
    desc: 'Type "420 on swiggy dinner" — a free keyword matcher handles the common cases instantly, with AI as a fallback for anything unusual.',
  },
  {
    n: '02',
    icon: Camera,
    title: 'Receipt Scanning',
    desc: 'Photograph a receipt and let multimodal AI extract the merchant, total, and category automatically.',
  },
  {
    n: '03',
    icon: Target,
    title: 'Budgets & Tracking',
    desc: 'Set monthly limits per category and watch your progress, with visual warnings before you go over.',
  },
  {
    n: '04',
    icon: Lightbulb,
    title: 'AI Insights',
    desc: 'Short, factual monthly observations about your spending — with a dependable rule-based fallback if AI is unavailable.',
  },
];



function PreviewCard() {
  return (
    <div className="card fade-in" style={{ maxWidth: 380, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <span className="label">This Month</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '.7rem', color: 'var(--dim)' }}>August 2026</span>
      </div>
      <div style={{ marginBottom: 20 }}>
        <span className="stat-label" style={{ display: 'block', marginBottom: 4 }}>Total Spent</span>
        <span className="stat-value yellow" style={{ fontSize: '1.6rem' }}>₹18,420</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Food & Drinks', pct: 62, color: 'var(--accent)' },
          { label: 'Travel', pct: 41, color: 'var(--ink-blue)' },
          { label: 'Shopping', pct: 28, color: 'var(--yellow)' },
        ].map(row => (
          <div key={row.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--muted)', marginBottom: 3 }}>
              <span>{row.label}</span>
            </div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${row.pct}%`, background: row.color }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Lightbulb size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>You spent 12% less than last month.</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="dash-page">
      <header className="topbar">
        <div className="topbar-left">
          <span className="brand-name">Expense Tracker</span>
        </div>
        <div className="topbar-right">
          <ThemeToggle />
          <button className="btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/register')}>Register</button>
        </div>
      </header>

      <main className="dash-main" style={{ maxWidth: 1140 }}>

        {/* Hero — two column: pitch + live preview mockup */}
        <section
          className="fade-in"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 48,
            alignItems: 'center',
            padding: '56px 0 40px',
          }}
        >
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--surf3)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '5px 12px', marginBottom: 20,
            }}>
              <TrendingUp size={12} style={{ color: 'var(--accent)' }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '.68rem', color: 'var(--muted)', letterSpacing: '.03em' }}>
                AI-POWERED EXPENSE TRACKING
              </span>
            </div>

            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.6rem', fontWeight: 600, marginBottom: 16, lineHeight: 1.12 }}>
              Track every rupee,<br />effortlessly.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: 440, marginBottom: 28 }}>
              Type or photograph an expense and get instant categorization, budget tracking,
              and monthly spending insights — no manual entry required.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                style={{ padding: '12px 26px', fontSize: '.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={() => navigate('/register')}
              >
                Get Started Free <ArrowRight size={16} />
              </button>
              <button
                className="btn-ghost"
                style={{ padding: '12px 22px', fontSize: '.9rem' }}
                onClick={() => navigate('/login')}
              >
                I already have an account
              </button>
            </div>
          </div>

          <PreviewCard />
        </section>

        {/* Features — numbered, spine-accented cards */}
        <section style={{ padding: '32px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="label">What it does</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Icon size={20} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '.7rem', color: 'var(--dim)' }}>{f.n}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '.83rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section style={{ textAlign: 'center', padding: '48px 0 24px' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 600, marginBottom: 16 }}>
            Ready to take control of your spending?
          </h2>
          <button className="btn-primary" style={{ padding: '12px 26px', fontSize: '.9rem' }} onClick={() => navigate('/register')}>
            Create your free account
          </button>
        </section>
      </main>
    </div>
  );
}