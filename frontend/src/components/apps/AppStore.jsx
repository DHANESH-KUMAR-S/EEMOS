import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useDesktopStore from '../../store/useDesktopStore';

export default function AppStore() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addNotification, theme } = useDesktopStore();
  const isDark = theme !== 'light';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/apps');
      setApps(data);
    } catch { addNotification('Failed to load apps', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (appId) => {
    try {
      const { data } = await api.patch(`/apps/${appId}/toggle`);
      setApps(prev => prev.map(a => ({
        ...a,
        enabled: data.enabledApps.includes(a.id)
      })));
      const app = apps.find(a => a.id === appId);
      addNotification(`${app?.name} ${data.enabledApps.includes(appId) ? 'enabled' : 'disabled'}`, 'success');
    } catch { addNotification('Failed to update app', 'error'); }
  };

  const border = isDark ? 'border-white/10' : 'border-black/10';
  const card   = isDark ? 'bg-white/5 hover:bg-white/8' : 'bg-black/5 hover:bg-black/8';
  const muted  = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`h-full overflow-y-auto p-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">App Store</h2>
          <p className={`text-xs ${muted} mt-0.5`}>Enable or disable apps on your desktop</p>
        </div>
        <span className={`text-xs ${muted}`}>{apps.filter(a => a.enabled).length} enabled</span>
      </div>

      {loading && (
        <div className={`text-center py-12 ${muted}`}>Loading apps...</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {apps.map(app => (
          <div key={app.id}
            className={`rounded-xl p-4 border ${border} ${card} transition flex flex-col gap-3`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{app.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{app.name}</p>
                <p className={`text-xs ${muted} mt-0.5 leading-relaxed`}>{app.description}</p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={() => toggle(app.id)}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition w-full justify-center
                ${app.enabled
                  ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30'
                  : `${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10' : 'bg-black/5 text-slate-500 hover:bg-black/10 border border-black/10'}`
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${app.enabled ? 'bg-purple-400' : 'bg-slate-500'}`} />
              {app.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
