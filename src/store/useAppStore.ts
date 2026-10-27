import { create } from 'zustand';
import type { Grid, PresetId } from '../data/disclosure';
import type { Cell } from '../data/matrix';
import type { PersonaId } from '../data/personas';
import type { NegWho, PolicyId } from '../data/policies';
import type { ScreenId } from '../data/scripts';
import type { StakeholderId } from '../data/stakeholders';
import type { Features } from '../data/model';

export interface AppState {
  screen: ScreenId;
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
  /** Trap remedy lanes (separate from Lab so roles can run in parallel). */
  corrected: boolean;
  restricted: boolean;
  delReq: boolean;
  /** Trap: executive purge of exported segment. Irreversible until Reset. */
  purged: boolean;
  /** Lab Listener controls — isolated from Trap / Executive / Auditor. */
  labCor: boolean;
  labRes: boolean;
  labDel: boolean;
  labExp: boolean;
  /** Lab Executive purge — isolated from Listener and Trap. */
  exPurged: boolean;
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
  /** Discussion pause after reveal pairs 2 / 4 / 6. */
  trapAsk: '' | 'early' | 'mid' | 'late';
  vote: string;
  dGrid: Grid | null;
  dPre: PresetId | '';
  cStep: number;
  cPri: string[];
  cDef: Record<string, string>;
  cPol: '' | PolicyId;
  cNeg: PolicyId;
  /** Selected cell on the negotiation matrix. */
  cNegSel: { who: NegWho; pid: PolicyId } | null;
  cFinal: string;
  /** Act I baseline ship vote (same options as cFinal). */
  cBefore: string;
  /** True after this browser submits its principles poll vote. */
  pollLocked: boolean;
  /** True after this browser submits its final deploy vote. */
  finalLocked: boolean;
  /** True after this browser submits its before (baseline) ship vote. */
  beforeLocked: boolean;
  /** True after this browser submits its trap ethics vote. */
  trapLocked: boolean;
}

export function initState(): AppState {
  return {
    screen: 'welcome', persona: 'A', roadmap: false, present: false, wStep: 0, cls: {},
    xStage: 'pre', conf0: 50, conf1: 50, pred: '', act: '', xMode: 'levels', level: 1, xStk: 'listener', featSel: 'night',
    stk: 'listener', corrected: false, restricted: false, delReq: false, purged: false,
    labCor: false, labRes: false, labDel: false, labExp: false, exPurged: false, eng: null,
    adCamp: 'wellness', adStrat: 'behavioral', exStrat: 'engagement', audStep: 0, audCls: {},
    mView: 'current', mProp: null, asym: 0, trapStep: 0, trapAsk: '', vote: '', dGrid: null, dPre: 'current',
    cStep: 1, cPri: [], cDef: {}, cPol: '', cNeg: 'B', cNegSel: { who: 'Listener', pid: 'B' }, cFinal: '', cBefore: '',
    pollLocked: false, finalLocked: false, beforeLocked: false, trapLocked: false,
  };
}

interface Actions {
  set: (patch: Partial<AppState>) => void;
  go: (screen: ScreenId) => void;
  pickPersona: (id: PersonaId) => void;
  reset: () => void;
}

export const useAppStore = create<AppState & Actions>((set) => ({
  ...initState(),
  set: (patch) => set(patch),
  go: (screen) =>
    set((st) => ({
      screen,
      // Re-entering Explain always starts at step 1; in-screen Back handles earlier stages.
      ...(screen === 'explain' && st.screen !== 'explain' ? { xStage: 'pre' as const, pred: '' as const, act: '' as const } : {}),
    })),
  pickPersona: (id) =>
    set({
      persona: id, eng: null, cls: {}, xStage: 'pre', pred: '', act: '',
      corrected: false, restricted: false, delReq: false, purged: false,
      labCor: false, labRes: false, labDel: false, labExp: false, exPurged: false,
    }),
  reset: () => set(initState()),
}));
