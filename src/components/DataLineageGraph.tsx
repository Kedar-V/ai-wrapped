export interface LineageNode {
  t: string;
  /** ok = solid link, weak = dashed (broken recourse), no = absent. */
  cls?: 'ok' | 'weak' | 'no';
  note?: string;
}

/** Linear information-flow graph. Status is carried by words, not color alone. */
export function DataLineageGraph({ nodes, vertical = false, label }: { nodes: LineageNode[]; vertical?: boolean; label: string }) {
  return (
    <ol className="row" style={{ listStyle: 'none', padding: 0, margin: 0, flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'flex-start' : 'center' }} aria-label={label}>
      {nodes.map((n, i) => (
        <li key={n.t} className="row" style={{ gap: 8 }}>
          <span className={'node ' + (n.cls ?? '')}>
            {n.t}
            {n.cls === 'weak' && <span className="small"> (no automatic link)</span>}
          </span>
          {i < nodes.length - 1 && <span className="arrow" aria-hidden="true">{vertical ? '↓' : '→'}</span>}
        </li>
      ))}
    </ol>
  );
}
