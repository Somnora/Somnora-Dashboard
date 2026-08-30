# Architecting Somnora: An Explainable, Consent-Controlled AI Companion Across Desktop, Mobile, and Wearables

*Author: James McShane & the Somnora Team*  
*Date: August 30, 2026*  
*Hackathon Entry: All Things Agentic Hackathon (Track 2: The Collaborative Partner)*

---

## Notice of Hackathon Entry

This technical blog post was created specifically for the purposes of entering the All Things Agentic Hackathon on Devpost. It details the system architecture, design philosophy, security guardrails, and implementation of the Somnora Desktop Workbench and its cross-device agentic action loop.

---

## 1. The Core Problem: The Black Box of Proactive AI

Most wellness and productivity applications treat personal data as a static spreadsheet of metrics: rigid charts, arbitrary streak badges, and disconnected notifications. When autonomous AI agents are introduced into these workflows, they often operate as opaque black boxes. They infer user intentions without showing their reasoning, trigger unsolicited actions, and fail to provide granular user authority over underlying memory states.

With Somnora, we set out to prove a fundamentally different design philosophy: **Proactive but Permissioned, Personal but Explainable.**

Somnora connects your dream journal, daily reflections, creative ideas (Eureka notes), and biometric context into an integrated workspace. Nora (your AI companion) observes meaningful life patterns, provides an inspectable evidence trail explaining why she noticed them, and proposes bounded, real-world invitations that carry securely across Desktop, iPhone, and Apple Watch.

---

## 2. System Architecture: The Three-Tier Agentic Pipeline

The Somnora architecture spans three distinct execution tiers, connected by strict security and privacy boundaries:

### Tier 1: Somnora Desktop Workbench (React 19, TypeScript, Electron)
The primary desktop surface provides a calm, tactile environment for reflection and deep work:
* **Living Nora Home:** Observes creative patterns (such as prolonged lulls in Eureka notes) and presents context-aware invitations.
* **Inspectable Memory Graph ("About Me"):** A node-based visualization built with React Flow where every synthesized theme (creative blocks, sleep correlations, emotional recovery) is directly linked to source evidence. Users have sovereign authority to confirm, re-weight, edit, or forget memories.
* **Action Desk & Consent Console:** A dedicated autonomy center enforcing domain-level boundaries (Observe, Suggest, Prepare) across Health, Journal, Calendar, and Location data.
* **Capacity-Aware Activity Studio:** Dynamic exercises (such as Six Line Story and Sensory Reset) that tune their requirements based on real-time energy, time budget, and local context.

### Tier 2: Cloud Services & Agent Intelligence (Google Cloud & Firebase)
* **Google Gemini API & Vertex AI:** Powers pattern synthesis, explainable observation reasoning, and adaptive activity parameter distillation.
* **Google Cloud Run:** Hosts a serverless Node.js relay proxy that enforces strict JSON schemas, monotonic state transitions, and role isolation between browser and mobile principals.
* **Google Cloud Firestore:** Manages short-lived HMAC-hashed pairing codes, bounded action contracts, and session metadata.
* **Firebase Authentication:** Provides distinct, cryptographically signed tokens for Desktop and Mobile clients, preventing identity confusion.
* **Google Cloud SQL & Memorystore:** Provides caching, token replay defense, and rate limiting.

### Tier 3: Mobile & Wearable Execution (iOS & watchOS)
* **Somnora iOS (Swift 6, SwiftUI):** Authenticates via Firebase, validates incoming action schemas, and coordinates wearable sessions.
* **Somnora Apple Watch (watchOS):** Receives a minimal, credential-free action payload via WatchConnectivity. Guides the user through real-world sensory walks with haptic taps.
* **Private Loop Closure:** Milestone completions sync back to the Desktop Workbench to record a permanent, private Field Note without transmitting raw photo or biometric bytes.

---

## 3. The 6-Step Consent-Controlled Action Lifecycle

To prevent autonomous AI from overstepping, every proactive intervention follows a deterministic 6-step lifecycle:

1. **Observation:** Nora notices a pattern (e.g., 4 days of silence in Eureka notes following intense creative output).
2. **Explainable Evidence Path:** The user clicks "Why this" to inspect the exact memory graph nodes and reflection entries informing the observation.
3. **Invitation Proposal:** Nora proposes a low-friction restorative activity ("Three Beautiful Things" sensory walk).
4. **User Agency & Acceptance:** The user can accept, customize parameters (time budget, energy level, solitude), or dismiss the proposal with zero penalty.
5. **Cross-Device Handoff:** Upon explicit acceptance, the invitation routes through Cloud Run to iPhone and Apple Watch.
6. **Field Note Closure:** As the user notices three beautiful things during the walk, milestone counts update. Upon completion, the loop closes with a private Field Note on Desktop.

---

## 4. Privacy and Security Guardrails

Autonomous agent systems require uncompromising privacy safeguards:

* **Zero Egress of Raw PII:** Journal text, dream narratives, and raw HealthKit metrics remain local on device. Only compact, versioned action tokens pass through the cloud relay.
* **Short-Lived HMAC Pairing:** Desktop and mobile devices pair using random, single-use, 6-digit codes hashed with HMAC-SHA256 and bounded by a 10-minute expiry window.
* **Monotonic State Machine:** Action states progress strictly forward (Created -> Sent -> Acknowledged -> Active -> Completed) to prevent replay or state tampering.
* **Zero Wearable Credentials:** Apple Watch never holds backend API keys or authentication tokens.

---

## 5. Engineering Accomplishments & Quality Validation

During the hackathon build, we prioritized rock-solid software engineering practices:
* **86/86 Passing Automated Tests:** Complete test coverage spanning Vitest unit tests, domain logic validation, and Playwright end-to-end browser tests.
* **100% TypeScript & Swift Type Safety:** Zero TypeScript compilation errors and clean Swift 6 concurrency gates.
* **Universal macOS Application Packaging:** Built native Apple Silicon and Intel `.dmg` installers for frictionless installation.

---

## 6. What We Learned & What Lies Ahead

Building Somnora demonstrated that proactive AI does not have to be intrusive. When an AI companion provides full transparency into its memory and gives the user one-click sovereignty over every suggestion, human-AI collaboration becomes effortless and restorative.

Looking ahead, we plan to expand context connectors to support modular Somnora Fitness and Nutrition adapters under the same strict consent framework, while adding local on-device LLM inference options for complete offline data sovereignty.

---

*Explore the repository, documentation, and architecture diagrams at [https://github.com/Somnora/Somnora-Dashboard](https://github.com/Somnora/Somnora-Dashboard).*
