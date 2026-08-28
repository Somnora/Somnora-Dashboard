# Project Scope

## Project Name Candidates

- Somnora Desktop Workbench, confirmed working name
- Somnora Workbench
- Somnora Living Dossier

## One-Line Summary

Somnora Desktop Workbench is an agentic web dashboard that turns a user's Somnora history, personal memory, and readiness context into explainable real-world suggestions that move securely from the dashboard through the iPhone to Apple Watch.

## Scope Ruler

- Available build time: approximately 30 hands-on hours.
- First objective: a polished, reliable, privacy-safe seeded demonstration.
- Stretch objective: replace selected seeded boundaries with real synchronized Somnora account data only after the core demonstration is reliable.
- Standard for completion: the dashboard, iPhone, and Watch visibly participate in one coherent loop, while the submission clearly distinguishes pre-existing Somnora work from the new hackathon work.

## Target User

The primary user is an existing Somnora user who has accumulated enough Daily entries, dreams, Eureka ideas, sleep information, and interactions with Nora to benefit from longitudinal patterns. The hackathon demo represents this user with a privacy-safe profile containing roughly 30 days of realistic history.

The user wants more than a journal archive or a generic chatbot. They want to understand how their thoughts, behavior, energy, recurring themes, and willingness to leave their comfort zone have changed over time. They also want Nora to notice useful moments and make thoughtful suggestions without taking control away from them.

## Problem

Somnora's mobile surfaces are effective for capture and timely support, but a phone screen is constrained when the user wants to examine a long mental-health journey, compare signals, understand recurring themes, or inspect how Nora remembers them.

Ordinary assistants also tend to lose longitudinal context, remain passive until prompted, or provide recommendations without showing the personal evidence behind them. At the opposite extreme, an overly autonomous wellness agent can become invasive, manipulative, or unsafe.

The Workbench addresses this tension by making Nora's memory visible and explainable, then converting selected patterns into consent-controlled real-world actions across the devices the user already carries.

## Core Workflow

### Hero workflow: Eureka dry spell

1. The user opens a living Nora workspace rather than a conventional analytics dashboard.
2. The workspace shows a seeded four-day Eureka dry spell alongside a concise readiness summary and relevant current context.
3. Nora recognizes that this user often produces ideas during walks or after entering a novel environment.
4. Nora proposes one low-friction real-world break or nearby activity that fits the user's demonstrated energy and availability.
5. The user opens "Why this?" to inspect the relevant About Me memory nodes and the evidence that influenced the suggestion.
6. The user may accept, dismiss, or adjust the suggestion. Nora does not schedule, message, or send the action across devices without confirmation.
7. After confirmation, the action travels through the secure product boundary: dashboard and shared backend to iPhone, then iPhone to Apple Watch. The Watch never receives a direct independent dashboard channel.
8. The Watch displays the compact action and allows a simple acknowledgement.
9. The acknowledgement returns through the iPhone, and the dashboard reflects the updated state.
10. A later seeded Eureka entry closes the loop by showing that the intervention preceded a new idea without claiming that it clinically caused an improvement.

### Supporting interactions

- The user can switch among Eureka, Dream, and Daily conversation modes. Eureka receives the complete hero interaction. Dream and Daily initially provide polished seeded states.
- One interactive About Me graph slice lets the user explore memories, submissions, recurring concerns, broken habits, and personal patterns as connected nodes. Its synapse-like visual language is metaphorical, not neurological.
- A deliberate reflection exercise invites the user to write three insecurities on virtual paper and choose to burn it. A high-quality animation reduces the paper to ash on screen. The action remains symbolic, private, and user initiated.
- Grill Me remains a supporting stretch interaction. If the core loop is reliable, the user can select one stalled goal, see Nora pressure-test it using the seeded dossier, and receive one concrete next step.

## What We Are Building

### Polished dashboard shell

- Image-led Somnora atmosphere adapted to a larger desktop canvas.
- Liquid-glass shells, transparent headers, clear rim lighting, restrained motion, and readable text treatment.
- A workspace layout that feels like an extension of Somnora rather than a generic administration panel.
- Clear navigation among Home, Conversations, About Me, Themes, and Analytics.

### Living Nora home

- One primary contextual recommendation.
- A concise explanation of what Nora noticed.
- Visible controls to accept, dismiss, adjust, or inspect the recommendation.
- An autonomy setting that controls whether Nora proactively surfaces ideas. It does not grant Nora permission to execute actions.

### Explainable memory

- One interactive graph built from a bounded seeded memory set.
- Node categories for observations, people, themes, habits, goals, and evidence entries.
- Inspectable links back to representative source context.
- Clear language that distinguishes user-provided facts, Nora's observations, and tentative interpretations.

### Organized seeded history

- A dedicated Analytics view for representative sleep and biometric charts.
- A Themes view for recurring subjects, people, emotions, concerns, and dream imagery.
- Personalized dream exploration grounded in the user's own associations and history, not universal symbol definitions.
- Mode switching among seeded Dream, Daily, and Eureka conversations.

### Secure cross-device proof

- One authenticated and encrypted dashboard-to-iPhone action path using the shared backend.
- One iPhone-to-Watch relay with a minimal payload and acknowledgement.
- Clear pending, delivered, acknowledged, expired, and failed states where relevant to the demonstration.
- No direct dashboard-to-Watch channel.
- No secret values, raw health payloads, or unnecessary private journal content placed into device notifications.

### Reflective exercise

- One working creative exercise with intentional entry, review, burn confirmation, and an accessible reduced-motion alternative.
- No automatic deletion of unrelated journal data and no implication that the animation resolves the underlying concern.

## What We Are Not Building

- Full production chat parity across Dream, Daily, and Eureka. Reason: the hero value is the connected agentic loop, not three complete chat clients.
- Production ingestion of every historical biometric, sleep, dream, journal, and Eureka record. Reason: a bounded seeded profile is safer and makes the 30-hour demonstration reliable.
- A universal About Me graph covering every submission or performing open-ended psychological inference. Reason: the initial graph must remain legible, inspectable, and evidence bounded.
- Multiple creative exercises. Reason: one exceptional exercise demonstrates the concept more convincingly than several unfinished ones.
- Full Grill Me implementation before the hero workflow is reliable. Reason: it is a supporting beat and may reuse the dossier after the primary loop is complete.
- Somnora Fitness and Somnora Nutrition applications. Reason: they are future ecosystem context sources, not part of this hackathon build.
- Clinical mental-health scoring, diagnosis, treatment recommendations, crisis care, or therapy replacement claims.
- Universal dream-symbol claims. Water, insects, people, and other imagery are explored through the user's own recorded associations and are labeled as tentative.
- Unbounded background autonomy. Nora can surface a suggestion according to the user's setting but cannot execute a cross-device action without explicit confirmation.
- A direct Watch-to-dashboard connection. The iPhone remains the trusted bridge for Watch communication.

## Inspiration And References

### Apple Continuity

Borrow the feeling that moving between devices is invisible, intentional, and trustworthy. Security and continuity are product behavior, not merely visual polish.

### Obsidian Canvas

Borrow spatial exploration and meaningful connections. The About Me graph should feel like peering into a personal map of thought while remaining calmer, more guided, and less manually maintained than a general-purpose canvas.

### Oura and Whoop

Borrow the ability to translate complex signals into one understandable state. Keep detailed charts in a dedicated Analytics view so the primary Nora workspace remains human and action oriented.

### Existing Somnora design language

The dashboard extends Somnora's image backgrounds, glass surfaces, serif Nora voice, restrained motion, and consent-centered interaction. It must not substitute a generic gradient or enterprise-dashboard visual system.

## Demo Path

1. Open the dashboard on the seeded profile. In the first ten seconds, the judge sees that Nora has noticed a meaningful pattern and proposed one personalized action.
2. Briefly switch among Dream, Daily, and Eureka to establish that the Workbench organizes the existing Somnora ecosystem.
3. Open the Eureka dry-spell recommendation.
4. Select "Why this?" and reveal the relevant About Me graph nodes, including past walk-related ideas and the current readiness context.
5. Confirm the suggested break.
6. Show the iPhone receive the scoped action and relay it to Apple Watch.
7. Acknowledge the action on the Watch and show the dashboard update.
8. Reveal a later Eureka entry that closes the narrative loop.
9. Open the Analytics and Themes views briefly to show the breadth made possible by the larger display.
10. End with the private paper-burning reflection exercise as the memorable visual beat, or use Grill Me if it is more reliable in the final build.

## Submission Story

Somnora already existed as an iPhone and Apple Watch product before the submission period. The new project work, begun on 08-27-26 for this hackathon, is the Somnora Desktop Workbench and the secure ecosystem coordination that connects the dashboard, iPhone, and Watch into one explainable agentic workflow.

The judges should see Somnora as a coherent three-surface ecosystem while receiving a precise disclosure of what is new. The existing mobile and Watch apps provide the established product context. The dashboard, inspectable About Me graph, seeded agentic dry-spell workflow, consent controls, reflective exercise, and new cross-device demonstration are the hackathon contribution.

The central claim is not that Somnora diagnoses or treats mental illness. It is that a personal agent can remember longitudinal context, show its reasoning, notice a useful moment, propose an appropriate action, obtain consent, and coordinate that action securely across the user's devices.
