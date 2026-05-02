import { useState } from 'react';
import useDesktopStore from '../../store/useDesktopStore';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev]       = useState(null);
  const [op, setOp]           = useState(null);
  const [fresh, setFresh]     = useState(true); // next digit starts new number
  const { theme } = useDesktopStore();
  const isDark = theme !== 'light';

  const input = (val) => {
    if (fresh) {
      setDisplay(val === '.' ? '0.' : val);
      setFresh(false);
    } else {
      if (val === '.' && display.includes('.')) return;
      setDisplay(d => d === '0' && val !== '.' ? val : d + val);
    }
  };

  const operate = (nextOp) => {
    const cur = parseFloat(display);
    if (prev !== null && !fresh) {
      const result = calc(prev, cur, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(cur);
    }
    setOp(nextOp);
    setFresh(true);
  };

  const calc = (a, b, o) => {
    switch (o) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 'Error';
      default:  return b;
    }
  };

  const equals = () => {
    if (op === null || prev === null) return;
    const result = calc(prev, parseFloat(display), op);
    setDisplay(String(parseFloat(result.toFixed(10))));
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setFresh(true); };
  const negate = () => setDisplay(d => String(-parseFloat(d)));
  const percent = () => setDisplay(d => String(parseFloat(d) / 100));

  const btn = (label, action, style = '') => (
    <button key={label} onClick={action}
      className={`rounded-2xl text-lg font-medium h-14 flex items-center justify-center transition active:scale-95 ${style}`}>
      {label}
    </button>
  );

  const bg   = isDark ? 'bg-slate-900' : 'bg-slate-100';
  const num  = isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-800 shadow-sm';
  const fn   = isDark ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-300 hover:bg-slate-200 text-slate-800';
  const ops  = 'bg-orange-500 hover:bg-orange-400 text-white';
  const disp = isDark ? 'text-white' : 'text-slate-800';

  return (
    <div className={`h-full flex flex-col p-4 gap-3 ${bg} ${disp}`}>
      {/* Display */}
      <div className="flex-1 flex items-end justify-end px-2">
        <div className="text-right">
          {op && <p className="text-sm opacity-40">{prev} {op}</p>}
          <p className={`font-light break-all ${display.length > 9 ? 'text-3xl' : 'text-5xl'}`}>
            {display}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {btn('AC', clear, fn)}
        {btn('+/−', negate, fn)}
        {btn('%', percent, fn)}
        {btn('÷', () => operate('÷'), ops)}

        {btn('7', () => input('7'), num)}
        {btn('8', () => input('8'), num)}
        {btn('9', () => input('9'), num)}
        {btn('×', () => operate('×'), ops)}

        {btn('4', () => input('4'), num)}
        {btn('5', () => input('5'), num)}
        {btn('6', () => input('6'), num)}
        {btn('−', () => operate('−'), ops)}

        {btn('1', () => input('1'), num)}
        {btn('2', () => input('2'), num)}
        {btn('3', () => input('3'), num)}
        {btn('+', () => operate('+'), ops)}

        <button onClick={() => input('0')}
          className={`col-span-2 rounded-2xl text-lg font-medium h-14 flex items-center px-6 transition active:scale-95 ${num}`}>
          0
        </button>
        {btn('.', () => input('.'), num)}
        {btn('=', equals, ops)}
      </div>
    </div>
  );
}
