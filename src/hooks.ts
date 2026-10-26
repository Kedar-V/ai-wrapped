import { useEffect } from 'react';
import { isScreen } from './data/scripts';
import { useAppStore } from './store/useAppStore';
import { SCREENS } from './data/scripts';
import { SCR } from './data/scripts';

/** Keep location.hash (#/welcome) and store.screen in sync, both directions. */
export function useHashRoute() {
  const screen = useAppStore((s) => s.screen);
  useEffect(() => {
    const read = () => {
      const k = window.location.hash.replace(/^#\/?/, '');
      if (isScreen(k) && k !== useAppStore.getState().screen) useAppStore.getState().go(k);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  useEffect(() => {
    const want = '#/' + screen;
    if (window.location.hash !== want) window.location.hash = want;
    document.title = `${SCR[screen].label} · AI Wrapped`;
  }, [screen]);
}

export const screenIndex = (s: string) => (SCREENS as readonly string[]).indexOf(s);
