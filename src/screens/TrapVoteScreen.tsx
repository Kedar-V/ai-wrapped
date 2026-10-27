import { TrapVotePoll } from '../components/TrapVotePoll';
import { SCR } from '../data/scripts';
import { useAppStore } from '../store/useAppStore';

/** Act IV close: ethics vote after the Explanation Trap reveals. */
export function TrapVoteScreen() {
  const vote = useAppStore((s) => s.vote);
  const trapLocked = useAppStore((s) => s.trapLocked);
  const entry = SCR.trapVote;

  return (
    <section className="main">
      <div className="eyebrow" style={{ color: '#FF9DC6' }}>Act IV · Trap vote · Q6</div>
      <div className="card" style={{ borderColor: 'rgba(255,157,198,.35)' }}>
        <div className="eyebrow" style={{ color: '#FF9DC6' }}>Entry · Q6</div>
        <p className="lead" style={{ margin: 0 }}>{entry.prompt}</p>
      </div>
      <h2 className="disp h2">After six reveals: was the system ethical?</h2>
      <p className="lead">
        Transparency and a faithful explanation are not the same as a justified system. Lock a classroom vote, then move to disclosure.
      </p>
      <TrapVotePoll />
      {!trapLocked && (
        <div className="small muted">
          {vote ? 'Submit to lock your vote when a live poll is open, or continue with your local pick.' : 'Pick an option to continue.'}
        </div>
      )}
    </section>
  );
}
