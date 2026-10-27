import { TrapVotePoll } from '../components/TrapVotePoll';
import { useAppStore } from '../store/useAppStore';

/** Act IV close: ethics vote after the Explanation Trap reveals. */
export function TrapVoteScreen() {
  const vote = useAppStore((s) => s.vote);
  const trapLocked = useAppStore((s) => s.trapLocked);

  return (
    <section className="main">
      <div className="eyebrow" style={{ color: '#FF9DC6' }}>Act IV · Trap vote · Q6</div>
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
