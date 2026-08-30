# Devpost Submission: Somnora Desktop Workbench

## Project Overview

- **Project Title:** Somnora Desktop Workbench
- **Tagline:** An explainable, consent-controlled AI companion dashboard that turns personal reflection patterns into real-world creative action across Desktop, iPhone, and Apple Watch.
- **Track:** Track 2: The Collaborative Partner (All Things Agentic Hackathon)
- **Repository:** https://github.com/Somnora/Somnora-Workbench
- **Live Demo / Preview:** http://127.0.0.1:4173 (via `npm run demo` in the repository)

---

## Pitch & Inspiration

Most wellness and productivity dashboards treat personal data like an analytics spreadsheet: rigid charts, arbitrary streak scores, and generic notifications. When AI is added, it often operates as an opaque black box that makes unsolicited assumptions without showing its work or asking for permission.

Somnora Desktop Workbench is designed around a fundamentally different philosophy: **Proactive but Permissioned, Personal but Explainable.**

As the desktop surface of the Somnora ecosystem, Workbench connects your dream journal, daily reflections, creative ideas (Eureka), and wearable sleep/biometric trends into a unified workspace. Instead of waiting for prompts or firing uncalibrated notifications, Nora (your AI companion) observes meaningful patterns, provides an inspectable evidence trail for why she noticed them, and proposes bounded, real-world invitations that carry securely across Desktop, iPhone, and Apple Watch.

---

## What It Does

### 1. Inspectable Memory Graph ("About Me")
Nora's understanding of your life is not a hidden system prompt. Workbench provides an interactive, visual memory graph where every synthesized theme (creative blocks, sleep correlations, emotional restoration) is linked to source evidence. Users maintain total sovereign control: you can confirm memories, adjust weight, edit context, or purge entries with immediate graph recalculation.

### 2. The Consent-Controlled Invitation Loop
When Nora detects a prolonged creative dry spell in your Eureka notes, she does not silently schedule an event or send a push notification. She initiates a structured 6-step loop:
1. **Observation:** Nora notices the creative lull and cross-references recovery markers.
2. **Evidence Path:** Clicking "Why this" opens the exact memory nodes that informed the suggestion.
3. **Invitation:** Nora proposes a low-friction outing ("Three Beautiful Things" sensory walk).
4. **User Agency:** You can accept, modify parameters (time, energy level, solitude), or decline with zero penalty.
5. **Cross-Device Handoff:** Upon explicit acceptance, the invitation routes cleanly through iPhone to your Apple Watch.
6. **Field Note Closure:** Discoveries recorded on the walk sync back to close the loop in a private, permanent Field Note.

### 3. Action Desk & Consent Console
A unified security and autonomy center that clearly delineates:
- What Nora noticed (Observations)
- What Nora suggested (Proposals)
- What you authorized (Execution)
Every domain (Health, Journal, Calendar, Location) has explicit Observe, Suggest, and Prepare sliders, ensuring consequential actions always require explicit confirmation.

### 4. Adaptive Activity Studio
A capacity-aware studio spanning Discover, Connect, Create, Reflect, and Reset. It dynamically tunes exercises (such as the Six Line Story or Sensory Reset) based on real-time energy, time budget, social bandwidth, and environmental context.

---

## How We Built It

- **Frontend & Visual Architecture:** React 19, TypeScript, Vite, Tailwind CSS, Motion for fluid 120fps micro-interactions, React Flow for dynamic memory graph visualization, and Recharts for biometric trends.
- **Deterministic State & Test Suite:** Fully offline-capable `DemoTransport` enabling deterministic, repeatable rehearsal of all cross-device loops. Validated with 21 test suites and 76 passing automated tests.
- **Security & Privacy Isolation:** 
  - Zero raw PII, journal text, or HealthKit metrics egress to unvetted cloud layers.
  - Short-lived HMAC-authenticated pairing codes for device handoffs.
  - Granular token and context boundary management ensuring no third-party data contamination.
- **Cross-Device Bridge:** Integration with Somnora iOS (Swift 6) and watchOS companion engines via WatchConnectivity.

---

## Challenges We Ran Into

1. **Explainable Graph Layouts:** Rendering personal themes as an intuitive node graph without visual clutter required custom force-directed clustering algorithms that group related emotional and creative concepts naturally.
2. **True User Sovereignty in AI Memory:** Ensuring that when a user clicks "Forget" on a memory node, all dependent inferences and proactive suggestion weights immediately decouple without leaving orphaned ghost state.
3. **Cross-Device Boundary Enforcement:** Architecting a multi-device relay where Apple Watch receives strictly the minimal payload needed for haptic guidance, without exposing backend credentials or storing sensitive history on wearable hardware.

---

## Accomplishments We're Proud Of

- Built an interface that feels calm, tactile, and restorative rather than demanding or clinical.
- 76/76 unit and integration tests passing with 0 TypeScript compilation errors.
- Created a genuine bridge between reflective journaling and real-world physical exploration.
- Proved that autonomous agent workflows can be completely transparent, explainable, and respectful of human boundaries.

---

## What We Learned

Proactive AI does not have to be intrusive. When users are given clear visibility into *why* an AI companion makes an observation and have one-click authority to modify the underlying memory, trust increases dramatically. Real collaboration happens when the AI is capable of initiating ideas while keeping the human firmly in the driver's seat.

---

## What's Next for Somnora Desktop

- Expanding context adapters to support future Somnora Fitness and Somnora Nutrition modules under the same strict consent boundaries.
- Native macOS menu bar quick-capture utility for instant Eureka voice memos.
- Local on-device LLM inference options for complete offline sovereignty.
