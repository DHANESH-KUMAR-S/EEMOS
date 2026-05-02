import { useEffect, useState } from 'react';
import useDesktopStore from '../store/useDesktopStore';
import api from '../utils/api';

const APP_META = {
  filemanager: { icon: '📁', label: 'Files' },
  notes:       { icon: '📝', label: 'Notes' },
  settings:    { icon: '⚙️',  label: 'Settings' },
  appstore:    { icon: '🛍️',  label: 'App Store' },
  calculator:  { icon: '🧮', label: 'Calculator' },
  clock:       { icon: '🕐', label: 'Clock' },
  browser:     { icon: '🌐', label: 'Browser' },
  terminal:    { icon: '💻', label: 'Terminal' },
};

export default function DesktopIcons() {
  const { openWindow, theme } = useDesktopStore();
  const [enabledApps, setEnabledApps] = useState(['filemanager', 'notes', 'settings', 'appstore']);

  useEffect(() => {
    api.get('/apps').then(({ data }) => {
      setEnabledApps(data.filter(a => a.enabled).map(a => a.id));
    }).catch(() => {});
  }, []);

  const isDark = theme !== 'light';

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 flex-wrap max-h-[calc(100vh-60px)]">
      {enabledApps.map(appId => {
        const meta = APP_META[appId];
        if (!meta) return null;
        return (
          <button
            key={appId}
            onDoubleClick={() => openWindow(appId, meta.label)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 group transition-all
              hover:bg-white/10 active:scale-95`}
          >
            <span className="text-3xl drop-shadow-lg group-hover:scale-110 transition-transform">
              {meta.icon}
            </span>
            <span className={`text-xs font-medium text-center leading-tight drop-shadow
              ${isDark ? 'text-white' : 'text-slate-800'}`}
              style={{ textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.8)' : 'none' }}>
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
