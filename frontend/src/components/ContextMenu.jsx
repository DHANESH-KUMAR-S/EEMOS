import useDesktopStore from '../store/useDesktopStore';

export default function ContextMenu({ x, y, onClose, onOpen }) {
  const { theme, setWallpaper } = useDesktopStore();
  const isDark = theme !== 'light';

  const items = [
    { label: '📁 Open File Manager', action: () => onOpen('filemanager', 'Files') },
    { label: '📝 New Note',          action: () => onOpen('notes', 'Notes') },
    { label: '⚙️ Settings',           action: () => onOpen('settings', 'Settings') },
    { divider: true },
    { label: '🎨 Change Wallpaper',  action: () => {
        const options = ['gradient1','gradient2','gradient3','gradient4','dark'];
        const current = useDesktopStore.getState().wallpaper;
        const next = options[(options.indexOf(current) + 1) % options.length];
        setWallpaper(next);
      }
    },
    { label: '🛍️ App Store',          action: () => onOpen('appstore', 'App Store') },
  ];

  // Keep menu inside viewport
  const menuW = 200, menuH = items.length * 36;
  const left = x + menuW > window.innerWidth  ? x - menuW : x;
  const top  = y + menuH > window.innerHeight ? y - menuH : y;

  return (
    <div
      className={`fixed z-[99999] w-48 rounded-xl shadow-2xl border overflow-hidden py-1
        ${isDark ? 'bg-slate-800/95 border-white/10 text-white' : 'bg-white/95 border-black/10 text-slate-800'}`}
      style={{ left, top }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.divider
          ? <div key={i} className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`} />
          : <button key={i}
              onClick={() => { item.action(); onClose(); }}
              className={`w-full text-left px-4 py-2 text-sm transition
                ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
              {item.label}
            </button>
      )}
    </div>
  );
}
