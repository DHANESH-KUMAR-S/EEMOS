import useDesktopStore from '../store/useDesktopStore';

export default function NotificationStack() {
  const { notifications, dismissNotification } = useDesktopStore();

  const colors = {
    info:    'bg-blue-600/90',
    success: 'bg-emerald-600/90',
    error:   'bg-red-600/90',
    warning: 'bg-amber-600/90',
  };

  return (
    <div className="fixed top-4 right-4 z-[99998] flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id}
          className={`${colors[n.type] || colors.info} text-white text-sm px-4 py-3 rounded-xl shadow-xl
            backdrop-blur-sm flex items-center gap-3 pointer-events-auto animate-[slideIn_0.2s_ease-out]
            max-w-xs`}
          style={{ animation: 'slideIn 0.2s ease-out' }}
        >
          <span className="flex-1">{n.message}</span>
          <button onClick={() => dismissNotification(n.id)} className="opacity-70 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}
