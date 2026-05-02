import { useState, useEffect } from 'react';
import useDesktopStore from '../../store/useDesktopStore';

const ZONES = [
  { label: 'Local',     tz: undefined },
  { label: 'New York',  tz: 'America/New_York' },
  { label: 'London',    tz: 'Europe/London' },
  { label: 'Tokyo',     tz: 'Asia/Tokyo' },
  { label: 'Dubai',     tz: 'Asia/Dubai' },
  { label: 'Sydney',    tz: 'Australia/Sydney' },
];

function getTime(tz) {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: tz, hour12: false
  });
}

function getDate(tz) {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: tz
  });
}

// Analog clock face
function AnalogClock({ isDark }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  const hand = (deg, len, width, color) => {
    const rad = (deg - 90) * (Math.PI / 180);
    const x2 = 50 + len * Math.cos(rad);
    const y2 = 50 + len * Math.sin(rad);
    return <line x1="50" y1="50" x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;
  };

  const face = isDark ? '#1e293b' : '#f1f5f9';
  const tick = isDark ? '#475569' : '#94a3b8';
  const handColor = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
      <circle cx="50" cy="50" r="48" fill={face} stroke={tick} strokeWidth="1" />
      {/* Hour ticks */}
      {[...Array(12)].map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        return <line key={i}
          x1={50 + 40 * Math.cos(a)} y1={50 + 40 * Math.sin(a)}
          x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)}
          stroke={tick} strokeWidth="2" strokeLinecap="round" />;
      })}
      {hand(h * 30, 28, 3, handColor)}
      {hand(m * 6, 36, 2, handColor)}
      {hand(s * 6, 40, 1, '#ef4444')}
      <circle cx="50" cy="50" r="2.5" fill="#ef4444" />
    </svg>
  );
}

export default function Clock() {
  const [times, setTimes] = useState({});
  const { theme } = useDesktopStore();
  const isDark = theme !== 'light';

  useEffect(() => {
    const update = () => {
      const t = {};
      ZONES.forEach(z => { t[z.label] = { time: getTime(z.tz), date: getDate(z.tz) }; });
      setTimes(t);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const border = isDark ? 'border-white/10' : 'border-black/10';
  const card   = isDark ? 'bg-white/5' : 'bg-black/5';
  const muted  = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`h-full overflow-y-auto p-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {/* Analog clock */}
      <div className={`rounded-2xl p-5 border ${border} ${card} mb-4 text-center`}>
        <AnalogClock isDark={isDark} />
        <p className={`text-3xl font-mono font-light mt-3`}>{times['Local']?.time}</p>
        <p className={`text-xs ${muted} mt-1`}>{times['Local']?.date}</p>
      </div>

      {/* World clocks */}
      <h3 className={`text-xs font-semibold uppercase tracking-wider ${muted} mb-3`}>World Clocks</h3>
      <div className="grid grid-cols-2 gap-2">
        {ZONES.slice(1).map(z => (
          <div key={z.label} className={`rounded-xl p-3 border ${border} ${card}`}>
            <p className={`text-xs ${muted}`}>{z.label}</p>
            <p className="text-lg font-mono font-light">{times[z.label]?.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
