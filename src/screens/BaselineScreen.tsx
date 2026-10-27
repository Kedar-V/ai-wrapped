import { FinalVotePoll } from '../components/FinalVotePoll';
import { useAppStore } from '../store/useAppStore';

/** Act I close: same ship question as the council final vote, stored for before vs after. */
export function BaselineScreen() {
  const cBefore = useAppStore((s) => s.cBefore);
  const beforeLocked = useAppStore((s) => s.beforeLocked);

  return (
    <section className="main">
      <div className="eyebrow">Act I · First gut check</div>
      <h2 className="disp h2">Before we dig in: should a system like this ship?</h2>
      <p className="lead">
        Same four options you will see at the end. Lock a vote now so the room can compare before vs after.
      </p>
      <FinalVotePoll kind="before" />
      {!beforeLocked && (
        <div className="small muted">
          {cBefore ? 'Submit to lock your before vote, then continue.' : 'Pick an option and submit to continue.'}
        </div>
      )}
    </section>
  );
}
