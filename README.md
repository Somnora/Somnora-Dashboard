# Somnora Desktop Workbench

Somnora Desktop Workbench is a privacy-safe proof of concept for an agentic web dashboard that extends the existing Somnora iPhone and Apple Watch experience. Nora notices a seeded Eureka dry spell, explains the memory evidence behind a real-world creative invitation, waits for consent, and demonstrates a handoff through iPhone to Watch before closing the loop in a private Field Note.

This repository contains the new hackathon Workbench. The existing Somnora iPhone and Watch apps predate the submission period. The Workbench and the new cross-device ecosystem coordination were started on 08-27-26.

## Run the recordable demo

Requirements: Node.js 24 or another runtime supported by Vite 8.

```bash
npm ci
npm run demo
```

Open `http://127.0.0.1:4173`. No account, device, network request, or environment file is required for the deterministic demo.

Recommended demo path:

1. On Home, open **Why this** to reveal the evidence path in About Me.
2. Return Home, accept **Three Beautiful Things**, then explicitly send the invitation.
3. Start the simulated activity and add the three privacy-safe demo photographs.
4. Open Conversations, Themes, and Analytics to show the wider ecosystem.
5. Return Home and open the private burn exercise as the final visual beat.

## What is working in this repository

- A deterministic, privacy-safe 30-day profile for Dream, Daily, Eureka, themes, biometrics, and About Me.
- A bounded, inspectable memory graph with confirmation, correction, and forgetting controls.
- A complete offline `DemoTransport` state machine labeled as simulated, including consent, iPhone delivery, Watch delivery, acknowledgement, progress, failure, retry, cancellation, expiry, and refresh recovery.
- A private Field Note using bundled demo assets. Photo bytes are not transferred.
- A private burn exercise whose text remains in component memory and is cleared before animation, with a reduced-motion alternative.
- Responsive Somnora image backgrounds, liquid-glass surfaces, keyboard navigation, modal focus containment, and reduced-motion behavior.

## Honest demo boundary

The current Workbench does **not** synchronize a real Somnora account, contact physical devices, upload photographs, ingest HealthKit records, or deploy the planned authenticated relay. All dashboard profile data and device-delivery states are deterministic demo fixtures and are visibly disclosed in the interface.

The intended live route preserves the security boundary **Apple Watch to iPhone to authenticated shared backend to Workbench**. There is no direct Watch-to-dashboard channel. The future relay will carry only a versioned action identifier, status, and progress count, never model credentials, raw health data, journal evidence, burn text, or photo bytes.

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

Planning, acceptance criteria, architecture, and build evidence live in `docs/hackathon-build/`.
