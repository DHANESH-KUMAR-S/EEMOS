import { create } from 'zustand';

let windowIdCounter = 1;

const useDesktopStore = create((set, get) => ({
  // Open windows array: { id, app, title, x, y, width, height, minimized, zIndex }
  windows: [],
  activeWindowId: null,
  maxZIndex: 10,

  // Desktop settings
  theme: 'dark',
  wallpaper: 'gradient1',

  // Notifications
  notifications: [],

  openWindow: (app, title, extraProps = {}) => {
    const { windows, maxZIndex } = get();
    // If already open, focus it
    const existing = windows.find(w => w.app === app && !w.minimized);
    if (existing) {
      get().focusWindow(existing.id);
      return;
    }
    const id = windowIdCounter++;
    const newZ = maxZIndex + 1;
    set(s => ({
      windows: [...s.windows, {
        id, app, title,
        x: 80 + (id % 6) * 30,
        y: 60 + (id % 6) * 20,
        width: extraProps.width || 700,
        height: extraProps.height || 480,
        minimized: false,
        zIndex: newZ,
        ...extraProps
      }],
      activeWindowId: id,
      maxZIndex: newZ
    }));
  },

  closeWindow: (id) => set(s => ({
    windows: s.windows.filter(w => w.id !== id),
    activeWindowId: s.activeWindowId === id ? null : s.activeWindowId
  })),

  minimizeWindow: (id) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, minimized: true } : w),
    activeWindowId: s.activeWindowId === id ? null : s.activeWindowId
  })),

  restoreWindow: (id) => {
    const newZ = get().maxZIndex + 1;
    set(s => ({
      windows: s.windows.map(w => w.id === id ? { ...w, minimized: false, zIndex: newZ } : w),
      activeWindowId: id,
      maxZIndex: newZ
    }));
  },

  focusWindow: (id) => {
    const newZ = get().maxZIndex + 1;
    set(s => ({
      windows: s.windows.map(w => w.id === id ? { ...w, zIndex: newZ } : w),
      activeWindowId: id,
      maxZIndex: newZ
    }));
  },

  updateWindow: (id, props) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, ...props } : w)
  })),

  setTheme: (theme) => set({ theme }),
  setWallpaper: (wallpaper) => set({ wallpaper }),

  addNotification: (message, type = 'info') => {
    const id = Date.now();
    set(s => ({ notifications: [...s.notifications, { id, message, type }] }));
    setTimeout(() => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })), 4000);
  },

  dismissNotification: (id) => set(s => ({
    notifications: s.notifications.filter(n => n.id !== id)
  }))
}));

export default useDesktopStore;
