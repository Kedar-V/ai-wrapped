import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parsePrinciples, snapshot, tallyVotes } from './tally.js';

describe('parsePrinciples', () => {
  it('accepts three distinct valid principles', () => {
    assert.deepEqual(parsePrinciples(['Privacy', 'Validity', 'Fairness']), ['Privacy', 'Validity', 'Fairness']);
  });
  it('rejects duplicates, wrong count, and unknown names', () => {
    assert.equal(parsePrinciples(['Privacy', 'Privacy', 'Validity']), null);
    assert.equal(parsePrinciples(['Privacy', 'Validity']), null);
    assert.equal(parsePrinciples(['Privacy', 'Validity', 'Nope']), null);
  });
});

describe('tallyVotes', () => {
  it('counts every vote, including duplicates from the same person', () => {
    const votes = [
      { principles: ['Validity', 'Privacy', 'Accountability'] },
      { principles: ['Validity', 'Privacy', 'Accountability'] },
      { principles: ['Validity', 'Fairness', 'Autonomy'] },
    ];
    const t = tallyVotes(votes);
    assert.equal(t.find((x) => x.name === 'Validity')?.count, 3);
    assert.equal(t.find((x) => x.name === 'Privacy')?.count, 2);
    assert.equal(snapshot(votes, true).votes, 3);
  });
});
