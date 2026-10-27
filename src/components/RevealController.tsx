import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TRAP_TABS, type TrapPhase } from '../data/scripts';
import { useListenerActions, useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';
import { Lane, type LaneCls } from './ListenerDashboard';

const ASK_AT: Record<2 | 4 | 6, TrapPhase> = { 2: 'early', 4: 'mid', 6: 'late' };
const isGate = (n: number): n is 2 | 4 | 6 => n === 2 || n === 4 || n === 6;

export function RevealController() {
  const { F, B } = useProfile();
  const { trapStep: t, trapAsk, purged, set, go } = useAppStore();
  const a = useListenerActions();
  const sc = Math.round(B.total);
  const asking = !!trapAsk;
  const tab = trapAsk ? TRAP_TABS[trapAsk] : null;
  const gateReady = isGate(t) && !asking;
  const lanes: { name: string; cls: LaneCls; note: string }[] = [
    { name: 'Profile correction', cls: a.corrected ? 'done' : 'todo', note: a.corrected ? 'Done: label removed from the listener’s dashboard.' : 'Available to the listener: remove the label from their own dashboard.' },
    { name: 'Future-use restriction', cls: a.restricted ? 'done' : 'todo', note: a.restricted ? 'Done: opted out of future psychological profiling.' : 'Not set: new exports can still use this inference.' },
    { name: 'Deletion from downstream systems', cls: purged ? 'done' : 'todo', note: purged ? 'Done: segment purged by the platform.' : 'Not automatic: the exported segment persists until someone with authority purges it.' },
    { name: 'Review of the profiling policy', cls: 'todo', note: 'Not triggered by individual action. Needs governance review.' },
  ];
  const cards = [
    { n: 1, title: 'The persona', head: '“Potentially Emotionally Vulnerable”', body: `A polished card, a calm gradient and a gentle explanation: “You listen to low-energy music late at night.” Heuristic score ${sc}/100. It feels like care.`, lanes: false },
    { n: 2, title: 'The evidence', head: 'The observations are accurate', body: `${F.night}% nighttime listening, ${F.low}% low-energy tracks, ${F.rom}% romantic playlists, ${F.repeat}% replays. All true in this dataset. But shift work, taste, a playlist made for someone else or a different time zone produce the same pattern.`, lanes: false },
    { n: 3, title: 'The technical truth', head: 'The model did exactly what it was written to do', body: 'The scoring rule was applied correctly. The rule is fully inspectable and the explanation matches the computation. Implementation is correct; the explanation is faithful.', lanes: false },
    { n: 4, title: 'The validity problem', head: 'Nobody established that this measures vulnerability', body: 'The weights and threshold were chosen by hand; there are no clinician-labeled examples. The explanation describes a computation, not a psychological truth.', lanes: false },
    { n: 5, title: 'The downstream consequence', head: 'The label became an advertising audience', body: 'The inferred segment (“Evening Reflective · Wellness”, 412,000 listeners) was offered to Calm Harbor’s wellness subscription campaign. The listener was not clearly told a personal inference would be used this way.', lanes: false },
    { n: 6, title: 'The accountability gap', head: 'Fixing the label does not fix the harm', body: 'The listener can remove the label from their dashboard, but a previously exported advertising segment is not automatically removed. These are four different remedies:', lanes: true },
  ];

  const openQuestion = () => {
    if (!isGate(t)) return;
    set({ trapAsk: ASK_AT[t] });
  };

  const continueFromAsk = () => {
    if (trapAsk === 'late') {
      set({ trapAsk: '' });
      go('trapVote');
      return;
    }
    if (trapAsk === 'early') {
      set({ trapAsk: '', trapStep: 3 });
      return;
    }
    if (trapAsk === 'mid') {
      set({ trapAsk: '', trapStep: 5 });
    }
  };

  const advanceReveal = () => {
    if (gateReady || asking) return;
    set({ trapStep: Math.min(6, t + 1), trapAsk: '' });
  };

  const hideLast = () => {
    if (asking) {
      set({ trapAsk: '' });
      return;
    }
    set({ trapStep: Math.max(0, t - 1), trapAsk: '' });
  };

  useEffect(() => {
    if (!asking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') set({ trapAsk: '' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [asking, set]);

  const gateTab = gateReady ? TRAP_TABS[ASK_AT[t]] : null;
  const continueLabel = trapAsk === 'late' ? 'Continue to trap vote' : 'Continue to next reveals';

  const overlay = tab && createPortal(
    <div className="trap-ask" role="dialog" aria-modal="true" aria-labelledby="trap-ask-title">
      <div className="trap-ask-bg" aria-hidden="true" />
      <div className="trap-ask-panel pop">
        <div className="trap-ask-kicker">
          Discussion · {tab.q.map((n) => 'Q' + n).join(' · ')}
        </div>
        <div className="trap-ask-phase">{tab.tab}</div>
        <h2 id="trap-ask-title" className="trap-ask-title">{tab.prompt}</h2>
        <p className="trap-ask-ask">{tab.ask}</p>
        <div className="trap-ask-actions">
          <button className="btn trap-ask-go" onClick={continueFromAsk}>{continueLabel}</button>
          <button className="btn ghost" onClick={() => set({ trapAsk: '' })}>Close question</button>
        </div>
      </div>
    </div>,
    document.body,
  );

  return (
    <>
      <div className="row">
        <button className="btn pink" onClick={advanceReveal} disabled={gateReady || asking || t >= 6}>
          {t === 0 ? 'Start the reveal' : t >= 6 ? 'All reveals shown' : 'Reveal next'}
        </button>
        {gateReady && (
          <button className="btn trap-ask-btn" onClick={openQuestion}>
            Reveal discussion question · {gateTab!.q.map((n) => 'Q' + n).join(' · ')}
          </button>
        )}
        <button className="btn ghost" onClick={hideLast} disabled={t === 0 && !asking}>Hide last</button>
        <button className="btn ghost" onClick={() => set({ trapStep: 0, trapAsk: '' })}>Restart sequence</button>
        <span className="muted small">{gateReady ? 'Pair complete — reveal the question' : `Reveal ${t} of 6`}</span>
      </div>
      <div className="col" aria-live="polite">
        {cards.filter((c) => t >= c.n).map((c) => (
          <div key={c.n} className={'rev pop' + (t === c.n ? ' cur' : '')}>
            <div className="rn">Reveal {c.n} · {c.title}</div>
            <div className="h3" style={{ fontSize: 28 }}>{c.head}</div>
            <div>{c.body}</div>
            {c.lanes && (
              <>
                <div className="col">{lanes.map((l) => <Lane key={l.name} {...l} />)}</div>
                <div className="row">
                  <button className="btn sm pink" onClick={a.toggleCorrect}>{a.correctLabel}</button>
                  <button className="btn sm alt" onClick={a.toggleRestrict}>{a.restrictLabel}</button>
                  <span className="small muted">Try them: the exported segment lane stays open until someone with authority purges it (Executive view).</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {overlay}
    </>
  );
}
