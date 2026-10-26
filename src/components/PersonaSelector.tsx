import { PERSONAS, PERSONA_IDS } from '../data/personas';
import { useAppStore } from '../store/useAppStore';

export function PersonaSelector() {
  const persona = useAppStore((s) => s.persona);
  const pickPersona = useAppStore((s) => s.pickPersona);
  return (
    <div className="g4" role="group" aria-label="Choose a persona">
      {PERSONA_IDS.map((k) => {
        const p = PERSONAS[k];
        const sel = persona === k;
        return (
          <button key={k} className={'pcard' + (sel ? ' on' : '')} style={{ background: `linear-gradient(160deg,${p.c1},${p.c2})` }} onClick={() => pickPersona(k)} aria-pressed={sel}>
            <span className="tag t-fict" style={{ alignSelf: 'flex-start', background: 'rgba(0,0,0,.25)', color: '#fff', borderColor: '#fff' }}>Persona {p.id}</span>
            <span className="pn">{p.name}</span>
            <span>{p.tag}</span>
            <span className="small">{p.genres.slice(0, 3).map((g) => g[0]).join(' · ')}</span>
            <span className="bar"><i className="b-g" style={{ width: p.night + '%' }} /></span>
            <span className="small">{p.night}% night listening</span>
            <span className="bar"><i className="b-o" style={{ width: p.repeat + '%' }} /></span>
            <span className="small">{p.repeat}% replays</span>
          </button>
        );
      })}
    </div>
  );
}
