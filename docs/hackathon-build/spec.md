# Technical Spec

## Overview

Somnora Desktop Workbench is a static React application backed by a bounded demo profile and an adapter-based transport layer. The first build prioritizes a deterministic, polished web demonstration. A narrow authenticated relay then connects one accepted Nora Invitation to the existing iPhone app and Apple Watch app without introducing direct Watch-to-web communication.

The architecture preserves existing Somnora boundaries:

- The iPhone and Watch already use WatchConnectivity.
- The iPhone already obtains Firebase ID tokens for the live Cloud Run proxy.
- The Cloud Run proxy already verifies Firebase ID tokens and owns durable Nora memory in Firestore.
- HealthKit and detailed sleep data are primarily device-local and consent gated.
- The existing iPhone auth surface and Firebase auth identity are not yet one unified cross-platform account system.

That last point prevents the web app from safely assuming it shares the iPhone's Firebase user ID. The Workbench therefore uses a short-lived pairing link between two separately authenticated Firebase users. Tokens are never copied between devices.

## Technical Objectives

1. Render the complete seeded Workbench experience reliably without requiring network access after dependencies are installed.
2. Keep all interactive exercise text private by default and out of persistent browser storage.
3. Make the About Me graph interactive and evidence bounded.
4. Separate demo data, UI state, and transport so the seeded relay can later be replaced without rewriting views.
5. Add one real, minimal, authenticated action relay through iPhone to Watch.
6. Preserve the current WatchConnectivity fallback pattern for unreachable devices.
7. Verify the new path with web, backend, iPhone, and Watch-focused tests before any deployment claim.

## Explicit Non-Objectives

- Do not synchronize raw HealthKit records to the web in this build.
- Do not upload photo bytes through the relay in the first implementation.
- Do not expose Firestore directly to the Workbench.
- Do not create a direct dashboard-to-Watch channel.
- Do not replace Somnora's current authentication system during the hackathon.
- Do not make the Workbench depend on live model output for the recorded demo path.
- Do not change unrelated mobile features or visual systems.

## Stack

### Web application

- React `19.2.8` with TypeScript for component composition and explicit domain models.
- Vite `8.2.2` for fast local development and a static production build.
- `@xyflow/react` `12.11.5` for the interactive About Me graph.
- Recharts `3.10.1` for seeded sleep and biometric charts.
- Motion `13.1.1` for spring transitions and reduced-motion-aware interaction.
- Firebase JavaScript SDK `12.18.0` for anonymous browser authentication and ID tokens.
- CSS custom properties and authored CSS rather than Tailwind, preserving precise Somnora glass, typography, image, and motion behavior.
- React context plus `useReducer` for application state. No additional global-state library is needed for the bounded proof of concept.
- Vitest and React Testing Library for unit and component behavior.
- Playwright for the hero flow, keyboard path, reduced-motion path, screenshots, and demo-state verification.

The lockfile is authoritative for exact installed versions. Vite requires a modern Node runtime; the available environment is Node `24.11.0` and satisfies the current requirement.

### Existing mobile application

- SwiftUI and the existing Somnora Xcode project.
- FirebaseAuth through `FirebaseAuthService` for Cloud Run ID tokens.
- URLSession for the new Workbench relay client.
- WatchConnectivity through the existing `PhoneConnector` and `WatchConnector` boundaries.
- Existing local file-protection and logging conventions.

### Backend

- Existing Node Cloud Run proxy at `cloud-functions/somnora-proxy`.
- Firebase Admin ID token verification.
- Existing Firestore client and database selection.
- New relay handlers isolated from the large main request dispatcher.
- Existing safe logging and rate-limit patterns.

## Deployment

### Required development target

- The Workbench must run locally through Vite for implementation and visual QA.
- The production build must succeed as a static bundle.
- The recorded demo may use the local app if deployment credentials or backend rollout would threaten reliability.

### Preferred submission target

- Firebase Hosting serves the static Workbench over HTTPS after the local hero path is stable.
- Hosting configuration uses single-page-app rewrites.
- Runtime Firebase configuration is supplied through public web configuration variables. These values identify the Firebase project but are not server secrets.
- Cloud Run remains the authenticated API origin.
- Workbench relay endpoints use an explicit origin allowlist containing local development and the deployed Workbench origin. They do not use the proxy's existing wildcard CORS pattern.

### Deployment gate

Deployment is not considered complete until:

- The static URL loads directly and after refresh.
- The hero demo works on the deployed origin.
- Firebase browser authentication succeeds.
- Relay preflight and authenticated requests succeed only from allowed origins.
- No secret values appear in the built JavaScript bundle.

## Architecture

## Web Presentation Layer

Implements:

- `prd.md > Epic 1: Living Nora Home`
- `prd.md > Epic 6: Conversations And Capture Modes`
- `prd.md > Epic 7: Themes, Analytics, And Visible Growth`
- `prd.md > Epic 8: Reflective And Restorative Activities`
- `prd.md > Epic 9: Safety, Privacy, And Accessibility`

The Workbench is one responsive desktop shell with route-like internal destinations. The shell owns navigation, the current image background, demo mode, device status, and global Autonomy and Stretch Level controls.

The initial build uses five primary destinations:

- Home
- Conversations
- About Me
- Themes
- Analytics

Reflective activities open as modal workspaces over the current image background. Full-screen destinations use the matching Somnora image asset. Partial overlays use glass surfaces over the existing background.

## Workbench State Layer

Implements:

- `prd.md > Epic 1`
- `prd.md > Epic 2: Nora Invitations`
- `prd.md > Epic 3: Three Beautiful Things Hero Invitation`
- `prd.md > Epic 5: Cross-Device Continuity`

A typed reducer owns the bounded interactive state:

- Active destination and conversation mode.
- Selected memory node.
- Autonomy and Stretch Level.
- Current invitation and adjustment state.
- Delivery status.
- Photo progress count.
- Field Note completion state.
- Memory corrections made during the demo.
- Reduced-motion preference derived from the browser plus a demo override.

Persistence rules:

- Autonomy and Stretch Level may use `localStorage` because they are nonsensitive preferences.
- Demo progress may use `sessionStorage` so a refresh during recording can recover the flow.
- Pairing link identifiers use `sessionStorage`, not long-lived local storage.
- Exercise text, personal reflections, and burn content remain in component memory only unless the user explicitly saves a reflection.
- Seed data ships as static TypeScript objects and contains no real user information.

## Demo Data Adapter

Implements:

- `prd.md > Demo user`
- `prd.md > Epic 4: Explainable About Me Graph`
- `prd.md > Epic 6`
- `prd.md > Epic 7`

`DemoProfileRepository` returns one immutable, privacy-safe profile snapshot. It contains:

- User summary and demo-mode metadata.
- Dream, Daily, and Eureka threads.
- Sleep and readiness chart points.
- Themes, people, emotions, and dream imagery.
- About Me nodes and edges.
- Source evidence for the Eureka dry-spell recommendation.
- Representative invitation cards.
- Seeded Field Note images stored as local project assets.

The repository provides domain objects, not view-specific markup. This keeps future real-data adapters compatible with the same components.

## About Me Graph

Implements:

- `prd.md > Epic 4`

React Flow renders a bounded graph of approximately 18 to 28 nodes and 25 to 40 edges. A custom node component displays category, confidence class, and confirmation state. The graph defaults to an authored layout so recording does not depend on an unstable physics simulation.

Interaction rules:

- Selecting a node opens an evidence inspector.
- Why this opens the graph with only the invitation-relevant path highlighted.
- That's right records a session confirmation.
- Not quite accepts a short correction and marks the original edge disputed.
- Forget this confirms and removes the node from the active graph and recommendation evidence for the current session.
- The seeded repository remains immutable. User corrections live in a separate state overlay.
- Ambient movement is minimal and disabled under reduced motion.

## Charts And Themes

Implements:

- `prd.md > Epic 7`

Recharts renders seeded sleep stages, duration, resting heart rate, HRV, and representative readiness context. The view does not produce a mental-health score. Theme cards are ordinary accessible components and do not require a graph library.

All chart data includes units, dates, demo labels, and explanatory text. A chart component receives domain data and an interpretation label separately so visual metrics cannot silently become a clinical claim.

## Nora Invitations Engine

Implements:

- `prd.md > Epic 2`
- `prd.md > Epic 3`

The first build has two layers:

1. `DemoInvitationEngine` deterministically evaluates the seeded profile and returns the Three Beautiful Things invitation plus its evidence IDs.
2. `LiveInvitationClient` is an optional adapter for a future `/workbench/invitations/recommend` endpoint.

The recorded path uses the deterministic engine so network or model variance cannot break the demonstration. The agentic logic remains explicit:

- Observe the four-day Eureka gap.
- Retrieve the user's prior walk and novelty associations.
- Apply readiness, time, weather, accessibility, and consent filters from the seeded context.
- Select one invitation family and activity.
- Present supporting evidence and uncertainty.
- Wait for user confirmation.
- Dispatch the accepted action.
- Verify device acknowledgement.
- Offer, but do not require, a reflection.

A live model may later phrase the selected invitation or choose among policy-approved candidates. It may not invent evidence, bypass safety filters, or execute an action.

## Transport Adapter

Implements:

- `prd.md > Epic 5`

Views depend on a `WorkbenchTransport` interface:

```ts
interface WorkbenchTransport {
  pair(): Promise<PairingSession>
  getPairingStatus(pairingId: string): Promise<PairingStatus>
  sendInvitation(invitation: InvitationDispatch): Promise<InvitationAction>
  getActionStatus(actionId: string): Promise<InvitationAction>
  cancelAction(actionId: string): Promise<InvitationAction>
}
```

Two implementations exist:

- `DemoTransport` runs the complete status sequence locally with deterministic timings and explicit demo labeling.
- `RelayTransport` calls the authenticated Cloud Run endpoints.

The UI can switch transports through environment configuration. Demo and live status styles are visually equivalent, but the interface always indicates which mode is active.

## Firebase Browser Authentication

Implements:

- Authenticated relay access for `prd.md > Epic 5`.

The browser signs in anonymously with the same Firebase project used by the live proxy. It sends the resulting Firebase ID token as a Bearer token. The browser UID identifies the Workbench session only. It is not assumed to equal the phone's UID.

Production account linking through Sign in with Apple is deferred. The pairing link below provides narrow, revocable authorization for the hackathon relay.

## Secure Pairing Relay

Implements:

- `prd.md > Story 5.2: Preserve the phone as the Watch bridge`

### Pairing sequence

1. The authenticated Workbench calls `POST /workbench/pairing/start`.
2. The backend creates a cryptographically random single-use code, stores only its hash, associates it with the browser UID, and sets a ten-minute expiry.
3. The dashboard displays the short code and expiry.
4. The user opens Connect Workbench on iPhone and enters the code.
5. The authenticated iPhone calls `POST /workbench/pairing/claim`.
6. The backend verifies the code hash, expiry, unused state, browser UID, and iPhone UID.
7. The backend marks the code used and creates a scoped pairing link.
8. The dashboard polls `GET /workbench/pairing/:pairingId` until it sees paired.

Pairing properties:

- Tokens never cross devices.
- Client-supplied UIDs are ignored for authorization.
- Codes are rate limited, expire after ten minutes, and are single use.
- A pairing link expires after the bounded demo session and can be revoked.
- Pairing authorizes only Workbench relay operations, not arbitrary access to memory or user data.

## Workbench Relay API

Implements:

- `prd.md > Story 5.1`
- `prd.md > Story 5.3`

All endpoints verify Firebase ID tokens and derive the caller UID from the decoded token.

### `POST /workbench/pairing/start`

Caller: browser.

Request:

```json
{
  "client": "somnora-workbench",
  "protocolVersion": 1
}
```

Response:

```json
{
  "pairingId": "opaque-id",
  "code": "123456",
  "expiresAt": "ISO-8601"
}
```

### `POST /workbench/pairing/claim`

Caller: iPhone.

Request:

```json
{
  "code": "123456",
  "deviceLabel": "James's iPhone",
  "protocolVersion": 1
}
```

Response omits UIDs and returns pairing ID, state, and expiry.

### `GET /workbench/pairing/:pairingId`

Caller: paired browser or phone.

Response includes state, sanitized device label, created time, and expiry. It never returns tokens or the other device's UID.

### `POST /workbench/actions`

Caller: paired browser.

Request:

```json
{
  "pairingId": "opaque-id",
  "idempotencyKey": "uuid",
  "action": {
    "protocolVersion": 1,
    "type": "three_beautiful_things",
    "title": "Three beautiful things",
    "prompt": "Take a short walk and capture three things that catch your eye.",
    "progressTarget": 3,
    "expiresAt": "ISO-8601"
  }
}
```

The backend allowlists fields, types, lengths, target range, and expiry. Maximum encoded action size is 2 KB. Raw memory, journal text, health data, photo bytes, HTML, URLs, and arbitrary metadata are rejected.

### `GET /workbench/actions/pending`

Caller: iPhone.

The backend derives the iPhone UID and returns at most the newest active action for valid pairings. The response has no browser token or private evidence.

### `POST /workbench/actions/:actionId/status`

Caller: iPhone.

Allowed transitions:

- `pending` to `delivered_phone`
- `delivered_phone` to `delivered_watch`
- `delivered_phone` or `delivered_watch` to `in_progress`
- `in_progress` to `completed`
- Any active state to `failed`, `cancelled`, or `expired` under defined rules

The payload may include photo progress count from zero to three but no photo content.

### `GET /workbench/actions/:actionId`

Caller: paired browser or phone.

Returns the latest validated action state and timestamps. The browser polls this endpoint only while the hero card is active.

### `DELETE /workbench/actions/:actionId`

Caller: paired browser.

Cancels an active action. It does not delete unrelated journal, memory, or activity history.

## Relay Firestore Model

The backend uses Admin-only Firestore documents. No Workbench client receives direct Firestore credentials beyond normal Firebase web configuration, and no relay collections are opened to direct client reads.

```text
workbenchPairingCodes/{codeHash}
  browserUid
  pairingId
  createdAt
  expiresAt
  usedAt

workbenchPairings/{pairingId}
  browserUid
  phoneUid
  deviceLabel
  protocolVersion
  state
  createdAt
  expiresAt
  revokedAt

workbenchPairings/{pairingId}/actions/{actionId}
  idempotencyKey
  actionPayload
  status
  progressCount
  createdAt
  updatedAt
  expiresAt
```

Security invariants:

- Browser operations require `browserUid` match.
- Phone polling and updates require `phoneUid` match.
- Pairing must be active and unexpired.
- Idempotency key is unique within a pairing.
- Status transitions are monotonic except explicit failure, cancellation, or expiry.
- All logs use opaque IDs and status values, never prompt text or user content.

## iPhone Workbench Bridge

Implements:

- `prd.md > Epic 5`
- `prd.md > Story 3.2`

The iPhone adds a small Workbench relay service rather than expanding `PhoneConnector` further.

Responsibilities:

- Start or claim a Workbench pairing using `FirebaseAuthService` ID tokens.
- Poll for one pending action while the pairing or demo screen is active.
- Decode and validate protocol version and allowlisted activity type.
- Post `delivered_phone` only after local validation.
- Relay a compact WatchConnectivity message.
- Post `delivered_watch` when Watch receipt is confirmed.
- Post progress and completion from Watch or iPhone.
- Coalesce duplicate action IDs and idempotency keys.
- Store no browser token.

The first build keeps polling foreground-only and short-lived for demo reliability. Background push delivery through FCM is deferred.

## Apple Watch Invitation Surface

Implements:

- `prd.md > Story 3.2`
- `prd.md > Story 5.2`

The Watch receives a compact versioned payload:

```json
{
  "messageType": "workbenchInvitation",
  "protocolVersion": 1,
  "actionId": "opaque-id",
  "activityType": "three_beautiful_things",
  "title": "Three beautiful things",
  "prompt": "Capture three things that catch your eye.",
  "progressTarget": 3,
  "expiresAt": "ISO-8601"
}
```

Delivery behavior:

- Use `sendMessage` when reachable for immediate demo feedback.
- Fall back to `transferUserInfo` for background delivery.
- The Watch validates payload size, version, required keys, title length, prompt length, target range, and expiry.
- The Watch displays Start, progress, Complete, and Cancel states.
- The Watch sends acknowledgement and progress through existing WatchConnectivity back to iPhone.
- The Watch contains no Workbench backend credentials and never calls the Workbench API directly.

## Field Note And Photo Boundary

Implements:

- `prd.md > Story 3.3`

The first real relay sends only progress count and completion. Photos remain on iPhone. The Workbench demo uses bundled privacy-safe images to render the completion Field Note after count reaches three.

This is an intentional boundary, not hidden functionality. Real encrypted photo synchronization requires storage rules, upload authorization, deletion, retention, metadata stripping, and account-level consent. It remains a stretch goal after the action relay is verified.

## Reflective Burn Exercise

Implements:

- `prd.md > Story 8.1`

The exercise is fully local to the browser:

- Text lives in component state.
- Save reflection creates a separate explicit demo reflection object.
- Burn confirmation clears the original text state before the completion screen.
- The full visual uses layered paper masks, glow, ash particles, and spring transitions.
- Reduced motion uses opacity and texture changes without flame movement or particles.
- No analytics event contains the entered text.
- Closing the exercise clears unsaved text.

## AI Usage

### Existing AI context

Somnora's existing Cloud Run proxy and Nora memory system are pre-existing product infrastructure. The submission must disclose this.

### New agentic orchestration

The Workbench demonstrates a new observable agent loop:

1. Detect a dry-spell trigger.
2. Retrieve bounded supporting evidence.
3. Filter candidate activities by consent, readiness, availability, safety, accessibility, and Stretch Level.
4. Select and explain one Nora Invitation.
5. Wait for explicit acceptance.
6. Dispatch a scoped action.
7. Track delivery and acknowledgement.
8. Offer an optional reflection.

For the deterministic demo, steps 1 through 4 operate over the seeded repository. A later live endpoint may use the configured Nora model to phrase or rank policy-approved candidates. Model output must conform to a validated structured schema and reference only evidence IDs supplied in the request.

### AI egress limits

- No photo bytes.
- No raw HealthKit records.
- No exact location history.
- No burn-exercise text.
- No unsupported clinical inference.
- No memory write from demo mode.

## Security And Privacy Controls

### Authentication

- Every relay endpoint requires a Firebase ID token.
- The backend verifies the token with Firebase Admin and derives UID server-side.
- The browser and phone remain separate authenticated principals linked by a scoped pairing record.

### Authorization

- Browser may create, inspect, and cancel actions only for its active pairing.
- Phone may claim pairing codes and read or update actions only for pairings bound to its UID.
- Watch has no backend authorization and communicates only through its paired iPhone.

### Pairing

- Random single-use code.
- Hashed at rest.
- Ten-minute code expiry.
- Rate limited attempts.
- Bounded pairing lifetime.
- Revocation support.
- No UID, token, journal text, or memory content in the code.

### Payload minimization

- Versioned allowlisted schema.
- 2 KB action maximum.
- Short title and prompt limits.
- No arbitrary URL or HTML fields.
- No private evidence sent to notification surfaces.
- Photo progress only, no image content.

### Web hardening

- Explicit CORS allowlist for relay endpoints.
- Content Security Policy appropriate for Vite assets, Firebase Auth, and the Cloud Run origin.
- No inline secrets or service credentials.
- `rel="noreferrer"` on external links.
- Sensitive text excluded from localStorage, sessionStorage, analytics, and logs.

### Logging

- Log action ID, pairing ID, status, protocol version, and timings only.
- Never log pairing codes, tokens, prompt text, photo details, journal content, memory evidence, or exercise text.
- Use existing safe logger patterns and tests.

## File Structure

### New Workbench repository

```text
Somnora-Workbench/
  .devpost-hackathon-state.json          Local guided-hackathon progress
  .env.example                           Public web config names and API origin only
  .gitignore                             Dependencies, build output, local config, screenshots
  package.json                           Scripts and locked dependency declarations
  package-lock.json                      Reproducible npm dependency graph
  index.html                             Vite application entry document
  vite.config.ts                         Vite, Vitest, and dev-server configuration
  tsconfig.json                          Shared TypeScript rules
  tsconfig.app.json                      Browser application compiler target
  tsconfig.node.json                     Vite configuration compiler target
  playwright.config.ts                   Browser QA and screenshot configuration
  public/
    assets/
      backgrounds/                       Reused Somnora image backgrounds, disclosed as pre-existing
      demo-field-notes/                  Privacy-safe seeded hero images
      brand/                             Reused Somnora logo assets
  src/
    main.tsx                              React bootstrap and global stylesheet import
    App.tsx                               Workbench route and modal composition
    styles/
      tokens.css                         Web translation of canonical Somnora tokens
      global.css                         Resets, typography, focus, and body background rules
      glass.css                          Reusable glass, rim light, scrim, and button classes
      motion.css                         CSS fallbacks and reduced-motion behavior
    domain/
      types.ts                            Profile, memory, invitation, action, and chart types
      invitationPolicy.ts                Deterministic trigger and candidate filtering
      deliveryState.ts                   Valid UI delivery transitions
      memoryOverlay.ts                    Session confirmation, correction, and forget behavior
    demo/
      profile.ts                          Seeded 30-day profile
      conversations.ts                    Dream, Daily, and Eureka histories
      memoryGraph.ts                      Authored nodes, edges, and evidence
      analytics.ts                        Seeded sleep and biometric chart points
      themes.ts                           People, emotions, subjects, and imagery
      invitations.ts                      Invitation library and hero activity
    state/
      WorkbenchProvider.tsx               Reducer, actions, persistence, and transport wiring
      reducer.ts                          Pure application state transitions
      initialState.ts                     Profile-derived initial state
    transport/
      WorkbenchTransport.ts               Adapter contract
      DemoTransport.ts                    Deterministic local status sequence
      RelayTransport.ts                   Authenticated Cloud Run client
      firebaseAuth.ts                     Anonymous sign-in and ID-token access
      contracts.ts                        Runtime-safe request and response shapes
    shell/
      AppShell.tsx                        Navigation, background, header, and status composition
      NavigationRail.tsx                  Home and primary destination controls
      TransparentHeader.tsx               Title, demo state, device state, global controls
      DeviceStatus.tsx                    Text-first phone and Watch connection state
    features/
      home/
        HomeView.tsx                      Primary Nora observation and invitation
        InvitationCard.tsx                Why, Accept, Adjust, and Not now behavior
        AutonomyControl.tsx               Surfacing-frequency preference
        StretchLevelControl.tsx           Challenge-intensity preference
      conversations/
        ConversationsView.tsx             Dream, Daily, and Eureka mode switching
        ConversationThread.tsx            Seeded transcript presentation
      memory/
        AboutMeView.tsx                   Graph canvas and evidence inspector
        MemoryGraph.tsx                   React Flow setup and focused-path behavior
        MemoryNode.tsx                    Custom accessible node
        EvidenceInspector.tsx             Source, type, correction, and forget controls
      themes/
        ThemesView.tsx                    Recurring people, emotions, subjects, and imagery
        ThemeDetail.tsx                   Representative evidence panel
      analytics/
        AnalyticsView.tsx                 Dedicated chart workspace
        SleepChart.tsx                    Seeded sleep stages and duration
        ReadinessChart.tsx                Representative context without clinical scoring
      invitations/
        InvitationWorkspace.tsx           Active mission and delivery sequence
        WhyThisPanel.tsx                   Focused memory path launcher
        AdjustmentSheet.tsx               Effort, place, social, and activity alternatives
        FieldNote.tsx                     Seeded private completion collage
      reflect/
        BurnExercise.tsx                  Private writing and burn state machine
        BurnAnimation.tsx                 Full and reduced-motion visual behavior
      common/
        GlassPanel.tsx                    Shared glass shell
        Modal.tsx                         Accessible modal with explicit close control
        DemoBadge.tsx                     Honest seeded-data disclosure
        ErrorState.tsx                    Calm retry and recovery language
    test/
      setup.ts                            DOM and accessibility test setup
      fixtures.ts                         Stable test objects
  e2e/
    hero-flow.spec.ts                     Dry spell through Field Note
    memory-control.spec.ts                Why this, correction, and forget
    reduced-motion.spec.ts                Accessible graph and burn behavior
    keyboard.spec.ts                      Primary keyboard path
  docs/
    design-web.md                         Mapping from iOS design canon to web implementation
    security-model.md                     Pairing, roles, payload, and threat boundaries
    hackathon-build/                      Guided build artifacts
```

### Existing Somnora repository additions

```text
Somnora/
  Core/Models/
    WorkbenchRelayModels.swift            Versioned pairing and invitation contracts
  Core/Services/
    WorkbenchRelayClient.swift            Authenticated pairing and action API client
  Managers/
    PhoneConnector+Workbench.swift        Watch relay and acknowledgement integration
  Views/Settings/
    WorkbenchPairingSheet.swift           Six-digit pairing claim UI
  Views/Workbench/
    WorkbenchInvitationView.swift         Compact iPhone mission and photo-count state
  WatchConnectivity/
    WorkbenchWatchMessage.swift            Minimal validated Watch payload and response

Somnora Watch Watch App/
  Models/
    WatchInvitation.swift                 Watch-local invitation state
  Views/
    WatchInvitationView.swift             Start, progress, complete, and cancel UI
  WatchConnector+Workbench.swift           Message receipt and acknowledgement

cloud-functions/somnora-proxy/
  src/
    workbenchRelay.js                     Pairing and action handlers
    workbenchSchemas.js                   Validation, transitions, and limits
  test/
    workbench-relay.test.js               Auth, pairing, authorization, expiry, and status tests

SomnoraTests/
  WorkbenchRelayClientTests.swift          HTTP contract and auth tests
  WorkbenchWatchMessageTests.swift         Payload size, decoding, version, and expiry tests
  WorkbenchStatusTransitionTests.swift     Duplicate and invalid transition tests
```

All new Swift files must be reconciled into the Xcode project target membership through `project.pbxproj` using the repository's existing reconciliation guidance. File placement alone is not sufficient.

## Data Flow

## Startup Flow

1. Vite loads static assets and the React shell.
2. `DemoProfileRepository` returns the seeded profile.
3. `DemoInvitationEngine` evaluates the profile and produces the dry-spell invitation.
4. Reducer restores only nonsensitive preferences and demo progress.
5. Home renders the invitation, device state, and demo disclosure.
6. Firebase authentication begins only when relay mode or pairing is requested.

## Why This Flow

1. User selects Why this.
2. Home passes the invitation evidence IDs to About Me.
3. The memory overlay applies any session corrections or forgotten nodes.
4. React Flow renders only the relevant path as highlighted.
5. Evidence Inspector displays source type, date, representative excerpt, and confidence class.
6. User returns to Home with invitation state unchanged.

## Pairing Flow

1. Browser signs into Firebase anonymously.
2. Browser requests a pairing code with its ID token.
3. Backend verifies the token and stores a hashed short-lived code.
4. iPhone user enters the code.
5. iPhone gets its existing Firebase ID token and claims the code.
6. Backend creates the scoped browser-phone pairing.
7. Browser observes paired state.
8. Pairing ID remains in session storage until expiry or revoke.

## Invitation Dispatch Flow

1. User accepts the hero invitation.
2. Workbench creates an idempotency key and a minimal dispatch payload.
3. Relay API verifies browser token, pairing, schema, limits, and expiry.
4. Backend stores the action as pending.
5. Foreground iPhone relay polls and receives the action.
6. iPhone validates it and posts delivered_phone.
7. iPhone sends the compact invitation to Watch using WatchConnectivity.
8. Reachable Watch receives immediately; otherwise iPhone queues background user info.
9. Watch validates and acknowledges receipt to iPhone.
10. iPhone posts delivered_watch.
11. Dashboard polling displays each confirmed state.

## Mission Progress Flow

1. User starts on Watch or iPhone.
2. iPhone owns photo capture.
3. Each accepted photo updates local count and sends compact progress to Watch.
4. iPhone posts count to relay without photo content.
5. Dashboard shows count.
6. At three, iPhone or Watch confirms completion.
7. iPhone posts completed.
8. Dashboard renders the bundled demo Field Note and offers an optional Eureka reflection.

## Memory Correction Flow

1. User selects a node.
2. That's right records a confirmed overlay state.
3. Not quite stores a session-only correction and disputes related edges.
4. Forget this removes the node and its edges from the active graph overlay.
5. The active invitation explanation recomputes from remaining evidence.
6. No production memory mutation occurs in demo mode.

## Burn Exercise Flow

1. User opens the Reflect invitation.
2. Text remains in local component state.
3. User may explicitly save a separate reflection.
4. Burn requires confirmation.
5. Original text state is cleared.
6. Full or reduced-motion completion runs.
7. Closing the exercise clears all unsaved state.

## Components And Responsibilities

## `AppShell`

Implements: `prd.md > Epic 1`, `Epic 6`, `Epic 9`

- Owns global layout, background selection, glass navigation, header, keyboard landmarks, and destination rendering.

## `WorkbenchProvider`

Implements: `prd.md > Epic 1`, `Epic 2`, `Epic 3`, `Epic 4`, `Epic 5`

- Owns pure reducer state, safe persistence, transport selection, and cross-feature transitions.

## `DemoProfileRepository`

Implements: `prd.md > Demo user`, `Epic 4`, `Epic 6`, `Epic 7`

- Supplies bounded, immutable, privacy-safe content for every seeded view.

## `DemoInvitationEngine`

Implements: `prd.md > Epic 2`, `Epic 3`

- Applies explicit trigger, evidence, activity, safety, and adaptation rules to seeded context.

## `InvitationCard` And `InvitationWorkspace`

Implements: `prd.md > Epic 2`, `Epic 3`, `Epic 5`

- Present recommendation details, consent actions, adjustment, delivery, progress, and completion.

## `MemoryGraph` And `EvidenceInspector`

Implements: `prd.md > Epic 4`

- Visualize the bounded memory network, focused reasoning path, source types, and user corrections.

## `RelayTransport`

Implements: `prd.md > Epic 5`

- Authenticates browser calls, starts pairing, dispatches actions, polls status, and cancels actions.

## `WorkbenchRelayClient` On iPhone

Implements: `prd.md > Epic 5`

- Authenticates with the existing Firebase user, claims pairing, polls actions, validates contracts, and posts status.

## `PhoneConnector+Workbench`

Implements: `prd.md > Story 3.2`, `Story 5.2`, `Story 5.3`

- Relays minimal invitation messages and acknowledgement through existing WatchConnectivity behavior.

## `WatchInvitationView`

Implements: `prd.md > Story 3.2`, `Story 5.2`

- Displays mission state, progress, completion, and cancellation without backend credentials.

## `BurnExercise`

Implements: `prd.md > Story 8.1`, `Story 9.3`

- Keeps private text ephemeral and provides full and reduced-motion symbolic completion.

## External APIs And Dependencies

- React: https://react.dev/
- Vite: https://vite.dev/guide/
- Firebase anonymous web authentication: https://firebase.google.com/docs/auth/web/anonymous-auth
- Firebase Admin ID token verification: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Firebase Hosting: https://firebase.google.com/docs/hosting/quickstart
- React Flow: https://reactflow.dev/learn
- Recharts: https://recharts.org/en-US/guide
- Motion for React: https://motion.dev/docs/react
- Apple WatchConnectivity: https://developer.apple.com/documentation/watchconnectivity
- Apple WCSession: https://developer.apple.com/documentation/watchconnectivity/wcsession
- Cloud Run end-user authentication context: https://cloud.google.com/run/docs/authenticating/end-users

No event, map, weather, calendar, or photo-storage API is required for the deterministic first build. Those values are seeded. This avoids credentials and unstable network behavior in the recorded path.

## Risks And Verification

## Risk 1: Browser and phone do not share an identity

Finding:

- The live Nora proxy uses Firebase ID tokens, but the iPhone commonly obtains an anonymous Firebase user independently of the separate product auth UI.

Mitigation:

- Use two authenticated principals and a short-lived scoped pairing link.
- Never copy a token or trust a client-supplied UID.

Verification:

- Cross-user action reads fail.
- Reused, expired, or incorrect pairing codes fail.
- Revoked pairings cannot dispatch or poll.

## Risk 2: Existing proxy CORS is too broad for a relay

Finding:

- Multiple existing proxy routes set wildcard CORS.

Mitigation:

- New Workbench relay routes use an explicit origin allowlist and isolated preflight handling.
- Do not broaden or silently inherit wildcard behavior.

Verification:

- Allowed local and deployed origins pass.
- Unknown origins receive no permissive CORS response.
- Auth remains required even on an allowed origin.

## Risk 3: Photo synchronization expands privacy and build scope

Finding:

- Real image upload requires storage authorization, retention, deletion, metadata handling, and user consent.

Mitigation:

- Relay only photo count and completion.
- Use bundled privacy-safe Field Note images on the dashboard.

Verification:

- Action payload validator rejects image bytes, data URLs, arbitrary URLs, and oversized metadata.
- Network inspection shows no photo content.

## Risk 4: Watch reachability is not guaranteed

Finding:

- Live `sendMessage` requires reachability, while background transfer is opportunistic.

Mitigation:

- Use immediate message when reachable and `transferUserInfo` fallback.
- Display only confirmed delivery states.

Verification:

- Focused tests cover reachable, unreachable, delayed, duplicate, and expired payloads.
- Running-device QA confirms receipt and acknowledgement when hardware is available.

## Risk 5: Agent output could invent evidence

Finding:

- A free-form model can produce a persuasive but unsupported recommendation.

Mitigation:

- Recorded demo uses deterministic evidence IDs.
- Any live model receives only approved candidates and bounded evidence, returns structured output, and cannot execute.

Verification:

- Tests reject unknown evidence IDs and unsupported activity types.
- UI labels inferred relationships as tentative.

## Risk 6: Visual ambition can outrun accessibility

Finding:

- Glass, artwork, graph motion, and burn effects can reduce contrast or create motion burden.

Mitigation:

- Central scrim and glass tokens.
- Visible focus rings.
- Reduced-motion variants.
- Text and status never depend on color alone.

Verification:

- Browser tests at 1440 by 900 and 1280 by 800.
- Keyboard-only hero flow.
- Reduced-motion hero flow.
- Rendered screenshot inspection for every primary view.

## Risk 7: Existing Somnora branch contains unrelated work

Finding:

- The current mobile repository is on `feat/journal-sharing-prompts-and-observations` with an untracked `tmp/` directory.

Mitigation:

- Preserve `tmp/` and unrelated changes.
- Build the Workbench independently first.
- Before mobile edits, create a dedicated `codex/workbench-device-relay` branch from the exact intended base or obtain confirmation if the base changes materially.

Verification:

- Review `git status` before and after mobile changes.
- Confirm diffs contain only Workbench relay files and intentional project membership changes.

## Verification Matrix

### Web unit and component

- Invitation trigger and adjustment policy.
- Delivery-state reducer and invalid transitions.
- Memory confirmation, correction, and forget overlay.
- Burn text clearing and reduced-motion variant.
- Empty, declined, permission-denied, and device-offline states.

### Web end to end

- Complete deterministic hero loop.
- Why this path and return.
- Keyboard navigation.
- Reduced motion.
- Refresh recovery.
- Demo disclosure visible.
- Screenshots for Home, About Me, Conversations, Themes, Analytics, Field Note, and Reflect.

### Backend

- Missing and invalid token rejection.
- Pairing code hashing, expiry, single use, and rate limit.
- Browser and phone role authorization.
- Action schema and size limits.
- Idempotency and monotonic status transitions.
- Explicit CORS allowlist.
- Safe logging redaction.

### iPhone and Watch

- Pairing claim request and token header.
- Versioned action decoding.
- Phone delivery acknowledgement.
- Reachable Watch send and background fallback.
- Watch payload validation and expiry.
- Duplicate acknowledgement coalescing.
- No backend credential in Watch target.

### Integrated demo

- Browser pairing code claimed by iPhone.
- Browser action reaches iPhone.
- iPhone relays to Watch.
- Watch acknowledgement reaches browser.
- Failure state remains honest when Watch is unavailable.

## Architecture Self-Review

### Finding 1: Full live account sync is not a 30-hour requirement

The seeded adapter must remain the default until the hero path is stable. Real memory and health ingestion is deliberately absent from the first checklist.

### Finding 2: Real photo return is not required to prove continuity

The strongest security story is a minimal action and acknowledgement channel. Photo bytes stay local. Seeded Field Note imagery closes the dashboard narrative honestly.

### Finding 3: The relay is the highest-risk integration

The dashboard should be visually complete and testable with `DemoTransport` before backend or mobile files are changed. This gives the submission a recordable fallback even if hardware or deployment fails.

### Finding 4: The existing mobile branch base requires care

Mobile integration work must not be mixed casually into the current feature branch. The Workbench repository can proceed independently while the correct mobile base is resolved.

## Demo And Submission Flow

### Reliable recorded path

1. Start the built Workbench in deterministic demo mode.
2. Show Home and the Eureka dry-spell invitation.
3. Open Why this and inspect the focused About Me graph.
4. Return and accept Three Beautiful Things.
5. Use either `DemoTransport` or the verified paired relay.
6. Show Pending, Delivered to iPhone, Delivered to Watch, and Acknowledged.
7. Show progress reaching three and the Field Note.
8. Save or skip an Eureka reflection.
9. Briefly show conversations, themes, analytics, and the burn exercise.
10. End on the ecosystem view and disclose new versus pre-existing work.

### Live integration preference

- Use the real paired relay only after the complete device chain has been verified immediately before recording.
- If Watch hardware or background delivery is unstable, record the real iPhone and Watch behavior separately and use deterministic dashboard transport for the continuous presentation.
- Never label simulated status as live.

### Submission disclosure

- Existing: Somnora iPhone app, Apple Watch app, core conversations, breathing, Firebase-authenticated Nora proxy, and durable memory infrastructure.
- New beginning 08-27-26: Desktop Workbench, About Me graph experience, Nora Invitations dashboard orchestration, Three Beautiful Things cross-surface demo, scoped pairing relay, Workbench device status, and reflective desktop interactions.
