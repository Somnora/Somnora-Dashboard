# Somnora Desktop Workbench

Somnora Desktop Workbench is a cross-device companion for Somnora on iPhone and Apple Watch. A paired account can load real Dream, Daily, and Eureka history, continue those conversations with Nora, inspect an account-backed About Me graph, and hand consented activities to iPhone and Watch.

This repository contains the new hackathon Workbench. The existing Somnora iPhone and Watch apps predate the submission period. The Workbench and the new cross-device ecosystem coordination were started on 08-27-26.

## Run the live Workbench

Requirements: Node.js 24 or another runtime supported by Vite 8.

```bash
npm ci
npm run demo
```

Copy `.env.example` to `.env.local` and add the public Firebase web configuration for the Somnora Firebase project. Open `http://127.0.0.1:4173`, generate a six-digit code, and enter it in Somnora on iPhone. The browser keeps the revocable link for 30 days.

The live path uses the same authenticated Somnora backend and Nora model stack as iPhone. Apple Watch remains connected through iPhone. It never talks directly to the browser.

Recommended live product path:

1. On Home, open **Why this** to reveal the evidence path in About Me.
2. Return Home, accept **Three Beautiful Things**, then explicitly send the invitation.
3. Start the simulated activity and add the three privacy-safe demo photographs.
4. Open Consent Console to show domain-specific Observe, Suggest, and Prepare boundaries with consequential actions locked to Ask every time.
5. Open Action Desk to show the difference between what Nora noticed, what she proposed, and what you authorized.
6. Open Growth to compare a sustained boundary, returned curiosity, and user-chosen activities without a score.
7. Open Context Sources to show permission, freshness, failure, and retention boundaries. Keep the reliable recording seeded, or deliberately request one-time weather context.
8. Open Activity Studio, apply current context, reduce time and energy, and show Nora selecting the One breath lines version of Six Line Story.
9. Begin the story to demonstrate an explicitly started, temporary creative exercise, then close and clear it.
10. Open Conversations, continue a Watch or iPhone thread with Nora, then open About Me to inspect live account context.
11. Return Home and open the private burn exercise as the final visual beat.

## What is working

- Secure six-digit linking between a browser session and the authenticated iPhone account, followed by a revocable 30-day device link.
- Bidirectional, offline-first iPhone synchronization for Dream, Daily, and Eureka conversation history, including Watch voice provenance and Workbench continuations pulled back to the phone.
- Live conversation continuation with Nora through the same backend model, RAG, memory, and safety path used by the phone.
- A bounded, account-backed About Me graph with confirmation, correction, and forgetting controls.
- A universal Context Timeline and a calm Action Desk that make source provenance, consent, route, progress, outcome, and memory boundaries inspectable.
- A source-linked Growth workspace where the user can confirm, defer, or qualify then and now comparisons without points, streak pressure, disclosure rewards, or durable memory writes.
- A capacity-aware Activity Studio across Discover, Connect, Create, Reflect, and Reset. It adapts variants to time, energy, movement, social bandwidth, weather, and privacy while separating interactive features, mobile continuity, and concept previews.
- A permissioned Context Sources workspace with one-time browser location for current Open-Meteo weather, local-only ICS availability summaries, privacy-safe seeded event options, and explicit disconnected Fitness and Nutrition adapters.
- A Consent and Autonomy Console with enforced per-domain Off, Observe, Suggest, and Prepare limits. Fitness and Nutrition remain visibly disconnected future adapters.
- A generalized Nora action runtime with typed contracts for Three Beautiful Things, Breathing Reset, Six Line Story, and Tiny Detour. Only Three Beautiful Things currently has a live relay adapter.
- A complete offline `DemoTransport` state machine labeled as simulated, including consent, iPhone delivery, Watch delivery, acknowledgement, progress, failure, retry, cancellation, expiry, and refresh recovery.
- A private Field Note using bundled demo assets. Photo bytes are not transferred.
- A private burn exercise whose text remains in component memory and is cleared before animation, with a reduced-motion alternative.
- A private Six Line Story exercise whose six lines stay in temporary component memory, receive no grading, and clear when the exercise closes.
- Responsive Somnora image backgrounds, liquid-glass surfaces, keyboard navigation, modal focus containment, and reduced-motion behavior.

## Honest product boundary

Relay mode synchronizes conversation records and a bounded projection of Nora memory. It does not upload photographs, HealthKit records, burn text, or model credentials. Live weather remains an optional one-time browser request. Calendar parsing is local. Event options remain clearly labeled fixtures until a real event provider is connected.

The architecture preserves the boundary **Apple Watch to iPhone to authenticated shared backend to Workbench**. There is no direct Watch-to-dashboard channel. Activity handoff still carries only a versioned action identifier, bounded prompt, status, and progress count.

## Seeded development mode

Use seeded mode only for deterministic UI development and automated visual fixtures:

```bash
VITE_TRANSPORT=demo
```

Seeded mode must remain visibly disclosed and must not be used for the product demo recording.

## Verification

```bash
npm run typecheck
npm run test:run
npm run lint
npm run build
npm run e2e
npm run screenshots
```

`npm run build` creates the static production bundle in `dist/`. Runtime configuration keys are documented in `.env.example`; blank values are sufficient for demo mode, and `.env` files are ignored.

`npm run screenshots` regenerates the target-size visual fixtures under the ignored `screenshots/local/` folder.

Planning, acceptance criteria, architecture, build evidence, and the Devpost handoff live in `docs/hackathon-build/`.
