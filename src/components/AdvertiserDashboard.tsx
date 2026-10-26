import { AD_BLOCKED, AD_SEGS, CAMP, STR } from '../data/stakeholders';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export function AdvertiserDashboard() {
  const { flagged } = useProfile();
  const { adCamp, adStrat, purged, set } = useAppStore();
  const camp = CAMP.find((c) => c.id === adCamp)!;
  const strat = STR.find((c) => c.id === adStrat)!;
  const si = STR.indexOf(strat);
  const you = flagged ? (purged ? 'The selected listener has been purged from this segment.' : 'The selected listener is in this audience and does not know it.') : 'The selected listener is not in this audience.';
  return (
    <div className="g2">
      <div className="card pop">
        <div className="h3">Campaign</div>
        <div className="row" role="group" aria-label="Campaign">{CAMP.map((c) => <button key={c.id} className={'chip' + (adCamp === c.id ? ' on' : '')} aria-pressed={adCamp === c.id} onClick={() => set({ adCamp: c.id })}>{c.label}</button>)}</div>
        <div className="h3">Targeting strategy</div>
        <div className="row" role="group" aria-label="Targeting strategy">{STR.map((c) => <button key={c.id} className={'chip' + (adStrat === c.id ? ' on' : '')} aria-pressed={adStrat === c.id} onClick={() => set({ adStrat: c.id })}>{c.label}</button>)}</div>
        <div className="g2" style={{ gap: 12 }}>
          <div><div className="small muted">Estimated reach</div><div className="stat" style={{ fontSize: 44 }}>{(camp.base * strat.m).toFixed(2)}M</div></div>
          <div><div className="small muted">Estimated click-through</div><div className="stat" style={{ fontSize: 44, color: '#FF8A1F' }}>{camp.ctr[si].toFixed(1)}%</div></div>
        </div>
        <div className={'gap ' + strat.cls}><b>Evidence status:</b> {strat.ev}</div>
        {adStrat === 'sensitive' && <div className="gap p">This strategy targets an inferred emotional state that listeners cannot verify. {you}</div>}
      </div>
      <div className="card">
        <div className="h3">Audience segments you can see</div>
        {AD_SEGS.map((g) => <div key={g.name} className="gap g"><b>{g.name}</b> · {g.size} listeners<div className="small">{g.desc}</div></div>)}
        <div className="h3">Data access restrictions</div>
        {AD_BLOCKED.map((b) => <div key={b} className="small">✕ {b}</div>)}
        <div className="small muted">All reach and engagement figures are hypothetical commercial estimates, not verified results.</div>
      </div>
    </div>
  );
}
