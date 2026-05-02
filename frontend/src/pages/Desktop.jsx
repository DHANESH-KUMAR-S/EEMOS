import { useEffect, useState, useCallback } from 'react';
import useDesktopStore from '../store/useDesktopStore';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import Taskbar from '../components/Taskbar';
import WindowManager from '../components/WindowManager';
import DesktopIcons from '../components/DesktopIcons';
import ContextMenu from '../components/ContextMenu';
import NotificationStack from '../components/NotificationStack';

// Wallpaper options
const WALLPAPERS = {
  gradient1: 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900',
  gradient2: 'bg-gradient-to-br from-blue-950 via-cyan-950 to-slate-900',
  gradient3: 'bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950',
  gradient4: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950',
  dark:      'bg-slate-950',
  light:     'bg-slate-200',
};

export default function Desktop() {
  const { theme, wallpaper, setTheme, setWallpaper, openWindow } = useDesktopStore();
  const { user } = useAuthStore();
  const [contextMenu, setContextMenu] = useState(null); // { x, y }

  // Load desktop settings from backend
  useEffect(() => {
    api.get('/desktop').then(({ data }) => {
      if (data.theme) setTheme(data.theme);
      if (data.wallpaper) setWallpaper(data.wallpaper);
    }).catch(() => {});
  }, []);

  // Right-click context menu on desktop
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContext = useCallback(() => setContextMenu(null), []);

  const bg = WALLPAPERS[wallpaper] || WALLPAPERS.gradient1;

  return (
    <div
      className={`w-screen h-screen overflow-hidden relative select-none ${bg} ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}
      onContextMenu={handleContextMenu}
      onClick={closeContext}
    >
      {/* Desktop icons */}
      <DesktopIcons />

      {/* Open windows */}
      <WindowManager />

      {/* Taskbar at bottom */}
      <Taskbar />

      {/* Right-click context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y}
          onClose={closeContext}
          onOpen={openWindow}
        />
      )}

      {/* Toast notifications */}
      <NotificationStack />
    </div>
  );
}
