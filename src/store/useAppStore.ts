import { create } from 'zustand';
import type { Grid, PresetId } from '../data/disclosure';
import type { Cell } from '../data/matrix';
import type { PersonaId } from '../data/personas';
import type { PolicyId } from '../data/policies';
import type { AnyScreen } from '../data/scripts';
import type { StakeholderId } from '../data/stakeholders';
import type { Features } from '../data/model';

export interface AppState {
  screen: AnyScreen;
  /** Last non-instructor screen, so Instructor mode can return. */
  from: AnyScreen;
  persona: PersonaId;
  roadmap: boolean;
  present: boolean;
  wStep: number;
  cls: Record<string, string>;
  xStage: 'pre' | 'explain' | 'predict' | 'result';
  conf0: number;
  conf1: number;
  pred: '' | 'yes' | 'no' | 'unsure';
  act: '' | 'a' | 'b' | 'c';
  xMode: 'levels' | 'compare';
  level: 1 | 2 | 3 | 4;
  xStk: StakeholderId;
  featSel: keyof Features;
  stk: StakeholderId;
  corrected: boolean;
  restricted: boolean;
  delReq: boolean;
  /** Executive-only and irreversible until Reset. */
  purged: boolean;
  eng: Partial<Features> | null;
  adCamp: string;
  adStrat: string;
  exStrat: string;
  audStep: number;
  audCls: Record<number, string>;
  mView: 'current' | 'proposed' | 'diff';
  mProp: Cell[][] | null;
  asym: number;
  trapStep: number;
  vote: string;
  dGrid: Grid | null;
  dPre: PresetId | '';
  cStep: number;
  cPri: string[];
  cDef: Record<string, string>;
  cPol: '' | PolicyId;
  cNeg: PolicyId;
  cFinal: string;
  discuss: boolean;
  ans: boolean;
}

export function initState(): AppState {
  return {
    screen: 'welcome', from: 'welcome', persona: 'A', roadmap: false, present: false, wStep: 0, cls: {},
    xStage: 'pre', conf0: 50, conf1: 50, pred: '', act: '', xMode: 'levels', level: 1, xStk: 'listener', featSel: 'night',
    stk: 'listener', corrected: false, restricted: false, delReq: false, purged: false, eng: null,
    adCamp: 'wellness', adStrat: 'behavioral', exStrat: 'engagement', audStep: 0, audCls: {},
    mView: 'current', mProp: null, asym: 0, trapStep: 0, vote: '', dGrid: null, dPre: 'current',
    cStep: 1, cPri: [], cDef: {}, cPol: '', cNeg: 'B', cFinal: '', discuss: false, ans: false,
  };
}

interface Actions {
  set: (patch: Partial<AppState>) => void;
  /** Change persona and clear everything derived from the previous persona. */
  /** Navigate; remembers the last real screen so Instructor mode can return. */
  go: (screen: AnyScreen) => void;
  pickPersona: (id: PersonaId) => void;
  reset: () => void;
}

export const useAppStore = create<AppState & Actions>((set) => ({
  ...initState(),
  set: (patch) => set(patch),
  go: (screen) =>
    set((st) => ({ screen, from: screen === 'instructor' ? (st.screen === 'instructor' ? st.from : st.screen) : screen })),
  pickPersona: (id) =>
    set({ persona: id, eng: null, cls: {}, xStage: 'pre', pred: '', act: '', corrected: false, restricted: false, delReq: false, purged: false }),
  reset: () => set(initState()),
}));
