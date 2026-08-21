import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, Target, Lightbulb, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Quick Add',
    desc: 'Type "420 on swiggy dinner" and let AI parse the category, amount, and note for you — instantly, with a free keyword matcher first and AI as fallback.',
  },
  {
    icon: Camera,
    title: 'Receipt Scanning',
    desc: 'Snap a photo of a receipt and have the merchant, total, and category extracted automatically using multimodal AI.',
  },
  {
    icon: Target,
    title: 'Budgets & Tracking',
    desc: 'Set monthly limits per category and see your progress with visual warnings before you go over.',
  },
  {
    icon: Lightbulb,
    title: 'AI Insights',
    desc: 'Get short, factual monthly observations about your spending — with a reliable rule-based fallback if AI is unavailable.',
  },
];

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

      <main className="dash-main" style={{ maxWidth: 1100 }}>
        <section style={{ textAlign: 'center', padding: '48px 0 32px' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.4rem', fontWeight: 600, marginBottom: 14, lineHeight: 1.15 }}>
            Track every rupee, effortlessly.
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: 520, margin: '0 auto 28px' }}>
            An AI-assisted expense tracker — type or photograph an expense, get instant categorization,
            budget tracking, and monthly spending insights.
          </p>
          <button
            className="btn-primary"
            style={{ padding: '12px 26px', fontSize: '.95rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={() => navigate('/register')}
          >
            Get Started <ArrowRight size={16} />
          </button>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginTop: 24 }}>
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card">
                <Icon size={22} style={{ color: 'var(--accent)', marginBottom: 10 }} />
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.05rem', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '.85rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </section>

        <section style={{ textAlign: 'center', padding: '48px 0 24px' }}>
          <p style={{ color: 'var(--dim)', fontSize: '.85rem', marginBottom: 14 }}>Ready to take control of your spending?</p>
          <button className="btn-primary" style={{ padding: '11px 24px' }} onClick={() => navigate('/register')}>
            Create your free account
          </button>
        </section>
      </main>
    </div>
  );
}