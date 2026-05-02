import useDesktopStore from '../store/useDesktopStore';
import Window from './Window';
import FileManager from './apps/FileManager';
import Notes from './apps/Notes';
import Settings from './apps/Settings';
import AppStore from './apps/AppStore';
import Calculator from './apps/Calculator';
import Clock from './apps/Clock';

// Map app id -> component
const APP_COMPONENTS = {
  filemanager: FileManager,
  notes:       Notes,
  settings:    Settings,
  appstore:    AppStore,
  calculator:  Calculator,
  clock:       Clock,
};

export default function WindowManager() {
  const { windows } = useDesktopStore();

  return (
    <>
      {windows.map(win => {
        if (win.minimized) return null;
        const AppComponent = APP_COMPONENTS[win.app];
        return (
          <Window key={win.id} win={win}>
            {AppComponent
              ? <AppComponent windowId={win.id} />
              : <div className="flex items-center justify-center h-full text-slate-400">
                  App "{win.app}" coming soon
                </div>
            }
          </Window>
        );
      })}
    </>
  );
}
