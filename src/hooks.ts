import { useEffect } from 'react';
import { isScreen } from './data/scripts';
import { useAppStore } from './store/useAppStore';
import { SCREENS } from './data/scripts';
import { SCR } from './data/scripts';
import { featuresOf, PERSONAS } from './data/personas';
import { scoreOf } from './lib/scoring';
import { TH } from './data/model';

/** Apply the current hash to the store. Call before first render so deep links survive. */
export function syncFromHash() {
  const k = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  if (isScreen(k) && k !== useAppStore.getState().screen) useAppStore.getState().go(k);
}

/** Keep location.hash (#/welcome) and store.screen in sync, both directions. */
export function useHashRoute() {
  const screen = useAppStore((s) => s.screen);
  useEffect(() => {
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);
  useEffect(() => {
    const want = '#/' + screen;
    if (window.location.hash !== want) window.location.hash = want;
    document.title = `${SCR[screen].label} · AI Wrapped`;
  }, [screen]);
}

export const screenIndex = (s: string) => (SCREENS as readonly string[]).indexOf(s);


/** The selected persona with its features and the one shared score. */
export function useProfile() {
  const id = useAppStore((s) => s.persona);
  const P = PERSONAS[id];
  const F = featuresOf(P);
  const B = scoreOf(F);
  return { P, F, B, flagged: B.flag, score: Math.round(B.total), thr: TH };
}

/** Listener actions shared by the Lab and the Trap's remedy lanes. */
export function useListenerActions() {
  const { corrected, restricted, delReq, set } = useAppStore();
  return {
    corrected, restricted, delReq,
    toggleCorrect: () => set({ corrected: !corrected }),
    toggleRestrict: () => set({ restricted: !restricted }),
    toggleDelete: () => set({ delReq: !delReq }),
    correctLabel: corrected ? 'Undo correction' : 'Dispute and correct this label',
    restrictLabel: restricted ? 'Opt-out active (tap to undo)' : 'Opt out of psychological profiling',
    deleteLabel: delReq ? 'Deletion requested (tap to withdraw)' : 'Request deletion from advertising systems',
  };
}
