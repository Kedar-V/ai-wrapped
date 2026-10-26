import { describe, expect, it } from 'vitest';
import { applyVoteApiFromLocation } from './voteApi';

describe('applyVoteApiFromLocation', () => {
  it('reads voteApi from search', () => {
    const r = applyVoteApiFromLocation('?voteApi=https://abc.ngrok-free.app', '#/council');
    expect(r.api).toBe('https://abc.ngrok-free.app');
  });

  it('reads room and normalizes', () => {
    const r = applyVoteApiFromLocation('?voteApi=https://x.ngrok-free.app&room=ab12', '#/council');
    expect(r.room).toBe('AB12');
  });

  it('ignores bad room codes', () => {
    const r = applyVoteApiFromLocation('?room=NO', '#/council');
    expect(r.room).toBeUndefined();
  });
});
