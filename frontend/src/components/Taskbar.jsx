import { useState, useEffect } from 'react';
import useDesktopStore from '../store/useDesktopStore';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const APP_ICONS = {
  filemanager: '📁', notes: '📝', settings: '⚙️',
  appstore: '🛍️', calculator: '🧮', clock: '🕐',
  browser: '🌐', terminal: '💻'
};

export default function Taskbar() {
  const { windows, activeWindowId, openWindow, focusWindow, restoreWindow, minimizeWindow, theme } = useDesktopStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isDark = theme !== 'light';
  const base = isDark
    ? 'bg-black/40 border-white/10 text-white'
    : 'bg-white/60 border-black/10 text-slate-800';

  return (
    <div className={`absolute bottom-0 left-0 right-0 h-12 glass border-t ${base} flex items-center px-3 gap-2 z-[9999]`}>
      {/* Start / Logo button */}
      <button
        onClick={() => openWindow('appstore', 'App Store')}
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform shadow-lg"
        title="App Store"
      >
        ⊞
      </button>

      {/* Divider */}
      <div className={`w-px h-6 ${isDark ? 'bg-white/20' : 'bg-black/20'}`} />

      {/* Open window buttons */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {windows.map(w => (
          <button
            key={w.id}
            onClick={() => w.minimized ? restoreWindow(w.id) : (activeWindowId === w.id ? minimizeWindow(w.id) : focusWindow(w.id))}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all max-w-[160px] truncate
              ${activeWindowId === w.id && !w.minimized
                ? isDark ? 'bg-white/20 text-white' : 'bg-black/15 text-slate-900'
                : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-black/5 text-slate-600 hover:bg-black/10'
              }
              ${w.minimized ? 'opacity-60' : ''}`}
          >
            <span>{APP_ICONS[w.app] || '🪟'}</span>
            <span className="truncate">{w.title}</span>
          </button>
        ))}
      </div>

      {/* Right side: time + user */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Clock */}
        <div className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <div className="text-right">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-right opacity-70">{time.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
        </div>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowUserMenu(v => !v); }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform"
          >
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </button>

          {showUserMenu && (
            <div className={`absolute bottom-10 right-0 w-48 rounded-xl shadow-2xl border overflow-hidden z-50
              ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-black/10'}`}
              onClick={e => e.stopPropagation()}
            >
              <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <p className="text-sm font-semibold">{user?.username}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
              </div>
              <button onClick={() => { openWindow('settings', 'Settings'); setShowUserMenu(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition`}>
                ⚙️ Settings
              </button>
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition">
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
