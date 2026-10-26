export function ConfidenceInput({ id, label, value, onChange, lo = '0 · no idea', hi = '100 · completely' }: { id: string; label: string; value: number; onChange: (v: number) => void; lo?: string; hi?: string }) {
  return (
    <>
      <label htmlFor={id} className="h3">{label}</label>
      <input id={id} type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={`${value} out of 100`} />
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="muted small">{lo}</span>
        <span className="stat" style={{ fontSize: 48, color: '#1DF08A' }}>{value}</span>
        <span className="muted small">{hi}</span>
      </div>
    </>
  );
}
