import { describe, expect, it } from 'vitest';
import { wordsFromDefenses } from './wordCloud';

describe('wordsFromDefenses', () => {
  it('weights repeated content words and drops stopwords', () => {
    const words = wordsFromDefenses([
      'Privacy matters because surveillance harms trust',
      'Autonomy matters for personal control and trust',
    ]);
    expect(words.find((w) => w.text === 'trust')?.weight).toBe(2);
    expect(words.find((w) => w.text === 'because')).toBeUndefined();
    expect(words.find((w) => w.text === 'the')).toBeUndefined();
  });
});
