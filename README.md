# AI Wrapped: The Explanation Trap

A classroom teaching prototype for a graduate AI Ethics session ("Who Is Owed Explainability and Transparency?"). React + TypeScript + Vite.

**Everything is fictional and in-memory.** There is no backend, auth, database, Spotify integration or model call. Sample cohort results (votes, classification distributions, before/after) are labeled *illustrative*; your own vote is only added locally.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # typecheck + production build
npm test        # Vitest
```

## Flow

`welcome → persona → wrapped → think → explain → lab → matrix → trap → disclosure → council`, plus Instructor mode. Routes are hash based (`#/welcome`, `#/trap`, …) and stay in sync with the store. Use **Instructor mode** in the top bar for stage jumps, persona/stakeholder switching, trap reveals, discussion questions and the facilitator script. **Classroom view** scales the UI ~12% and requests fullscreen. **Reset demo** restores the initial state.

## Shared model

One rule, no hardcoded results (`src/lib/scoring.ts`):

```
score = 100 × (0.35·min(night/60,1) + 0.30·min(low/50,1) + 0.20·min(rom/35,1) + 0.15·min(repeat/70,1))
flag if score ≥ 70
```

- Persona A (The Midnight Romantic) scores 99 and is flagged; with night 61% → 15% it scores 73, still flagged. B, C, D are not flagged.
- Cross-view state `corrected`, `restricted`, `delReq`, `purged` drives the listener lanes, auditor records, executive tiles and trap lanes. `purged` is executive-only and irreversible until Reset. Correcting the label does not remove the exported advertising segment.

## Layout

```
src/data/        personas, stakeholders, matrix, disclosure, policies, scripts
src/lib/         scoring.ts, hours.ts (+ tests)
src/store/       useAppStore.ts (Zustand; initState and reset)
src/components/  PersonaSelector, WrappedReveal, InferenceCard, ExplanationViewer, ConfidenceInput,
                 ComprehensionTest, StakeholderSwitcher, Listener/Engineer/Advertiser/Executive/Auditor dashboards,
                 AccessMatrix, DataLineageGraph, DisclosureSimulator, RevealController, EthicsCouncil, InstructorControls
src/screens/     one per screen
project/         original design-canvas sources (spec)
```

## Q1–Q7 coverage

| Q | Question | Required interaction | Where | Visible output | Discussion moment |
|---|----------|----------------------|-------|----------------|-------------------|
| Q1 | Who is owed transparency, explainability or interpretability? | Stakeholder Access Matrix | Matrix screen; Lab switcher | Current vs proposed access, power gaps, info-flow graph | Who decides without understanding? Who is affected without power? |
| Q2 | What kind or level of explanation does each stakeholder need? | Explanation Selector | Explain: levels and compare-by-stakeholder | Fit dots per format, reveals / does not reveal | Did more detail help? |
| Q3 | Who actually has access, and why does that matter? | Information Asymmetry Reveal | Matrix: four-layer reveal; Lab default views | Exists / disclosed / understandable / authority | What exists that this role cannot see? |
| Q4 | What are the trade-offs and risks of transparency? | Disclosure Simulator | Disclosure screen | Six qualitative indicators, four disclosure kinds, rule-triggered notes | Why is “make it all public” not the answer? |
| Q5 | How do we know people understand explanations? | Explanation Comprehension Experiment | Explain: slider → prediction → result | Confidence before/after, correctness, actionable issue | More confident or more correct? |
| Q6 | Would problems remain with a perfectly interpretable model? | Perfect Explanation Trap | Trap reveals 3–6 and final vote | Faithful + transparent + invalid + exported segment | Was the system ethical? |
| Q7 | What principles should guide a responsible team? | Ethics Council | Council steps 1–5 | Three defended principles, policy fit, before/after | Who deserves an explanation, and when is it not enough? |

## Accessibility

Real buttons, labels and inputs; 44px minimum targets; status is always written (Available / Restricted / Needs auth / Unavailable, Done / Open, Selected) rather than color alone; visible focus rings; `prefers-reduced-motion` disables animation; layout is responsive to phone width.
