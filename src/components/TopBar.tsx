import { ACTS, SCREENS } from '../data/scripts';
import { useAppStore } from '../store/useAppStore';

export function TopBar() {
  const { screen, from, present, go, set, reset } = useAppStore();
  const baseIdx = Math.max(0, SCREENS.indexOf(screen === 'instructor' ? (from === 'instructor' ? 'welcome' : from) : screen));
  const inInstructor = screen === 'instructor';

  const togglePresent = () => {
    const n = !present;
    set({ present: n });
    try {
      if (n && document.documentElement.requestFullscreen) void document.documentElement.requestFullscreen();
      else if (!n && document.fullscreenElement && document.exitFullscreen) void document.exitFullscreen();
    } catch {
      /* fullscreen is optional */
    }
  };

  return (
    <>
      <header className="top">
        <div className="brand disp">AI Wrapped</div>
        <nav className="acts" aria-label="Experience progress">
          {ACTS.map((a) => {
            const on = a.screens.includes(SCREENS[baseIdx]) && !inInstructor;
            const done = SCREENS.indexOf(a.screens[a.screens.length - 1]) < baseIdx;
            const status = on ? 'current' : done ? 'done' : 'upcoming';
            return (
              <button key={a.id} className={'act' + (on ? ' on' : '') + (done ? ' done' : '')} aria-current={on ? 'step' : undefined} onClick={() => go(a.screens[0])}>
                <span className="an">{a.id}</span>
                <span>{a.label}</span>
                <span className="at">{a.time}</span>
                <span className="mono small">{status === 'done' ? '✓ done' : status === 'current' ? '● current' : ''}</span>
              </button>
            );
          })}
        </nav>
        <div className="sp" />
        <button className="btn ghost sm" onClick={togglePresent} aria-pressed={present}>{present ? 'Exit classroom view' : 'Classroom view'}</button>
        <button className="btn ghost sm" onClick={() => go('instructor')} aria-pressed={inInstructor}>Instructor mode</button>
        <button className="btn ghost sm" onClick={reset}>Reset demo</button>
      </header>
      <div className="pbar" role="progressbar" aria-label="Progress through the session" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(((baseIdx + 1) / SCREENS.length) * 100)}>
        <div className="pfill" style={{ width: Math.round(((baseIdx + 1) / SCREENS.length) * 100) + '%' }} />
      </div>
    </>
  );
}
