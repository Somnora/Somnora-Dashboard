# Build Checklist

## Build Preferences

- **Plan ownership:** Codex. James supplied product direction and delegated architecture and sequencing unless a major problem appears.
- **Build mode:** Autonomous. This choice is locked for the current checklist.
- **Comprehension checks:** N/A.
- **Git:** Commit at four revert points: verified scaffold, recordable dashboard MVP, verified device relay, and final QA. Never mix unrelated Somnora mobile work into these commits.
- **Verification:** Automated and visual verification at every item. No user look-at pauses while James is away. Surface only major blockers, security problems, or product-changing decisions.
- **Check-in cadence:** Speed-run with concise milestone updates.
- **Scope ruler:** Approximately 30 hands-on hours. Seeded dashboard reliability comes before live account sync or real photo transfer.
- **Wow moment:** Nora explains a creative dry spell through the About Me graph, sends a Three Beautiful Things invitation through iPhone to Watch, receives acknowledgement, and turns the completed outing into a private Field Note.

## Sequencing Logic

1. Establish a clean, reproducible web baseline.
2. Make the whole dashboard recordable with deterministic demo data before touching backend or mobile integration.
3. Verify the visual and accessibility baseline while changes are still local to the Workbench repository.
4. Build the relay as an isolated security boundary with tests before connecting devices.
5. Add iPhone and Watch behavior only after the relay contracts are fixed.
6. End with integrated evidence and an honest Devpost handoff.

## Checklist

- [x] **1. Bootstrap the Workbench and verification baseline**
  Spec ref: `spec.md > Stack > Web application`, `spec.md > File Structure > New Workbench repository`
  What to build: Scaffold the Vite React TypeScript application in the existing Workbench repository, install locked dependencies, add lint, type-check, unit-test, production-build, and Playwright scripts, create `.env.example`, and establish the planned source folders. Copy only the approved pre-existing Somnora logo and background assets into documented web asset folders. Add a web design mapping that names the reused assets and forbids deprecated gradient tokens.
  Acceptance: The app renders a minimal accessible root; no real user data or secrets are present; reused assets are disclosed; the project can be installed and built from the lockfile.
  Verify: Run `npm ci`, `npm run typecheck`, `npm test -- --run`, `npm run build`, `git diff --check`, and inspect the first rendered browser frame.

- [x] **2. Define domain contracts, seeded profile, and pure state**
  Spec ref: `spec.md > Workbench State Layer`, `spec.md > Demo Data Adapter`, `spec.md > Data Flow > Startup Flow`
  What to build: Add typed profile, conversation, memory, theme, chart, invitation, pairing, and delivery models. Create the privacy-safe 30-day demo profile and reducer state. Implement the deterministic dry-spell policy, invitation adjustment rules, delivery transition guard, memory correction overlay, and safe persistence boundaries.
  Acceptance: The seeded profile supports all planned views; the dry spell deterministically produces Three Beautiful Things; invalid delivery transitions are rejected; burn text and private reflections have no persistent-storage path.
  Verify: Run focused Vitest suites for invitation policy, delivery state, persistence, memory overlay, and fixture validity, then run `npm run typecheck`.

- [x] **3. Build the Somnora desktop shell and visual token system**
  Spec ref: `spec.md > Web Presentation Layer`, `spec.md > Components And Responsibilities > AppShell`
  What to build: Translate the canonical iOS design rules into web CSS tokens, image backgrounds, scrims, glass surfaces, rim lighting, serif Nora voice, sans-serif chrome, coral primary actions, focus rings, and reduced-motion behavior. Build the navigation rail, transparent header, demo badge, device status, responsive content frame, and accessible modal foundation.
  Acceptance: Home, Conversations, About Me, Themes, and Analytics are reachable; the interface uses image backgrounds rather than the deprecated gradient; primary text remains legible; navigation and close controls work by keyboard; the shell fits 1440 by 900 and 1280 by 800 without clipping.
  Verify: Run component tests, Playwright keyboard smoke coverage, reduced-motion smoke coverage, and inspect screenshots at both target sizes.

- [x] **4. Implement Living Nora Home and invitation controls**
  Spec ref: `spec.md > Nora Invitations Engine`, `spec.md > Components And Responsibilities > InvitationCard And InvitationWorkspace`
  What to build: Render the four-day Eureka dry-spell observation, Three Beautiful Things card, Why this, Accept, Adjust, Not now, and Less like this behavior. Add separate Autonomy and Stretch Level controls with safe explanatory copy. Implement indoor, shorter, lower-energy, no-social, and alternate-activity adjustments.
  Acceptance: One recommendation dominates the first screen without scrolling; every invitation shows reason, time, energy, family, privacy, and alternatives; acceptance is explicit; adjustment produces a revised invitation that still requires acceptance; decline is neutral and non-punitive.
  Verify: Run Home and invitation component tests, keyboard through every action, inspect the first ten-second frame, and confirm no action dispatch occurs before acceptance.

- [x] **5. Implement the focused About Me graph and memory control**
  Spec ref: `spec.md > About Me Graph`, `spec.md > Data Flow > Why This Flow`, `spec.md > Data Flow > Memory Correction Flow`
  What to build: Render the authored React Flow graph with category-specific nodes and accessible labels. Add the evidence inspector, source type, date, representative evidence, focused Why this path, That's right, Not quite, and Forget this. Apply corrections as a session overlay and recompute the active explanation after forgetting evidence.
  Acceptance: The graph remains legible and bounded; user facts, Nora observations, and tentative interpretations are distinct; Why this highlights only relevant evidence; corrections visibly update the graph; forgotten evidence no longer supports the active invitation; reduced motion removes ambient drift.
  Verify: Run graph and memory-overlay tests, Playwright Why this and correction paths, keyboard inspection, and visual QA of full and reduced-motion states.

- [x] **6. Build the seeded ecosystem views**
  Spec ref: `spec.md > Charts And Themes`, `spec.md > Web Presentation Layer`
  What to build: Add Dream, Daily, and Eureka conversation switching, representative history, the Themes workspace for people, emotions, subjects, concerns, and imagery, and the Analytics workspace for seeded sleep and biometric charts. Include a visible growth comparison grounded in source entries without a mental-health score.
  Acceptance: Mode switching preserves in-session position; Eureka supports the hero context; Dream and Daily are clearly seeded; chart units and dates are readable; dream imagery is tentative and personal; no view makes a diagnosis or universal symbol claim.
  Verify: Run view-level tests, navigate every destination by keyboard, inspect chart labels and demo disclosure, and capture rendered screenshots for Conversations, Themes, and Analytics.

- [x] **7. Complete the deterministic Three Beautiful Things loop**
  Spec ref: `spec.md > Transport Adapter`, `spec.md > Data Flow > Invitation Dispatch Flow`, `spec.md > Data Flow > Mission Progress Flow`
  What to build: Implement `WorkbenchTransport`, deterministic `DemoTransport`, visible Pending, Delivered to iPhone, Delivered to Watch, Acknowledged, progress, completion, failure, retry, cancel, and expiry states. Build the mission workspace and privacy-safe Field Note with three bundled images and an optional Eureka reflection.
  Acceptance: The entire hero loop runs without network access; no state implies delivery before confirmation; progress reaches three once; duplicate completion does not create duplicate Field Notes; reflection is optional; simulated status is labeled as demo; refresh restores only safe demo progress.
  Verify: Run reducer and transport tests, run the Playwright hero flow from Home through Field Note, test failure and retry, refresh mid-flow, and inspect the completed Field Note frame.

- [x] **8. Build reflective activities and accessibility variants**
  Spec ref: `spec.md > Reflective Burn Exercise`, `spec.md > Security And Privacy Controls > Payload minimization`
  What to build: Add the private burn exercise with write, review, optional separate save, confirmation, full animation, reduced-motion dissolve, completion, and close cleanup. Represent the pre-existing breathing experience as a Reset invitation without claiming it as new. Add preview-only activity concepts for the other invitation families without false start controls.
  Acceptance: Burn text is not persisted, logged, added to memory, or present after completion; reduced motion contains no flame or particle movement; closing clears unsaved content; breathing is labeled as ecosystem continuity; unavailable activity concepts cannot be started.
  Verify: Run burn privacy and state tests, inspect browser storage before and after, run reduced-motion Playwright coverage, and visually inspect the full and accessible completion frames.

- [x] **9. Lock the recordable web MVP**
  Spec ref: `spec.md > Verification Matrix > Web end to end`, `spec.md > Demo And Submission Flow > Reliable recorded path`
  What to build: Complete responsive polish, calm empty and error states, focus management, contrast, motion tuning, copy review, screenshot fixtures, and a one-command local demo start. Add a README that distinguishes deterministic demo behavior from unimplemented live sync. Commit the verified dashboard MVP as a revert point.
  Acceptance: Every primary view is recordable; the complete demo works in a fresh browser session; no emoji or prohibited gradient appears; reduced-motion and keyboard paths remain complete; seeded and simulated behavior is disclosed; production build has no secret values.
  Verify: Run `npm run typecheck`, `npm test -- --run`, `npm run build`, the full Playwright suite, `git diff --check`, inspect every required screenshot, and perform a fresh-install smoke test from the lockfile.

- [ ] **10. Implement and security-test the scoped backend relay**
  Spec ref: `spec.md > Secure Pairing Relay`, `spec.md > Workbench Relay API`, `spec.md > Relay Firestore Model`, `spec.md > Security And Privacy Controls`
  What to build: In the existing Cloud Run proxy, add isolated pairing and action handlers, strict schemas, ID-token verification, server-derived roles, hashed single-use codes, expiry, rate limits, idempotency, monotonic statuses, minimal Admin-only Firestore documents, safe logs, and explicit Workbench origin allowlisting. Do not deploy until tests pass and source-deploy authorization is clear.
  Acceptance: Missing or invalid tokens fail; browser and phone cannot cross roles or pairings; reused and expired codes fail; invalid payloads, photo data, raw health data, arbitrary URLs, HTML, and oversized messages fail; unknown origins are not permitted; valid status transitions succeed idempotently.
  Verify: Run focused Node tests for all relay security cases, the existing proxy auth, rate-limit, privacy, and logging tests, then the full proxy suite and `git diff --check`. Review the final backend diff before any source deployment.

- [ ] **11. Implement the iPhone and Watch relay vertical slice**
  Spec ref: `spec.md > iPhone Workbench Bridge`, `spec.md > Apple Watch Invitation Surface`, `spec.md > Data Flow > Pairing Flow`
  What to build: On a dedicated mobile branch, add versioned relay models, authenticated iPhone API client, pairing sheet, foreground pending-action poll, compact iPhone mission state, WatchConnectivity relay extension, Watch invitation model and view, acknowledgement, progress, completion, duplicate coalescing, reachable send, and background fallback. Reconcile all target membership without touching unrelated mobile behavior.
  Acceptance: iPhone claims a code using its Firebase ID token; only allowlisted versioned actions are accepted; Watch receives no backend token; iPhone remains the bridge; offline and unreachable states remain honest; duplicate messages create one activity; unrelated mobile behavior and the user's `tmp/` directory remain untouched.
  Verify: Run focused Swift unit tests, Watch message tests, status-transition tests, a serialized `make build`, relevant Xcode test destinations, `git diff --check`, and running iPhone and Watch simulator or hardware QA. Inspect the mobile diff before commit.

- [ ] **12. Verify the integrated demo and prepare Devpost handoff**
  Spec ref: `spec.md > Verification Matrix > Integrated demo`, `spec.md > Demo And Submission Flow`, `prd.md > Submission Proof Points`
  What to build: Exercise real pairing and acknowledgement if the relay is verified, retain deterministic transport as the disclosed fallback, capture final dashboard, iPhone, and Watch frames, document setup and demo instructions, record tested versus seeded versus pre-existing behavior, prepare the new-work disclosure, gather repository links, and assemble the story and artifacts required for submission prep.
  Acceptance: The recordable fallback is intact; every claimed live step is freshly verified; simulated steps are labeled; security evidence is summarized without exposing secrets; screenshots clearly show the wow moment; the handoff states that Workbench work began 08-27-26 and distinguishes existing Somnora surfaces.
  Verify: Run all web, proxy, and focused mobile checks; perform final rendered-frame QA; review the demo from start to finish; confirm `git diff --check`; confirm the handoff has title, one-line pitch, architecture summary, built-with list, screenshots, demo instructions, testing notes, limitations, and new-versus-existing disclosure; confirm the next command is `$prepare-submission`.

## Deferred After This Checklist

- Real photo-byte synchronization and cloud retention.
- Production background push delivery.
- Full account migration or cross-platform Sign in with Apple linking.
- Full live Dream, Daily, and Eureka parity.
- Comprehensive memory and health ingestion.
- Complete Grill Me behavior.
- External maps, weather, calendar, and event integrations.
- Somnora Fitness and Somnora Nutrition adapters.
