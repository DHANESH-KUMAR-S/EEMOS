import useDesktopStore from '../../store/useDesktopStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../utils/api';

const WALLPAPERS = [
  { id: 'gradient1', label: 'Purple Night', class: 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900' },
  { id: 'gradient2', label: 'Ocean Deep',   class: 'bg-gradient-to-br from-blue-950 via-cyan-950 to-slate-900' },
  { id: 'gradient3', label: 'Rose Dusk',    class: 'bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950' },
  { id: 'gradient4', label: 'Forest',       class: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950' },
  { id: 'dark',      label: 'Pure Dark',    class: 'bg-slate-950' },
  { id: 'light',     label: 'Pure Light',   class: 'bg-slate-200' },
];

export default function Settings() {
  const { theme, wallpaper, setTheme, setWallpaper, addNotification } = useDesktopStore();
  const { user } = useAuthStore();
  const isDark = theme !== 'light';

  const saveTheme = async (t) => {
    setTheme(t);
    try {
      await api.patch('/auth/theme', { theme: t });
      await api.patch('/desktop', { theme: t });
      addNotification('Theme saved', 'success');
    } catch { addNotification('Failed to save theme', 'error'); }
  };

  const saveWallpaper = async (w) => {
    setWallpaper(w);
    try {
      await api.patch('/desktop', { wallpaper: w });
      addNotification('Wallpaper saved', 'success');
    } catch { addNotification('Failed to save wallpaper', 'error'); }
  };

  const border = isDark ? 'border-white/10' : 'border-black/10';
  const section = isDark ? 'bg-white/5' : 'bg-black/5';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`h-full overflow-y-auto p-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
      <h2 className="text-lg font-semibold mb-5">Settings</h2>

      {/* Profile */}
      <div className={`rounded-xl p-4 mb-4 border ${border} ${section}`}>
        <h3 className="text-sm font-semibold mb-3 opacity-70 uppercase tracking-wider">Profile</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user?.username}</p>
            <p className={`text-sm ${muted}`}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className={`rounded-xl p-4 mb-4 border ${border} ${section}`}>
        <h3 className="text-sm font-semibold mb-3 opacity-70 uppercase tracking-wider">Theme</h3>
        <div className="flex gap-3">
          {['dark', 'light'].map(t => (
            <button key={t} onClick={() => saveTheme(t)}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition capitalize
                ${theme === t
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : `${border} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}`}>
              {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          ))}
        </div>
      </div>

      {/* Wallpaper */}
      <div className={`rounded-xl p-4 border ${border} ${section}`}>
        <h3 className="text-sm font-semibold mb-3 opacity-70 uppercase tracking-wider">Wallpaper</h3>
        <div className="grid grid-cols-3 gap-2">
          {WALLPAPERS.map(w => (
            <button key={w.id} onClick={() => saveWallpaper(w.id)}
              className={`relative h-16 rounded-xl overflow-hidden border-2 transition
                ${wallpaper === w.id ? 'border-purple-500 scale-105' : 'border-transparent hover:border-white/30'}`}>
              <div className={`absolute inset-0 ${w.class}`} />
              <span className={`absolute bottom-1 left-0 right-0 text-center text-[10px] font-medium
                ${w.id === 'light' ? 'text-slate-700' : 'text-white'}`}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {w.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
