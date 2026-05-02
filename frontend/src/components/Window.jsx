import { useRef, useState, useCallback } from 'react';
import useDesktopStore from '../store/useDesktopStore';

export default function Window({ win, children }) {
  const { closeWindow, minimizeWindow, focusWindow, updateWindow, theme } = useDesktopStore();
  const [maximized, setMaximized] = useState(false);
  const [prevBounds, setPrevBounds] = useState(null);

  // Drag state
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resize state
  const resizing = useRef(false);
  const resizeDir = useRef('');
  const resizeStart = useRef({});

  const isDark = theme !== 'light';

  const onMouseDownTitle = useCallback((e) => {
    if (maximized) return;
    e.preventDefault();
    focusWindow(win.id);
    dragging.current = true;
    dragOffset.current = { x: e.clientX - win.x, y: e.clientY - win.y };

    const onMove = (e) => {
      if (!dragging.current) return;
      const x = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - win.width));
      const y = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 80));
      updateWindow(win.id, { x, y });
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [win, maximized]);

  const onResizeMouseDown = useCallback((e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = true;
    resizeDir.current = dir;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: win.width, h: win.height, wx: win.x, wy: win.y };

    const onMove = (e) => {
      if (!resizing.current) return;
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      const d = resizeDir.current;
      let { w, h, wx, wy } = resizeStart.current;

      if (d.includes('e')) w = Math.max(300, w + dx);
      if (d.includes('s')) h = Math.max(200, h + dy);
      if (d.includes('w')) { w = Math.max(300, w - dx); wx = resizeStart.current.wx + (resizeStart.current.w - w); }
      if (d.includes('n')) { h = Math.max(200, h - dy); wy = resizeStart.current.wy + (resizeStart.current.h - h); }

      updateWindow(win.id, { width: w, height: h, x: wx, y: wy });
    };
    const onUp = () => {
      resizing.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [win]);

  const toggleMaximize = () => {
    if (maximized) {
      updateWindow(win.id, prevBounds);
      setMaximized(false);
    } else {
      setPrevBounds({ x: win.x, y: win.y, width: win.width, height: win.height });
      updateWindow(win.id, { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 48 });
      setMaximized(true);
    }
  };

  const style = {
    position: 'fixed',
    left: win.x, top: win.y,
    width: win.width, height: win.height,
    zIndex: win.zIndex,
  };

  const titleBg = isDark ? 'bg-slate-800/95 border-white/10' : 'bg-white/95 border-black/10';
  const bodyBg  = isDark ? 'bg-slate-900/95' : 'bg-slate-50/95';

  return (
    <div
      style={style}
      className={`rounded-xl overflow-hidden shadow-2xl border flex flex-col window-enter
        ${isDark ? 'border-white/10' : 'border-black/10'}`}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className={`flex items-center gap-2 px-3 h-9 shrink-0 border-b cursor-default ${titleBg}`}
        onMouseDown={onMouseDownTitle}
        onDoubleClick={toggleMaximize}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => closeWindow(win.id)}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition flex items-center justify-center group"
            title="Close">
            <span className="opacity-0 group-hover:opacity-100 text-red-900 text-[8px] leading-none">✕</span>
          </button>
          <button onClick={() => minimizeWindow(win.id)}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition flex items-center justify-center group"
            title="Minimize">
            <span className="opacity-0 group-hover:opacity-100 text-yellow-900 text-[8px] leading-none">−</span>
          </button>
          <button onClick={toggleMaximize}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition flex items-center justify-center group"
            title="Maximize">
            <span className="opacity-0 group-hover:opacity-100 text-green-900 text-[8px] leading-none">+</span>
          </button>
        </div>

        {/* Title */}
        <span className={`flex-1 text-center text-xs font-medium truncate
          ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {win.title}
        </span>
        <div className="w-14" /> {/* spacer to center title */}
      </div>

      {/* App content */}
      <div className={`flex-1 overflow-hidden ${bodyBg}`}>
        {children}
      </div>

      {/* Resize handles */}
      {!maximized && <>
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={e => onResizeMouseDown(e, 'se')} />
        <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" onMouseDown={e => onResizeMouseDown(e, 'sw')} />
        <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize" onMouseDown={e => onResizeMouseDown(e, 'ne')} />
        <div className="absolute bottom-0 left-4 right-4 h-1 cursor-s-resize" onMouseDown={e => onResizeMouseDown(e, 's')} />
        <div className="absolute top-9 right-0 bottom-4 w-1 cursor-e-resize" onMouseDown={e => onResizeMouseDown(e, 'e')} />
        <div className="absolute top-9 left-0 bottom-4 w-1 cursor-w-resize" onMouseDown={e => onResizeMouseDown(e, 'w')} />
      </>}
    </div>
  );
}
