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

## 2026-08-28 - Build items 2 through 4

### Deterministic product core

- Added a privacy-safe 30-day profile covering Dream, Daily, Eureka, themes, biometrics, memory evidence, and the local Field Note assets.
- The seeded profile has a deterministic four-day Eureka gap and grounded prior evidence linking walks and scene changes to returning curiosity.
- Added pure invitation, adjustment, delivery-transition, memory-overlay, reducer, and bounded-persistence contracts.
- Verified that impossible device states, decreasing progress, and forgotten memory evidence are rejected or removed as designed.

### Desktop shell and Living Nora Home

- Built the full navigation rail, transparent destination header, seeded-demo disclosure, device-status shell, image backgrounds, glass surfaces, focus system, and reduced-motion baseline.
- Built the first-screen Three Beautiful Things invitation with reason, duration, energy, privacy boundary, Why this, Accept, Adjust, Not now, and Less like this behavior.
- Added independent Autonomy and Stretch Level controls. Quiet autonomy holds proactive invitations; adjustment creates a revised invitation that still waits for acceptance.
- Acceptance records consent only. Device delivery remains idle until the transport milestone.
- Verified 16 unit and component tests plus five browser checks. Inspected 1440 by 900 and 1280 by 800 frames with no horizontal clipping or hero-card overflow.

## 2026-08-28 - Build items 5 and 6

### About Me graph

- Built an authored React Flow graph with 18 memory nodes and 18 visible connections.
- Distinguished user-confirmed facts, Nora observations, tentative interpretations, and growth markers through text and color.
- Why this focuses the invitation path while unrelated memories remain spatially visible but recede.
- Added an evidence inspector with source type, date, excerpt, confidence context, That's right, Not quite, and a confirmed Forget this flow.
- Corrections remain session overlays. Forgetting the movement memory removes the node, its edges, and two supporting evidence records from the active invitation explanation.
- Browser QA caught and fixed a React Flow pointer-layer issue. Pointer and keyboard node inspection now both pass.

### Seeded ecosystem views

- Built Dream, Daily, and Eureka conversation switching with retained in-session mode and scroll positions.
- Built a Themes workspace for people, emotions, subjects, concerns, imagery, and a grounded growth comparison without a mental-health score.
- Dream imagery explicitly remains personal and tentative rather than a universal symbol claim.
- Built seeded sleep and HRV charts with dates and units, plus sleep, restful percentage, resting heart rate, and HRV summaries.
- Disabled chart path animation for stable recording and immediate reduced-motion-safe rendering.
- Verified 21 unit and component tests plus ten browser paths. Inspected Conversations, Themes, Analytics, and the focused About Me graph at 1440 by 900.

## 2026-08-28 - Build item 7

### Deterministic hero loop

- Added the `WorkbenchTransport` contract and an offline `DemoTransport` with guarded, monotonic delivery states.
- The accepted invitation remains idle until a second explicit send action starts the labeled simulation.
- Implemented pending, iPhone delivery, Watch delivery, acknowledgement, in-progress, completion, failure, retry, cancellation, and expiry behavior.
- Added safe session recovery containing action status and progress only. It does not contain photo bytes, reflections, memory evidence, or exercise text.
- Built the three-photo mission and one privacy-safe Field Note from bundled demo images. Duplicate completion remains idempotent and creates one Field Note.
- Verified transport and reducer behavior plus four browser hero paths, including refresh recovery and failure handling.

## 2026-08-28 - Build item 8

### Reflective activities

- Built the private burn exercise with write, review, explicit burn confirmation, immediate text clearing, full visual burn, reduced-motion dissolve, optional separate reflection, and close cleanup.
- Confirmed burn and reflection text have no logging or browser-storage path and are cleared when the exercise closes.
- Labeled the breathing reset as pre-existing Somnora continuity rather than new hackathon work.
- Added preview-only cards for Tiny Detour, Sound Map, One Honest Question, Unsent Postcard, and Color Hunt without false start controls.
- Verified burn privacy and state behavior in unit tests and three browser paths, including the reduced-motion alternative.

## 2026-08-28 - Build item 9

### Recordable dashboard MVP

- Added destination-level code splitting so Home loads without the React Flow and chart bundles. The production build now has no oversized initial chunk warning.
- Corrected modal context labels, added unique accessible names, contained keyboard focus, restored prior focus on close, and preserved Escape behavior.
- Reset both root and workspace scroll positions on destination and mission-stage changes. Visual QA caught and fixed a clipped Field Note recording state.
- Restored React Flow's default visible attribution and added a browser-console gate across every primary destination.
- Added `npm run demo` for one-command local startup, `npm run screenshots` for deterministic visual fixtures, and a README with exact new-versus-existing and simulated-versus-live boundaries.
- Reinstalled 402 packages from the lockfile with zero reported vulnerabilities.
- Verified 26 unit and component tests, 20 functional browser tests, one visual fixture path, type checking, lint, production build, and `git diff --check`.
- Inspected Home at 1440 by 900 and 1280 by 800, focused About Me, Conversations, Themes, Analytics, consent, acknowledged delivery, the complete Field Note with three loaded images, burn review, burn motion, burn completion, and the activity library.
- Scanned shipped source for prohibited Somnora background tokens, emoji, en and em dashes, and common secret signatures. No prohibited source token or credential was found.

## 2026-08-28 - Build item 10

### Verified scoped backend relay

- Built the relay in the isolated Somnora worktree `/Users/jamesmcshane/Desktop/Somnora-Relay-Worktree` on `codex/workbench-relay`, leaving the user's active mobile branch and untracked `tmp/` content untouched.
- Added Firebase-only Workbench routing before the proxy's legacy wildcard CORS boundary. Workbench routes use an exact origin allowlist, no-store responses, content-type hardening, and a deny-by-default response content policy.
- Added strict versioned schemas for one allowlisted Three Beautiful Things action. Unknown fields, arbitrary URLs, HTML, photo data, raw health data, control characters, invalid dates, and payloads over 2 KB fail closed.
- Added random six-digit pairing codes protected by HMAC at rest, ten-minute single-use expiry, two-hour pairing and action bounds, revocation, server-derived browser and phone roles, and no Watch backend credential.
- Added Admin-only Firestore adapter paths for code hashes, pairings, and nested actions. Delivery can resume from pending, iPhone-delivered, Watch-delivered, or in-progress states after an iPhone foreground restart.
- Added scoped endpoint quotas using the existing Redis limiter, idempotent action creation, monotonic status transitions, progress bounds, duplicate completion safety, browser-only relay cancellation, and safe hashed identifier logging.
- Added deployment documentation that requires a managed pairing secret, exact production origin, direct Firestore client-access denial, and explicit source-deploy authorization. No deployment was performed.
- Verified syntax checks and focused relay, Firestore adapter, authentication, CORS, role-isolation, expiry, rate-limit, privacy, and logging tests.
- Ran the complete proxy suite on Node 22.23.2: 163 tests passed with zero failures, skips, or cancellations.
- Verified `git diff --check`, common credential scans, raw-content logging scans, and final staged-diff review before committing backend revert point `4feda019`.

## 2026-08-28 - Build item 11

### Verified iPhone and Apple Watch relay slice

- Built the mobile slice in the isolated worktree on `codex/workbench-device-slice`, preserving the user's active Somnora branch and untracked `tmp/` directory.
- Added a Firebase-authenticated iPhone relay client, short-lived pairing UI, foreground polling coordinator, bounded response checks, protocol and action allowlists, and monotonic status validation.
- Added a minimal WatchConnectivity contract containing only action identity, activity type, title, prompt, target count, expiry, protocol version, and progress status. The Apple Watch receives no backend token, browser credential, health data, photo bytes, journal data, or memory evidence.
- Added reachable Watch delivery with an explicit receipt, background transfer fallback, duplicate coalescing, local file-protected invitation recovery, cancellation, expiry, progress, and completion.
- Added iPhone and Apple Watch views using the existing Somnora visual systems, with honest queued and acknowledged states and no new use of deprecated background tokens.
- Reconciled Xcode target membership and repaired the project-membership helper so it is repository-relative, quotes paths safely, and remains idempotent in an isolated worktree.
- Verified the complete iOS and Watch build through `make concurrency-check`; the build succeeded for both simulator architectures and the concurrency ratchet reported no new actor or sendability warnings.
- Verified `make quality-gate`, project parsing, membership-script idempotence, `git diff --check`, credential and prohibited-token scans, and focused simulator tests: 12 passed with zero failures or skips.
- Committed the device revert point as `c7b026f7`. The relay source remains undeployed, and physical iPhone and Apple Watch behavior has not yet been claimed as live-verified.

## 2026-08-28 - Build item 12

### Integrated evidence and Devpost handoff

- Added the optional browser `RelayTransport`, lazy Firebase anonymous authentication, short-lived pairing-code UI, rate-limit-safe status polling, strict response validation, monotonic live-state reconciliation, and clear demo versus relay labels.
- Kept `DemoTransport` as the default recordable path. The seeded profile and offline hero loop remain independent of Firebase, Cloud Run, iPhone, Apple Watch, and network availability.
- Added focused relay tests for authenticated minimal requests, pairing, action mapping, unsupported action rejection, response-size enforcement, and missing-token failure.
- Regenerated and inspected final Home, focused About Me, acknowledged handoff, completed Field Note, burn, and ecosystem screenshots.
- Launched the new invitation surface on an actual watchOS 26.5 simulator using a privacy-safe invitation stored only in simulator preferences. The captured frame shows Nora's invitation, progress target, and Start control.
- A fresh iPhone CI launch using the placeholder Firebase configuration did not produce a useful pairing-sheet frame. The handoff identifies existing iPhone screenshots only as pre-existing ecosystem context and requires a properly configured iPhone capture before final video assembly.
- Added `docs/hackathon-build/devpost-handoff.md` with the title, pitch, architecture, built-with list, demo path, screenshot inventory, test evidence, limitations, security summary, repository references, claim guardrails, and new-versus-existing disclosure.
- Confirmed the submission project start date is 08-27-26 for the new Workbench and cross-device coordination. The original Somnora iPhone and Watch apps are explicitly disclosed as pre-existing.
- Final Workbench verification: 31 unit and component tests passed, lint passed with no warnings, production build passed, 20 functional Playwright tests passed, and the visual fixture suite passed.
- Final proxy verification: 163 tests passed with zero failures, skips, or cancellations.
- Mobile verification remains 12 focused tests passed plus successful full iOS and Watch build, concurrency ratchet, quality gate, target-membership check, and diff review.
- No backend or web deployment was performed. Real deployed pairing, real iPhone pairing UI, physical Watch handoff, and complete live acknowledgement remain unverified and are not submission claims.

## 2026-08-28 - Ecosystem expansion step 2

### Generalized Nora Action Runtime

- Replaced the hero-specific transport contract with a reusable versioned action contract covering typed input, explicit single-action consent, allowed route, progress target, expiry, cancellation, and outcome.
- Registered Three Beautiful Things, Breathing Reset, Six Line Story, and Tiny Detour without exposing unfinished controls or claiming that all four have live device adapters.
- Kept iPhone as the only Watch bridge. Workbench-only, iPhone, and Watch-through-iPhone routes are validated per action type.
- Added guarded lifecycle and snapshot validation for identity, contract matching, timestamp order, progress bounds, monotonic transitions, expiry, and completion.
- Added privacy-safe outcomes. Completion waits for a separate user memory choice, while failure, cancellation, and expiry are not eligible for memory.
- Refactored the deterministic demo and optional relay transports under the same runtime. The existing live relay remains explicitly limited to Three Beautiful Things protocol version 1.
- Added a visible runtime summary to the accepted and active hero states so consent, route, progress boundary, and memory policy are inspectable during the demo.
- Extended safe session recovery with bounded status metadata only. Prompts, consent receipts, private writing, photos, health data, and memory evidence remain outside browser storage.
- Added `docs/action-runtime.md` as the implementation and trust-boundary reference.
- Verified 45 unit and component tests, lint, type checking, production build, 21 functional browser tests, one visual fixture path, and `git diff --check`. Fresh consent and acknowledged handoff frames were inspected at 1440 by 900.

## 2026-08-28 - Ecosystem expansion step 3

### Nora Action Desk

- Added Action Desk as a primary Workbench destination while preserving Home as Nora's focused current judgment.
- Added a typed, pure selector that turns the current invitation and action runtime into one inspectable record without creating a second execution state machine.
- Separated Noticed, Proposed, Approved, Active, Completed, Failed, Declined, and Stopped language so user intent, device confirmation, and Nora observation cannot collapse into one ambiguous status.
- Added privacy-safe seeded history for completed Breathing Reset, failed Tiny Detour, and declined Six Line Story examples. These records are visibly labeled seeded and are not presented as synchronized production history.
- Added filters for all records, actions needing the user, active actions, closed actions, and noticed signals.
- Added an inspector for authority, consent, route, progress, source, memory, and privacy boundaries.
- Current records can route to supporting About Me context or back to Home. The Desk cannot start, send, schedule, message, or write an outcome to memory.
- Added `docs/action-desk.md` as the product and trust-boundary reference.
- Browser QA caught a shared Field Note focus-scroll issue after the longer navigation sequence. Changing the decorative card crop from a hidden scroll container to a clipped container removed the nested horizontal scroll path and restored the complete Field Note frame.
- Verified 49 unit and component tests, lint, type checking, production build, 24 functional browser tests, and one visual fixture path. Fresh Action Desk and completed Field Note frames were inspected at 1440 by 900.

## 2026-08-28 - Ecosystem expansion step 4

### Consent and Autonomy Console

- Added Consent as a primary Workbench destination with a dedicated governance surface rather than hiding domain permissions inside general settings.
- Added typed Off, Observe, Suggest, and Prepare boundaries for Dream, Daily, Eureka, Sleep, Activity, Fitness, and Nutrition.
- Kept consequential actions locked to Ask every time. Autonomy controls surfacing frequency, Stretch Level controls invitation intensity, and neither grants execution authority.
- Added a domain inspector for current capability, source state, data boundary, and the exact meaning of preparation.
- Marked Fitness and Nutrition as disconnected future adapters. Their controls remain Off and cannot be elevated until a real connector exists.
- Enforced the policy in the current hero flow. Restricting suggestion access holds the invitation, while Suggest without Prepare allows review but blocks device-action creation.
- Repeated the preparation check in the Workbench provider so action creation cannot bypass the visible control surface.
- Preserved consent already attached to an active action. New policy applies to future suggestions and preparations, while existing activity remains cancellable and visible in Action Desk.
- Extended safe preference persistence with compact policy enums only and a backward-compatible migration for older Autonomy and Stretch records.
- Added `docs/consent-console.md` as the governance and privacy reference.
- Verified 59 unit and component tests, lint, type checking, production build, 27 functional browser tests, and one visual fixture path. Fresh Consent Console frames were inspected at 1440 by 900 and 1280 by 800.

## 2026-08-28 - Ecosystem expansion step 5

### Growth Without Gamification

- Added Growth as a primary Workbench destination with a dedicated then and now narrative surface rather than another analytics scorecard.
- Added typed, pure growth-story assembly for a user-confirmed boundary, returned curiosity, and agency across a declined activity and a completed experiment.
- Kept every story connected to its source, confidence, seeded-data boundary, and related Workbench destination. Observed scene-change patterns remain explicitly non-causal.
- Added equal This feels true, Not yet, and Needs nuance controls. A no or correction carries no penalty and can remain part of the visible story.
- Kept growth reviews in current reducer memory only. They do not enter browser storage, the relay, or durable Nora memory.
- Returned user review to the universal Context Timeline as session-only context.
- Reused About Me forgetting boundaries. A growth comparison disappears when its supporting memory evidence is forgotten.
- Removed the earlier static growth card from Themes so recurring motifs and personal change remain distinct workspaces.
- Added `docs/growth-without-gamification.md` as the product, evidence, and privacy reference.
- Verified 64 unit and component tests, lint, type checking, production build, 29 functional browser tests, and one visual fixture path. Fresh Growth frames were inspected at 1440 by 900 and 1280 by 800, including the Needs nuance state.

## 2026-08-28 - Ecosystem expansion step 6

### Activity Studio

- Replaced the small Home preview library with Activity Studio as a primary Workbench destination across Discover, Connect, Create, Reflect, and Reset.
- Added a typed activity catalog and deterministic fit matcher for time, energy, movement, social bandwidth, seeded weather, privacy, and alternate versions.
- Kept browsing separate from consent. No activity starts when the user opens the Studio, changes a filter, selects a card, or reviews an alternate version.
- Added honest availability states. Six Line Story and Private Release are interactive in the Workbench, Three Beautiful Things returns to the consent-based Home flow, Breathing Reset is labeled pre-existing Somnora continuity, and concept-only ideas have no start control.
- Added a private Six Line Story exercise with six bounded lines, no scoring or Nora judgment, no storage or relay writes, and clear-on-close behavior.
- Kept the existing private burn exercise available from both Home and Activity Studio without changing its text-clearing boundary or reduced-motion path.
- Added `docs/activity-studio.md` as the product, matching, consent, and privacy reference.
- Verified 70 unit and component tests, lint, type checking, production build, 31 functional browser tests, and one visual fixture path. Fresh Activity Studio frames were inspected at 1440 by 900 and 1280 by 800, plus the Six Line Story modal at 1440 by 900.
