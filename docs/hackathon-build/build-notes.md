# Build Notes

## 2026-08-28 - Guided onboarding

### Confirmed direction

- Project name: Somnora Desktop Workbench.
- Hackathon work: the new web dashboard and secure cross-device ecosystem layer.
- Pre-existing work shown in the demo: the Somnora iPhone app and Apple Watch app. Submission materials must distinguish these from the new hackathon work.
- Hero workflow: a seeded Eureka dry spell combines creative inactivity with consent-controlled context and produces one timely, low-friction recommendation.
- Supporting workflow: Grill Me pressure-tests a stalled goal and proposes one concrete next step.
- Demo surfaces: web dashboard, iPhone, and Apple Watch.
- Future ecosystem direction: Somnora Fitness and Somnora Nutrition feed additional context into the dashboard.
- Delivery constraint: approximately 30 hands-on build hours.

### Interaction and consent

- Nora may proactively surface a recommendation according to the autonomy setting.
- Scheduling, messaging, or sending an action across devices requires user confirmation.
- The dashboard is a living Nora workspace rather than an analytics grid.

### Connectivity boundary

- Apple Watch communicates with the iPhone.
- The iPhone communicates with the shared backend and desktop dashboard.
- The dashboard must not create an independent Watch channel or bypass the phone.
- Existing mobile changes stay focused on secure, seamless connectivity unless a major implementation problem requires revisiting the boundary.
- Exact authentication, transport, data minimization, acknowledgement, and failure-recovery behavior will be resolved and verified during the technical specification stage.

### Visual direction

- Extend Somnora's established visual language to the web.
- Use image-led atmosphere, liquid-glass shells, transparent headers, restrained motion, and clear hierarchy.
- Avoid a generic analytics or administration-panel appearance.

### Participant shaping

- James directed the process to remain ambitious: "try not to think that any task is impossible if you know it is."
- James delegated architecture review unless major problems emerge.
- James explicitly constrained the device route: Watch to phone, then phone to the desktop ecosystem.
- James approved the proposed dashboard home, hero workflow, consent model, and supporting Grill Me flow.

### Interview record

- Onboarding Round 1 completed.
- Onboarding Round 2 completed.
- Optional aesthetics round skipped because the participant had already supplied a concrete look and feel.
- Deepening rounds: not applicable during onboarding.

## 2026-08-28 - Scope

### Product vision

- The desktop experience switches among Dream, Daily, and Eureka conversations while using the larger display to organize biometric, sleep, and analytic information.
- An About Me graph visualizes Nora's retrievable memories as an inspectable network formed from the user's submissions, thoughts, patterns, broken habits, recurring concerns, and responses to Nora's suggestions.
- The graph should feel like looking into a personal brain, with visible connections that resemble synapses without claiming to be a neurological model.
- Nora should use context to encourage appropriate real-world novelty, such as walking somewhere new, speaking with someone, or entering a new environment outside the user's comfort zone.
- The dashboard can host creative and reflective exercises. One proposed showcase exercise lets a user write insecurities on virtual paper and then deliberately burn the paper with a high-quality animation.
- The long-term emotional payoff is showing users how their mental-health journey and behavior have changed over time.

### Information views

- A dedicated analytics view organizes biometric and sleep charts already represented in the mobile experience.
- A separate themes view explores recurring thoughts and dreams across subjects, people, emotions, issues, and imagery.
- Dream imagery must be explored through the user's own associations and history, not presented as a universal symbol dictionary or diagnosis.

### Inspiration reactions

- Apple Continuity: strongest reference for secure, seamless, trustworthy device handoff.
- Obsidian Canvas: strongest reference for spatial, connected, explorable personal context.
- Oura and Whoop: useful reference for distilling complex signals, while Somnora should avoid making the primary workspace chart-heavy.

### Product tension to resolve

- James wants Nora to be meaningfully proactive and agentic, not merely a passive journal or dashboard.
- Proactivity must coexist with explicit consent, psychological safety, privacy, and explainable memory.
- James described the aspiration as "the Grok bot for mental health," meaning a direct, responsive, opinionated companion. The product must not imply therapy replacement, diagnosis, or unbounded autonomy.

### Approved scope cut

- Fully working: Eureka dry-spell workflow, one interactive About Me graph slice, one secure cross-device action and acknowledgement, and one paper-burning reflection exercise.
- Polished but seeded: Dream and Daily conversations, biometric and sleep analytics, themes, emotions, people, recurring concerns, and dream imagery.
- Supporting stretch: Grill Me after the hero loop is reliable.
- Deferred: complete live chat parity, comprehensive production ingestion, a universal memory graph, multiple creative exercises, Somnora Fitness, Somnora Nutrition, clinical scoring, and universal dream-symbol claims.
- James explicitly approved this cut and asked Codex to write the scope without an additional deepening round.

### Scope completion

- Mandatory scope beats completed.
- Additional deepening rounds: 0.
- Scope document: `docs/hackathon-build/scope.md`.
- New-work disclosure: the Workbench and cross-device ecosystem coordination began on 08-27-26; the existing iPhone and Watch apps are pre-existing product context.

## 2026-08-28 - PRD interview in progress

- The PRD will define visible user behavior and acceptance criteria without revisiting implementation choices.
- Scope guard remains 30 hands-on hours with the seeded three-device hero loop first.
- James approved the dashboard opening, About Me correction controls, visible device-delivery states, and private-by-default exercise behavior.
- The paper-burning interaction is one example within a wider proactive activity system, not the product's only interactive exercise.
- Existing breathing exercises should be represented as part of the ecosystem rather than claimed as newly created hackathon work.
- James approved the Nora Invitations model, the Three Beautiful Things hero activity, separate Autonomy and Stretch Level controls, and the proposed privacy and consent defaults.
- James requested autonomous continuation while away. Remaining PRD edge cases were resolved using conservative privacy, safety, accessibility, and scope defaults rather than pausing for another live interview.

### PRD completion

- Mandatory PRD beats completed.
- Additional deepening rounds: 0 live rounds. Conservative edge-case deepening was completed autonomously at the participant's request.
- Product requirements document: `docs/hackathon-build/prd.md`.
- The PRD keeps one complete agentic loop as the acceptance center and treats the broader activity library as seeded breadth or later work.

## 2026-08-28 - Technical specification

### Repository findings

- The iPhone already activates WatchConnectivity at process launch through `PhoneConnector`.
- The Watch already uses immediate messages with `transferUserInfo` fallbacks.
- The live Cloud Run proxy already verifies Firebase ID tokens and stores durable memory in Firestore.
- The iPhone's Nora proxy authentication commonly uses an anonymous Firebase user, while the separate product auth surface is not a verified shared Firebase identity.
- HealthKit and detailed sleep context are local and consent gated. The Workbench must not imply that all health data already exists in the backend.
- Existing proxy routes commonly use wildcard CORS. New Workbench relay routes require an explicit origin allowlist.
- The mobile repository is currently on `feat/journal-sharing-prompts-and-observations` with untracked `tmp/` content. No existing mobile files were changed during specification.

### Architecture decisions

- Web stack: React, TypeScript, Vite, React Flow, Recharts, Motion, and Firebase browser authentication.
- Development is local first. Firebase Hosting is the preferred static deployment after verification.
- A deterministic seeded repository and `DemoTransport` make the full dashboard recordable without network or hardware dependencies.
- The real relay links separately authenticated browser and iPhone identities through a short-lived, single-use pairing code.
- The iPhone remains the only bridge to Apple Watch.
- The relay carries a versioned action, progress count, and status only. Photo bytes, raw health data, memory evidence, and exercise text do not cross it.
- The first live relay uses short-lived foreground polling for demo reliability. Background push is later work.
- Real photo synchronization and real account data remain stretch goals.

### Spec completion

- Mandatory technical beats completed autonomously under the participant's instruction to continue while away.
- Additional deepening rounds: 1 autonomous architecture self-review.
- Technical specification: `docs/hackathon-build/spec.md`.

## 2026-08-28 - Build checklist

### Locked build preferences

- Plan ownership: Codex.
- Build mode: autonomous.
- User look-at pauses: none while James is away.
- Verification: automated and visual at every item.
- Check-in cadence: speed-run, surfacing only material blockers or milestone outcomes.
- Git cadence: verified scaffold, recordable dashboard MVP, verified relay, final QA.

### Sequencing decision

- The complete deterministic dashboard is built and recorded before backend or mobile integration.
- Backend security contracts are fixed and tested before iPhone and Watch code depends on them.
- Mobile work waits for an intentional branch base because the current repository is on an unrelated feature branch.
- The Three Beautiful Things loop and explainable About Me graph remain the submission wow moment previously approved by James.

### Checklist completion

- Checklist contains 12 sequenced verification checkpoints.
- Additional deepening rounds: skipped on the hand-off path.
- User gut-check was represented by the previously approved 30-hour scope cut and explicit request for autonomous continuation.
- Build checklist: `docs/hackathon-build/checklist.md`.

## 2026-08-28 - Build item 1

### Verified scaffold

- Created the isolated React, TypeScript, and Vite Workbench on `codex/workbench-guided-build`.
- Locked the package tree and corrected two compatibility boundaries without bypassing peer or engine checks: TypeScript 6.0.3 and jsdom 29.1.1.
- Reused and disclosed only approved Somnora backgrounds, launch branding, and privacy-safe demo field-note images.
- Added the web design mapping, CSS token baseline, unit, lint, type-check, production-build, and Playwright entry points.
- Verified `npm run typecheck`, `npm run test:run`, `npm run lint`, `npm run build`, and the Chromium bootstrap smoke test.
- Inspected a fresh 1440 by 900 rendered frame. The image background, scrim, glass rim, serif heading, demo disclosure, and focus baseline render correctly.
