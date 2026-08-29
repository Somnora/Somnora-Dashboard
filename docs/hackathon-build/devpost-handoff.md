# Somnora Desktop Workbench Devpost Handoff

## Submission identity

**Title:** Somnora Desktop Workbench

**One-line pitch:** An explainable, consent-controlled Nora dashboard that turns personal patterns into a real-world creative invitation and carries progress securely from Workbench to iPhone to Apple Watch.

**Project start date for this submission:** 08-27-26

This date applies to the new Somnora Desktop Workbench and the new cross-device ecosystem coordination created for the hackathon. Somnora's existing iPhone and Apple Watch applications predate the submission period and must be disclosed as pre-existing product context. Do not enter the original Somnora project start date as the start date of this Workbench submission, and do not describe pre-existing mobile surfaces as newly created.

## What the project demonstrates

Nora notices that the seeded user's Eureka thread has been quiet for four days. She explains the observation through an inspectable About Me memory path, checks energy and consent boundaries, and proposes a short Three Beautiful Things walk. The user can accept, adjust, or decline it. After explicit acceptance, the recordable path demonstrates the invitation moving through iPhone to Apple Watch, records three discoveries, and closes the loop in a private Field Note.

The wider dashboard shows how Somnora can become an ecosystem rather than a collection of separate apps. Dream, Daily, and Eureka conversations, personal themes, sleep and readiness context, visible growth, and reflective activities share one coherent desktop workspace. Future Somnora Fitness and Somnora Nutrition products can enter through the same consent and context boundaries without sending raw data indiscriminately.

## Architecture summary

1. The React Workbench renders a privacy-safe seeded profile and deterministic Nora invitation policy.
2. About Me presents an authored, inspectable memory graph with source evidence, confirmation, correction, and forgetting controls.
3. `DemoTransport` provides the reliable offline recording path and labels every device state as simulated.
4. Optional `RelayTransport` signs the browser into Firebase as a separate principal and requests a short-lived six-digit pairing code.
5. The existing Cloud Run proxy verifies Firebase ID tokens, derives browser and phone roles on the server, stores only HMAC-protected pairing codes, and enforces bounded action schemas and monotonic statuses.
6. The iPhone claims the code with its own Firebase identity, polls only while foregrounded, validates the action again, and sends the compact invitation through WatchConnectivity.
7. Apple Watch receives no backend credential. It acknowledges, reports progress to iPhone, and iPhone returns only status and count to the relay.
8. Photo bytes, raw HealthKit data, journal entries, memory evidence, and private exercise text remain outside the relay.

## Built with

- React 19 and TypeScript
- Vite
- React Flow
- Recharts
- Motion
- Firebase Authentication
- Node.js Cloud Run proxy
- Firestore Admin SDK
- Redis-backed rate limiting with the proxy's existing fallback behavior
- SwiftUI
- WatchConnectivity
- Browser Geolocation API
- Open-Meteo forecast API
- Local ICS calendar parsing
- XCTest, Vitest, React Testing Library, and Playwright
- Codex guided build workflow

## New work created for the hackathon

- Somnora Desktop Workbench shell and responsive liquid-glass visual system
- Living Nora Home and consent-controlled Nora Invitations
- Three Beautiful Things dry-spell hero loop
- Explainable About Me graph and memory correction controls
- Seeded Dream, Daily, Eureka, Themes, and Analytics workspaces
- Universal Context Timeline and consent-inspectable Nora Action Desk
- Consent and Autonomy Console with enforced domain permission boundaries
- Growth workspace with source-linked then and now comparisons and user-owned review
- Generalized Nora action runtime with typed consent, route, progress, expiry, and outcome contracts
- Capacity-aware Activity Studio with honest interactive, continuity, and concept states
- Permissioned Context Sources with one-time weather, local calendar availability, seeded events, and disconnected future adapters
- Private Six Line Story and burn exercises with temporary text boundaries
- Deterministic cross-device demo transport and private Field Note
- Authenticated Workbench relay with role isolation, expiry, idempotency, rate limits, and safe logs
- iPhone pairing, relay polling, compact mission state, and Watch bridge
- Apple Watch invitation, acknowledgement, progress, completion, cancellation, expiry, and duplicate coalescing
- Optional authenticated browser `RelayTransport` and short-lived pairing code UI

## Pre-existing Somnora context

- The Somnora iPhone application and its Dream, Daily, Eureka, Mindful, and analytics surfaces
- The Somnora Apple Watch application and its existing capture and breathing experiences
- The production Nora proxy and existing Firebase authentication foundation
- Existing Somnora background art, logo, typography direction, and mobile design system

The Workbench reuses approved visual assets and extends existing device boundaries. The submission should show the whole ecosystem, while clearly identifying the desktop experience and cross-device coordination as the new project.

## Recommended recorded demo

1. Open the Workbench at 1440 by 900 in default demo mode. Point out the visible Seeded demo badge.
2. On Home, show Nora's four-day Eureka observation and open Why this.
3. In About Me, show the focused evidence path and one memory correction control.
4. Return to Home, accept Three Beautiful Things, and state that acceptance and device delivery are separate decisions.
5. Send the invitation. Let the labeled simulation confirm iPhone, Watch, and acknowledgement states.
6. Cut briefly to the real watchOS simulator frame showing the new Nora invitation and Start control.
7. Complete the three discoveries in the deterministic path and reveal the private Field Note.
8. Open Growth and show a source-backed comparison, then mark one story Needs nuance to demonstrate user authority without gamification.
9. Show Conversations, Themes, and Analytics quickly to establish the wider ecosystem.
10. Open Consent Console and show that each domain has a maximum Observe, Suggest, or Prepare boundary while consequential actions stay Ask every time.
11. Open Action Desk and show the separation between what Nora noticed, what she proposed, and what the user authorized.
12. Open Context Sources and show that every outside signal exposes source, freshness, permission, failure, reason, and retention boundaries. Keep the reliable take seeded, or deliberately request one-time weather context.
13. Open Activity Studio, apply current context, and reduce available time and energy so Nora adapts Six Line Story to One breath lines.
14. Begin the private exercise, point out that it starts only after the click and stores no lines, then close and clear it.
15. End with the private burn interaction as the final visual beat.

## Screenshot and capture inventory

### New Workbench frames

- `screenshots/local/home-1440.png`
- `screenshots/local/about-me-focused-1440.png`
- `screenshots/local/hero-acknowledged-1440.png`
- `screenshots/local/field-note-1440.png`
- `screenshots/local/burn-animation-1440.png`
- `screenshots/local/activity-studio-1440.png`
- `screenshots/local/activity-studio-1280.png`
- `screenshots/local/six-line-story-1440.png`
- `screenshots/local/context-sources-1440.png`
- `screenshots/local/context-sources-1280.png`
- `screenshots/local/action-desk-1440.png`
- `screenshots/local/consent-console-1440.png`
- `screenshots/local/consent-console-1280.png`
- `screenshots/local/growth-1440.png`
- `screenshots/local/growth-1280.png`
- `screenshots/local/growth-reviewed-1440.png`

### New Apple Watch frame

- `screenshots/local/watch-invitation.png`
- Source: actual watchOS 26.5 simulator running the new Watch invitation code with a privacy-safe invitation stored in simulator preferences.

### Pre-existing iPhone ecosystem context

- `/Users/jamesmcshane/Desktop/Somnora-Relay-Worktree/docs/artifacts/screenshots-wellness-orchestrator/01-dream-journal-morning-entry.png`
- `/Users/jamesmcshane/Desktop/Somnora-Relay-Worktree/docs/artifacts/screenshots-wellness-orchestrator/07-mindful-action-plan-controls.png`
- These frames are pre-existing Somnora context, not hackathon-created Workbench proof.

The fresh iPhone CI launch with a placeholder Firebase configuration did not produce a useful app frame. Do not represent it as visual proof of the new pairing sheet. Capture the pairing sheet on a properly configured simulator or real iPhone before final video assembly.

## Verification evidence

### Workbench

- TypeScript type check passed.
- ESLint passed.
- 76 Vitest unit and component tests passed.
- Production build passed.
- 33 Playwright functional browser tests passed.
- One Playwright visual fixture suite passed and regenerated all target frames.
- Home, focused About Me, acknowledged delivery, completed Field Note, Action Desk, Consent Console, Growth, Activity Studio, Context Sources, and Six Line Story frames were visually inspected at the final code state.

### Backend relay

- Full Node proxy suite passed: 163 tests, zero failures, skips, or cancellations.
- Coverage includes authentication, CORS, separate roles, code hashing and reuse, expiry, revocation, strict schemas, payload limits, idempotency, rate limits, status transitions, safe logging, and Firestore behavior.
- No source deployment was performed.

### iPhone and Apple Watch

- Focused relay and Watch message suite passed: 12 tests, zero failures or skips.
- Full iOS and Watch simulator build passed through the concurrency quality gate.
- Swift quality ratchet passed with no new lint debt.
- The new Apple Watch invitation was launched and visually inspected on a watchOS 26.5 simulator.
- Real iPhone pairing, physical Watch handoff, deployed browser pairing, and end-to-end acknowledgement remain unverified and must not be claimed as live.

## Security summary

- Every relay endpoint requires a verified Firebase ID token.
- Browser and iPhone authenticate separately and are linked only through a short-lived scoped pairing.
- Pairing codes are random, single use, ten-minute bounded, and HMAC protected at rest.
- Pairings and actions expire after at most two hours and can be revoked or cancelled.
- The relay accepts one versioned action type and rejects unknown fields, URLs, HTML, control characters, oversized messages, raw health data, photos, and arbitrary content.
- Apple Watch communicates only with iPhone and receives no backend token.
- Logs contain safe identifiers and state metadata, not tokens, pairing codes, prompt content, health data, journal content, or memory evidence.

## Known limitations

- The reliable demo uses a seeded profile and labeled simulated delivery states.
- The relay source is implemented but not deployed.
- No real Somnora account synchronization is included.
- Photo bytes remain on iPhone. The Workbench Field Note uses bundled privacy-safe images.
- HealthKit and detailed biometric records are not transferred to the web.
- Current weather requires a deliberate one-time browser location request. Calendar import is local and account synchronization is not implemented.
- Local event options are fictitious demo fixtures. Live event discovery, Fitness, and Nutrition connectors are not implemented.
- Background push delivery is deferred. The iPhone relay polls only while foregrounded.
- Browser and iPhone use separately authenticated Firebase principals instead of full Sign in with Apple account linking.
- The Workbench repository currently has no Git remote. Publish it and add the final repository URL before submission.

## Repository and commit references

- Existing iOS and backend repository: `https://github.com/Somnora/somnora-ios.git`
- Secure backend relay commit: `4feda019`
- iPhone and Apple Watch relay commit: `c7b026f7`
- Workbench MVP commit: `728dca1`
- Workbench final QA commit: `ea6a6f0`
- Workbench public repository URL: pending

## Submission claim guardrails

- Say **implemented and tested locally** for the relay, iPhone bridge, and Watch invitation.
- Say **seeded** for profile, conversations, themes, analytics, About Me evidence, and Field Note images.
- Say **simulated** for the default dashboard delivery timeline.
- Say **pre-existing** for the original Somnora iPhone and Apple Watch apps and existing breathing experience.
- Say **not deployed and not live-verified** for the authenticated three-device relay.
- Do not describe Somnora as a therapist, medical device, diagnostic tool, or replacement for professional care.
