import { useState, useRef, useEffect } from 'react';
import { MONTHS, daysInMonth, firstDay, padDate, fmt } from '../utils/helpers';

const YEARS = Array.from({ length: 300 }, (_, i) => 1950 + i); 

function MonthYearPicker({ month, year, onMonth, onYear, onClose }) {
  const monthRefs = useRef([]);
  const yearRefs  = useRef([]);

  useEffect(() => {
    monthRefs.current[month - 1]?.scrollIntoView({ block: 'center' });
    yearRefs.current[YEARS.indexOf(year)]?.scrollIntoView({ block: 'center' });
  }, []);

  return (
    <div className="picker-overlay" style={{alignItems:'flex-start',paddingTop:'200px'}} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="picker-card scale-in">
        <div className="picker-title">Select Month &amp; Year</div>
        <div className="picker-cols">

          <div className="picker-col">
            <div className="picker-col-label">Month</div>
            <div className="picker-scroll">
              {MONTHS.map((m, i) => (
                <div
                  key={m}
                  ref={el => monthRefs.current[i] = el}
                  className={`picker-item ${month === i + 1 ? 'picker-selected' : ''}`}
                  onClick={() => onMonth(i + 1)}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>

          <div className="picker-col">
            <div className="picker-col-label">Year</div>
            <div className="picker-scroll">
              {YEARS.map((y, i) => (
                <div
                  key={y}
                  ref={el => yearRefs.current[i] = el}
                  className={`picker-item ${year === y ? 'picker-selected' : ''}`}
                  onClick={() => onYear(y)}
                >
                  {y}
                </div>
              ))}
            </div>
          </div>

        </div>
        <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

export default function Calendar({ month, year, onMonth, onYear, dailyMap, onDay }) {
  const [showPicker, setShowPicker] = useState(false);
  const today = new Date();
  const cells = Array(firstDay(month, year)).fill(null)
    .concat(Array.from({ length: daysInMonth(month, year) }, (_, i) => i + 1));

  const prev = () => month === 1  ? (onMonth(12), onYear(year - 1)) : onMonth(month - 1);
  const next = () => month === 12 ? (onMonth(1),  onYear(year + 1)) : onMonth(month + 1);

  return (
    <>
      <div className="card fade-in">
        <div className="cal-header">
          <button className="cal-nav" onClick={prev}>‹</button>

          <button className="cal-title-btn" onClick={() => setShowPicker(true)}>
            <span className="cal-month">{MONTHS[month - 1]}</span>
            <span className="cal-year mono">{year}</span>
            <span className="cal-picker-arrow">▾</span>
          </button>

          <button className="cal-nav" onClick={next}>›</button>
        </div>

        <div className="week-days">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <span key={d} className="week-day">{d}</span>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const key  = padDate(year, month, day);
            const info = dailyMap[key];
            const isT  = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
            return (
              <button key={day}
                className={`cal-cell ${info ? 'has-exp' : ''} ${isT ? 'today' : ''}`}
                onClick={() => onDay(key)}
                title={info ? fmt(info.total) : 'Add expense'}>
                <span className="day-num">{day}</span>
                {info && <span className="day-amt">{fmt(info.total)}</span>}
                {info && <div className="exp-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {showPicker && (
        <MonthYearPicker
          month={month} year={year}
          onMonth={onMonth} onYear={onYear}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
