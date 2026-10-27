export const SCREENS = ['welcome', 'wrapped', 'think', 'baseline', 'explain', 'lab', 'matrix', 'trap', 'disclosure', 'council'] as const;
export type ScreenId = (typeof SCREENS)[number];
export type AnyScreen = ScreenId | 'instructor';

export const isScreen = (s: string): s is AnyScreen => s === 'instructor' || (SCREENS as readonly string[]).includes(s);

export const ACTS: { id: string; label: string; screens: ScreenId[]; time: string; q: string }[] = [
  { id: 'I', label: 'Your AI Wrapped', screens: ['welcome', 'wrapped', 'think', 'baseline'], time: '0–3 min', q: 'Q1 · Q2' },
  { id: 'II', label: 'Explain My Profile', screens: ['explain'], time: '3–7 min', q: 'Q2 · Q5' },
  { id: 'III', label: 'Stakeholder Lab', screens: ['lab', 'matrix'], time: '7–13 min', q: 'Q1 · Q2 · Q3' },
  { id: 'IV', label: 'Explanation Trap', screens: ['trap', 'disclosure'], time: '13–18 min', q: 'Q3 · Q4 · Q6' },
  { id: 'V', label: 'Ethics Council', screens: ['council'], time: '18–25 min', q: 'Q4 · Q6 · Q7' },
];

export interface ScreenMeta {
  label: string;
  time: string;
  mins: number;
  q: number[];
  prompt: string;
  next: string;
  demo: string;
  ask: string;
  expect: string;
  reveal: string;
  principle: string;
}

export const SCR: Record<AnyScreen, ScreenMeta> = {
  welcome: { label: 'Welcome', time: '0:00', mins: 0.5, q: [1, 2], prompt: 'Before we start: what do you expect a music app to infer about you from listening alone?', next: 'Reveal my Wrapped', demo: 'Open on the playful hero. Let the cards float; do not explain anything yet.', ask: 'What would you guess a music app can infer from your listening?', expect: 'Taste, mood, time of day, maybe age. Few will say emotional state or relationships.', reveal: 'The Wrapped recap for The Midnight Romantic.', principle: 'Expectation setting (transparency)' },
  wrapped: { label: 'Wrapped reveal', time: '1:00', mins: 1, q: [2], prompt: 'Everything on this page is a count. Where does counting end and concluding begin?', next: 'What does the AI think it knows?', demo: 'Reveal tiles one at a time. Point out observed counts versus the final AI personality.', ask: 'Which of these cards is a fact and which is an interpretation?', expect: 'Counts are facts; the personality is the platform’s story.', reveal: 'The four inferences.', principle: 'Validity of inferences' },
  think: { label: 'What AI thinks it knows', time: '2:00', mins: 1, q: [1, 2], prompt: 'Which of these assumptions should the platform be allowed to make?', next: 'First gut check', demo: 'Have students classify each inference, then compare with the sample cohort.', ask: 'Which inference is inappropriate, and who gets to decide?', expect: 'Relationship status and emotional vulnerability usually land as inappropriate.', reveal: 'Baseline ship vote, then explanation.', principle: 'Meaningful consent' },
  baseline: { label: 'Should this ship? (before)', time: '2:45', mins: 0.5, q: [4, 7], prompt: 'Before you see how the system works: should a system like this ship?', next: 'Explain my profile', demo: 'Start a before poll. Students pick Deploy / restrictions / Redesign / Do not deploy once. You will compare these bars to the final vote in Act V.', ask: 'What is your gut before any explanation?', expect: 'Many lean Deploy or Deploy with restrictions before seeing the trap.', reveal: 'Explain My Profile.', principle: 'Accountability' },
  explain: { label: 'Explain My Profile', time: '3:00', mins: 4, q: [2, 5], prompt: 'Did the explanation make you more confident, or more correct? Are those the same thing?', next: 'Enter the Stakeholder Lab', demo: 'Take the confidence reading, show the four levels, then the 61% → 15% prediction.', ask: 'If night listening drops to 15%, does the label disappear?', expect: 'Most predict it disappears. It stays: the rule is a weighted sum and other features compensate.', reveal: 'Same profile through four different roles.', principle: 'Explainability is not understanding' },
  lab: { label: 'Stakeholder Lab', time: '7:00', mins: 4, q: [1, 2, 3], prompt: 'Should an AI platform know something about you that you never told it? Who among these four can act on it?', next: 'Compare access side by side', demo: 'Walk Listener → Engineer → Executive → Auditor. Each role stands alone: nothing one role does appears in another, so groups can work in parallel on separate devices.', ask: 'Who can change the system and who is only affected by it?', expect: 'Listener can edit a label but not the segment; executive holds deployment authority.', reveal: 'Access matrix and information asymmetry.', principle: 'Accountability' },
  matrix: { label: 'Access matrix', time: '11:00', mins: 2, q: [1, 3], prompt: 'Who can decide without understanding, and who is affected without the power to challenge?', next: 'Trigger the Explanation Trap', demo: 'Reveal asymmetry layers, then edit the proposed permissions and read the gaps panel.', ask: 'What would you change first in the proposed column?', expect: 'Give listeners provenance and real correction authority; give auditors protected access.', reveal: 'The Explanation Trap.', principle: 'Effective recourse' },
  trap: { label: 'Explanation Trap', time: '13:00', mins: 3, q: [3, 6], prompt: 'The algorithm was transparent. The explanation was faithful. Was the system ethical?', next: 'Set disclosure rules', demo: 'Reveal one step at a time, letting the room react. Pause on reveal 4 (validity) and reveal 6 (accountability gap).', ask: 'What changed between reveal 3 and reveal 4?', expect: 'Faithfulness is not validity. Perfect interpretability does not justify the use.', reveal: 'Disclosure simulator.', principle: 'Validity and purpose limitation' },
  disclosure: { label: 'Disclosure simulator', time: '16:00', mins: 2, q: [3, 4], prompt: 'Who should see what, and why is “make it all public” not the answer?', next: 'Convene the Ethics Council', demo: 'Start from Maximum public, then move to Balanced. Read the trade-off notes aloud.', ask: 'What does public release risk that protected auditor access does not?', expect: 'Gaming, privacy exposure, proprietary leakage.', reveal: 'Ethics Council.', principle: 'Proportionate transparency' },
  council: { label: 'Ethics Council', time: '18:00', mins: 7, q: [4, 6, 7], prompt: 'Who deserves an explanation, and when is an explanation simply not enough?', next: 'Back to start', demo: 'Principles → policy → negotiation → vote → before/after.', ask: 'Defend your top two or three priorities against someone who chose differently.', expect: 'Validity, recourse and data minimization often outrank transparency once the trap is understood.', reveal: 'Close with the final question.', principle: 'Responsible data science design' },
  instructor: { label: 'Instructor mode', time: '', mins: 0, q: [], prompt: 'Pick a stage and a stakeholder, then launch a discussion question.', next: 'Return to the experience', demo: '', ask: '', expect: '', reveal: '', principle: '' },
};

export const BGS: Record<AnyScreen, string> = {
  welcome: 'radial-gradient(1100px 700px at 85% -10%,#6D28D9 0%,#1B0E3B 55%,#120A24 100%)',
  wrapped: 'radial-gradient(1000px 600px at 50% -20%,#7C3AED 0%,#1B0E3B 55%,#120A24 100%)',
  think: 'radial-gradient(900px 500px at 80% -10%,#4C1D95 0%,#17092F 60%,#120A24 100%)',
  baseline: 'radial-gradient(900px 500px at 50% -10%,#4C1D95 0%,#17092F 55%,#120A24 100%)',
  explain: 'linear-gradient(180deg,#160D2E,#0F0A1E)',
  lab: 'linear-gradient(180deg,#140B28,#0E0919)',
  matrix: 'linear-gradient(180deg,#130A26,#0D0817)',
  trap: 'radial-gradient(900px 500px at 50% -10%,#4A0F2C 0%,#12060F 60%,#0A040A 100%)',
  disclosure: 'radial-gradient(900px 500px at 20% -10%,#3A0E26 0%,#12060F 60%,#0A040A 100%)',
  council: 'radial-gradient(900px 500px at 70% -10%,#4A2410 0%,#140A08 60%,#0A0505 100%)',
  instructor: 'linear-gradient(180deg,#101018,#0A0A12)',
};
