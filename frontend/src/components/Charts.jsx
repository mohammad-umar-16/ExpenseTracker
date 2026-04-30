import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getCat, fmt } from '../utils/helpers';

const Tip = ({ active, payload, label, isArea }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <div className="tooltip-label">{isArea ? `Day ${label}` : label}</div>}
      <div className="tooltip-val">{fmt(payload[0].value)}</div>
    </div>
  );
};

export function PieChartWidget({ data }) {
  if (!data?.length) return <div className="card chart-empty">No expenses this month</div>;
  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (percentage < 5) return null;
    const r = innerRadius + (outerRadius - innerRadius) * .5;
    return (
      <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
        fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
        {percentage}%
      </text>
    );
  };
  return (
    <div className="card">
      <div className="chart-label">Monthly Breakdown</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} innerRadius={28}
            dataKey="total" labelLine={false} label={renderLabel} strokeWidth={2} stroke="var(--surf)">
            {data.map((d, i) => <Cell key={i} fill={getCat(d.category).color} />)}
          </Pie>
          <Tooltip content={<Tip />} formatter={(v, n) => [fmt(v), n]} />
        </PieChart>
      </ResponsiveContainer>
      {/*<div className="pie-legend">
        {data.map((d, i) => (
          <div key={i} className="pie-legend-item">
            <span className="legend-dot" style={{ background: getCat(d.category).color }} />
            <span className="legend-name">{d.category}</span>
            <span className="legend-val mono">{fmt(d.total)}</span>
          </div>
        ))}
      </div>*/}
    </div>
  );
}

export function TrendChart({ dailyTotals }) {
  if (!dailyTotals?.length) return <div className="card chart-empty">No trend data yet</div>;
  const pts = dailyTotals.map(d => ({ day: +d.date.split('-')[2], total: d.total }));
  return (
    <div className="card">
      <div className="chart-label">Daily Spending Trend</div>
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={pts} margin={{ top:6, right:6, left:-22, bottom:0 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--accent)" stopOpacity={.28} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill:'var(--dim)', fontSize:9, fontFamily:'DM Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill:'var(--dim)', fontSize:9, fontFamily:'DM Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => v>=1000 ? `${(v/1000).toFixed(1)}k` : v} />
          <Tooltip content={<Tip isArea />} />
          <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2}
            fill="url(#grad)" dot={{ fill:'var(--accent)', r:3, strokeWidth:0 }}
            activeDot={{ r:5, fill:'var(--green)' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryList({ categories }) {
  if (!categories?.length) return null;
  return (
    <div className="card">
      <div className="chart-label" style={{ marginBottom:12 }}>By Category</div>
      <div className="cat-list">
        {categories.map(c => {
          const meta = getCat(c.category);
          return (
            <div key={c.category} className="cat-item">
              <div className="cat-row">
                <span className="cat-icon">{meta.icon}</span>
                <span className="cat-name">{c.category}</span>
                <span className="cat-amt mono">{fmt(c.total)}</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width:`${c.percentage}%`, background:meta.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
