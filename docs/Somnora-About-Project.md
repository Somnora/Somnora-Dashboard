# About the Project: Somnora Desktop Workbench & Cross-Device Ecosystem

## Inspiration

Somnora came from wanting to point AI at a novel problem, not just make an existing problem easier to solve. The belief underneath it: the ability to understand yourself, and to feel understood, should not be a gatekept luxury.

The concept was forged while I was a press videographer in an active conflict zone. In that volatile, high-stress environment, I needed a psychological sounding board: something to keep me grounded and help me unpack the hyper-vivid dreams I kept having. I did not want a boilerplate therapist-bot handing me canned behavioral checklists. I wanted a companion with an unapologetic, witty, deeply human personality; one that means well and genuinely entertains, but refuses to preach.

As the mobile and watch prototypes matured into our Google for Startups deployment, a deeper reality emerged: personal growth does not happen solely on a 6-inch phone screen or a 1.5-inch watch face. Mobile devices and smartwatches are ideal for rapid, ephemeral capture and real-world sensory guidance, but meaningful reflection, long-term pattern synthesis, and user sovereignty over AI memory demand a dedicated, calm desktop workspace. We built the Somnora Desktop Workbench to serve as the intelligent parent hub of this ecosystem, transforming disconnected reflections into a cohesive, consent-controlled collaboration across Desktop, iPhone, and Apple Watch.

---

## What It Does

Somnora is a cross-device, autonomous wellness and subconscious intelligence ecosystem. It links personal reflection, creative capture, and biometric rest data into an explainable, multi-device collaboration loop:

### 1. Somnora Desktop Workbench (Parent Workspace)
* **Living Nora Home:** An intelligent desktop command center where Nora observes behavioral patterns (such as prolonged dry spells in creative notes) and proposes context-aware invitations with transparent reasoning.
* **Inspectable Memory Graph ("About Me"):** An interactive, node-based memory graph built with React Flow where every synthesized theme (creative blocks, sleep correlations, emotional restoration) is linked to source evidence. Users maintain total sovereign authority: you can confirm, re-weight, edit, or purge memories with immediate graph recalculation.
* **Action Desk & Consent Console:** A unified security and autonomy console enforcing strict separation between what Nora observed, what she proposed, and what the user authorized. Every domain (Health, Journal, Calendar, Location) has explicit Observe, Suggest, and Prepare boundaries, ensuring consequential actions always require confirmation.
* **Capacity-Aware Activity Studio:** A restorative studio spanning Discover, Connect, Create, Reflect, and Reset that dynamically adapts exercises (such as Six Line Story or Sensory Reset) to real-time energy, time budget, and environmental context.

### 2. Full Multi-Device Mesh Connectivity
* **Phone to Desktop:** Synchronizes rich journal entries, waking dream narratives, and conversation threads back to the parent Workbench, allowing deep desktop review without data loss.
* **Desktop to Phone:** Dispatches bounded, user-authorized invitations and coordinates cross-device pairing using short-lived cryptographic tokens.
* **Watch to Phone:** Captures spontaneous Eureka voice memos away from screens and streams real-time biometric sleep cycles via WatchConnectivity.
* **Watch to Desktop:** Relays real-world milestone completions (such as progress through a sensory outdoor walk) directly back to the Workbench to synthesize permanent, private Field Notes.
* **Desktop to Watch:** Routes user-accepted sensory invitations directly to the user's wrist as lightweight, credential-free haptic prompts, guiding real-world movement without phone distraction.

### 3. Mobile and Wearable Companion Clients
* **Multimodal Awakening Ingestion (iOS):** Captures voice recordings, Apple Pencil sketches, and hypnopompic dream fragments during the waking window, synthesizing them into structured narratives and art prompts.
* **Subconscious Knowledge Engine (Grounded Dream RAG):** Performs grounded semantic searches across personal dream archives with Vertex AI Search and Gemini Flash, providing citation-backed subconscious recall.
* **Autonomous Circadian Rest Agent (watchOS & iOS):** Analyzes HealthKit sleep cycles, calculates cumulative sleep debt, and prescribes evidence-based wind-down protocols (NSDR, 4-7-8 breathing, Autogenic Training).
* **Eureka Mode (watchOS):** Instant wrist-based audio recording that transcribes fleeting ideas and queues them for Nora to correlate with historical themes.

---

## How We Built It

The Somnora ecosystem connects a React 19 desktop shell (packaged natively for macOS via Electron), native Swift 6 clients for iOS and watchOS, and a secure Google Cloud and Firebase backend infrastructure.

### 1. Frontend and Visual Architecture
The Desktop Workbench is built with React 19, TypeScript, Vite, Tailwind CSS, Motion for 120fps fluid physics, React Flow for dynamic force-directed memory graph rendering, and Recharts for biometric visualization. The native desktop runtime is wrapped in Electron with strict context isolation and secure IPC conduits.

### 2. Multi-Device Synchronization & Cloud Infrastructure
* **Google Cloud Run:** Hosts our serverless Node.js relay proxy, enforcing role isolation between browser and mobile principals, strict JSON schema validation, and monotonic status transitions.
* **Google Cloud Firestore:** Manages short-lived HMAC-hashed pairing codes, bounded action contracts, and session metadata.
* **Firebase Authentication:** Issues distinct, cryptographically verified tokens for Workbench and Mobile instances to prevent identity spoofing.
* **Google Cloud SQL & Memorystore:** Provides high-throughput rate limiting, token replay defense, and automatic fallback caching.
* **Google Gemini API & Vertex AI:** Powers pattern synthesis, explainable observation reasoning, and adaptive activity parameter distillation.

### 3. Mathematical Foundations & Algorithms

#### Memory Salience Formation
Every conversational turn across Desktop, Phone, or Watch yields candidate memories, each scored for salience before it is allowed to persist:

$$s(c) = \sigma\left(\beta_0 + \beta_1\,\text{emo}(c) + \beta_2\,\text{spec}(c) + \beta_3\,\text{recur}(c)\right)$$

where $\text{emo}$, $\text{spec}$, and $\text{recur}$ capture emotional charge, specificity, and recurrence. Only candidates exceeding threshold $\theta_{\text{salience}}$ survive.

#### Memory Synthesis, Reinforcement, and Decay
A memory's salience decays over time according to an exponential curve, but is reinforced whenever its underlying theme resurfaces:

$$s_t = s_0\,e^{-\lambda(t-t_0)} + \sum_{r \in R} \rho\,e^{-\lambda(t-t_r)}$$

At prompt construction time, Nora ranks memories by blending semantic cosine similarity, current salience, and recency:

$$\text{score}(m, q) = \alpha \cos(\mathbf{e}_m, \mathbf{e}_q) + \gamma\,s(m) + \delta\,e^{-\lambda\Delta t_m}$$

The engine solves a 0/1 knapsack optimization over the memory pool to pack the highest-value context into the fixed prompt budget $B$, where $\tau(m)$ represents the token cost:

$$\max \sum_{i} x_i\,\text{score}(m_i) \quad \text{s.t.} \quad \sum_{i} x_i\,\tau(m_i) \le B, \quad x_i \in \{0, 1\}$$

#### Capacity-Aware Activity Adaptation
When generating real-world invitations in the Activity Studio, Nora selects and adapts activity variants $\mathbf{A}^*$ by scoring candidate activities against real-time user energy $E$, available time budget $T$, and social bandwidth $S$:

$$\mathbf{A}^* = \arg\max_{a \in \mathcal{A}} \left(\mathbf{w}_{\text{context}} \cdot \mathbf{\Phi}(a, E, T, S)\right)$$

#### Cryptographic Ephemeral Pairing
Cross-device pairing between the Desktop Workbench and mobile devices utilizes single-use, 10-minute bounded pairing codes protected via HMAC-SHA256:

$$\text{Token}_{\text{pair}} = \text{HMAC-SHA256}(K_{\text{ephemeral}}, \text{DeviceID} \,\|\, t_{\text{exp}})$$

---

## Challenges We Ran Into

### 1. Explainable Memory Graphs vs Black-Box AI
The most difficult challenge was moving away from opaque system prompts toward a fully inspectable, 2D force-directed memory graph. When a user clicks "Forget" on a memory node in the Desktop Workbench, all dependent inferences, proactive suggestion weights, and mobile prompts must immediately decouple without leaving orphaned ghost state. We implemented real-time graph precedence resolvers and local deduplication filters:

$$\text{merge}(m_i, m_j) \iff \cos(\mathbf{e}_{m_i}, \mathbf{e}_{m_j}) \ge \theta_{\text{dup}}$$

### 2. Multi-Device Boundary Enforcement Without PII Leakage
Architecting a mesh where Apple Watch, iPhone, and Desktop Workbench communicate without leaking private data required strict boundary isolation. We engineered the pipeline so that Apple Watch receives only a minimal, credential-free action payload via WatchConnectivity. Raw HealthKit metrics, private journal text, and photo bytes remain strictly on-device, while the cloud relay processes only versioned action tokens and status transitions.

### 3. Asynchronous Cross-Device Action Lifecycle
Coordinating an invitation initiated on Desktop, accepted by the user, routed through the iPhone bridge, completed on Apple Watch during an outdoor walk, and closed back on Desktop required building a monotonic distributed state machine. Every action progresses strictly forward (Created -> Sent -> Acknowledged -> Active -> Completed) to prevent duplicate triggers, stale rewrites, or race conditions.

---

## Accomplishments That We're Proud Of

* Created a calm, tactile desktop environment that replaces gamified streaks, arbitrary scores, and pushy notifications with genuine user agency and restorative design.
* 86/86 unit and integration tests passing with 0 TypeScript compilation errors and clean Swift 6 concurrency safety.
* Built a true closed-loop bridge between reflective desktop journaling and real-world physical exploration.
* Proved that autonomous agent workflows can be completely transparent, inspectable, and respectful of human boundaries across multiple form factors.

---

## What We Learned

Proactive AI does not have to be intrusive. When an AI companion provides full visibility into *why* an observation was made and gives the user one-click sovereignty to modify or delete underlying memory nodes, trust increases dramatically. Real collaboration happens when the AI is capable of initiating ideas while keeping the human firmly in the driver's seat across their entire device ecosystem.

---

## What's Next for Somnora

* **Modular Context Adapters:** Expanding the Consent Console to support upcoming Somnora Fitness and Somnora Nutrition modules under the same strict permission and privacy boundaries.
* **Local On-Device Inference:** Integrating Apple Silicon local Small Language Model (SLM) execution on macOS for complete offline sovereignty.
* **macOS Menu Bar Quick Capture:** A native system tray utility for instant Eureka voice memos and stream-of-consciousness capture without opening the main window.
* **Android & Wear OS Support:** Porting the companion client to Android and Samsung Galaxy Watch using Kotlin, Jetpack Compose, and Health Connect.
