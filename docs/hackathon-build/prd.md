# Product Requirements Document

## Product Summary

Somnora Desktop Workbench is the large-screen, agentic surface of the Somnora ecosystem. It organizes Dream, Daily, and Eureka conversations, sleep and biometric information, recurring themes, and Nora's personal memory into a workspace that helps the user understand their growth and act on timely insights.

The product is not primarily an analytics dashboard. Its central behavior is a consent-controlled loop:

1. Nora notices a personally relevant pattern.
2. Nora explains the evidence behind that observation.
3. Nora proposes one appropriate invitation to act.
4. The user accepts, adjusts, or declines.
5. An accepted invitation moves visibly and securely from the dashboard to iPhone and then Apple Watch.
6. The user's acknowledgement or optional reflection closes the loop.

The hackathon build uses a privacy-safe seeded profile so the complete story is reliable and demonstrable. Existing Somnora iPhone, Apple Watch, breathing, chat, and wellness behavior is product context. The newly created work is the web Workbench, its inspectable memory experience, Nora Invitations on the dashboard, and the new cross-device ecosystem demonstration.

## Product Principles

### Proactive but permissioned

Nora may notice and surface an opportunity without waiting for a question. Nora must not send, schedule, publish, contact another person, or begin a cross-device activity without explicit user confirmation.

### Personal but explainable

Every meaningful recommendation must offer a plain-language explanation and let the user inspect the personal memories or observations that influenced it.

### Direct but not shaming

Nora may be opinionated, challenge avoidance, and encourage novelty. Declining an invitation must never lower a score, break a streak, trigger guilt, or produce punitive language.

### Reflective but not clinical

Somnora can visualize self-reported change, recurring themes, and personal associations. It must not diagnose, score mental illness, claim treatment outcomes, or present itself as a therapist or crisis service.

### Secure continuity

Device transitions must feel clear and trustworthy. Apple Watch communicates through iPhone. The dashboard must not bypass the phone or imply delivery before a device confirms its state.

### Beautiful but readable

The Workbench should feel atmospheric, intimate, and unmistakably Somnora. Liquid-glass shells and image-led backgrounds must preserve legibility, keyboard access, reduced-motion behavior, and clear status communication.

## Target User

### Primary user

The primary user is a returning Somnora user with meaningful history across Daily entries, dreams, Eureka ideas, sleep, biometrics, goals, and conversations with Nora. They want to see the shape of that history, understand what Nora has learned, and receive useful prompts that connect reflection with life outside the app.

### Demo user

The hackathon demonstration uses a privacy-safe profile with approximately 30 days of realistic activity. The profile contains enough bounded evidence to support:

- A four-day Eureka dry spell.
- Several past Eureka ideas associated with walking or novel environments.
- Representative sleep and readiness context.
- Recurring dream and Daily themes.
- A small set of people, goals, habits, emotions, and observations.
- A record of which kinds of Nora Invitations the user tends to accept or dismiss.

The interface must visibly indicate demo mode so judges do not mistake seeded data for the presenter's private information or for a fully synchronized production account.

## Core User Journey

1. The user securely opens the Workbench in demo mode.
2. Home immediately communicates that Nora has noticed a four-day Eureka dry spell.
3. Nora proposes a Three Beautiful Things invitation: visit a nearby low-friction place and photograph three things that catch the user's attention.
4. The invitation shows why it appeared, the expected time and energy, privacy implications, and an indoor or lower-effort alternative.
5. The user selects "Why this?" and enters a focused About Me graph view.
6. The graph reveals the personal nodes and source entries that connect walking, novelty, available capacity, and prior creative breakthroughs.
7. The user returns to the invitation and explicitly accepts it.
8. The dashboard displays Pending, then Delivered to iPhone, then Delivered to Watch as each device confirms receipt.
9. The Watch presents a compact mission and visible progress. The iPhone handles photo capture.
10. After three private photos are captured, the user completes the invitation.
11. The Watch acknowledgement returns through the iPhone and appears on the dashboard.
12. The dashboard arranges the three photos into a private Field Note and offers an optional Eureka reflection.
13. A later seeded Eureka entry closes the story without claiming that the activity clinically caused an outcome.
14. The demonstration briefly visits Dream, Daily, Themes, Analytics, and one reflective exercise to establish the larger ecosystem.

## Epics And User Stories

### Epic 1: Living Nora Home

#### Story 1.1: Understand the day immediately

- As a returning Somnora user, I want Home to show Nora's most relevant current observation so that I immediately understand why the dashboard deserves my attention.

Acceptance criteria:

- The primary Nora observation and invitation are visible without scrolling at the target desktop demo size.
- The first view contains one dominant recommendation rather than a grid of equally weighted metrics.
- The card states what Nora noticed in plain language.
- The card offers Accept, Adjust, Not now, and Why this actions.
- Dream, Daily, Eureka, About Me, Themes, and Analytics destinations are visible from the initial shell.
- iPhone and Watch connection states are visible without opening settings.
- Demo mode is visible but does not overpower the product experience.

#### Story 1.2: Control how proactive Nora feels

- As a user, I want to control how often Nora surfaces invitations so that the product fits my desired level of initiative.

Acceptance criteria:

- Home exposes an Autonomy control with understandable levels.
- The lowest level explains that Nora remains quiet until asked.
- Higher levels explain that Nora may surface context-aware invitations.
- Changing autonomy never grants permission to send or execute an invitation.
- The selected level remains visible after the control closes.
- The interface does not label low autonomy as inferior.

#### Story 1.3: Control the size of the challenge

- As a user, I want to choose how far outside my comfort zone Nora may suggest going so that recommendations feel stretching rather than coercive.

Acceptance criteria:

- A separate Stretch Level control offers Gentle, Curious, and Bold.
- Gentle favors familiar, private, low-effort activities.
- Curious permits small novelty and optional social contact.
- Bold may suggest unfamiliar places or meaningful social challenges while retaining all safety and consent rules.
- Stretch Level is visually and conceptually separate from Autonomy.
- No level permits Nora to publish, contact someone, or begin an activity without confirmation.

### Epic 2: Nora Invitations

#### Story 2.1: Receive a relevant invitation

- As a user experiencing a creative lull, I want Nora to propose a manageable activity that fits my present context so that I can change my environment without planning an entire outing.

Acceptance criteria:

- Every invitation shows a title, purpose, estimated time, expected energy, and activity family.
- The invitation explains the personal pattern that made it relevant.
- Location-sensitive invitations disclose that location is being used before the user accepts.
- The invitation offers an indoor or lower-effort alternative when relevant.
- The user can accept, adjust, decline, or ask why.
- The user can indicate "less like this" after declining.
- Declining produces neutral, supportive language and no penalty.

#### Story 2.2: Browse a coherent activity language

- As a user, I want invitations to feel varied but understandable so that Nora can be proactive without seeming random.

Acceptance criteria:

- Invitations use one of six visible families: Reset, Explore, Create, Connect, Reflect, and Stretch.
- Reset includes activities such as breathing, sensory grounding, or a screen break.
- Explore includes different routes, nearby places, and observation walks.
- Create includes photo prompts, short writing constraints, color hunts, and visual Field Notes.
- Connect includes user-confirmed outreach or conversation prompts.
- Reflect includes private writing, memory review, and symbolic release exercises.
- Stretch includes user-controlled novelty or social challenges.
- The activity family does not imply a diagnosis or mental-health score.

#### Story 2.3: Adjust an invitation before committing

- As a user, I want to change the effort, location, or activity style so that a good idea can fit my actual capacity.

Acceptance criteria:

- Adjust opens a compact set of choices rather than starting the activity.
- The user can request less time, less energy, indoors, no social contact, or a different activity.
- Nora returns one revised invitation and explains the change.
- The original invitation is not sent to another device after adjustment.
- The revised invitation still requires explicit acceptance.

### Epic 3: Three Beautiful Things Hero Invitation

#### Story 3.1: Accept the photo micro-adventure

- As a user in a Eureka dry spell, I want a simple observation mission so that I can interrupt the pattern and collect new creative material.

Acceptance criteria:

- The invitation asks the user to photograph three things they personally find beautiful or interesting.
- It suggests a nearby place or a location-neutral alternative.
- It makes clear that beauty is defined by the user, not evaluated by Nora.
- The user sees the expected duration and can choose a shorter version.
- The user sees that photos remain private by default.
- Acceptance is a deliberate action and is visually distinct from viewing details.

#### Story 3.2: Complete the mission across devices

- As a user, I want the Watch and iPhone to share clear roles so that the activity feels continuous rather than duplicated.

Acceptance criteria:

- The Watch shows the activity title and a count from zero to three.
- The Watch can acknowledge the invitation and mark the outing started.
- The iPhone clearly owns photo capture.
- After each accepted photo, progress updates to one, two, or three.
- The user can skip a photo, end early, or cancel without guilt.
- The dashboard reflects completion only after the confirmed activity state returns through iPhone.

#### Story 3.3: Turn the outing into a private Field Note

- As a user, I want to see the three observations together so that the activity becomes useful creative material rather than disappearing into my camera roll.

Acceptance criteria:

- Completion creates a private Field Note containing the selected images or seeded demo representations.
- The Field Note offers an optional caption or Eureka reflection.
- The user can remove an image before saving the Field Note.
- The Field Note is not publicly shared.
- Nora does not infer sensitive facts from faces, addresses, or incidental photo details.
- The user may discard the Field Note without affecting activity completion.
- The completion language says the outing preceded a new reflection, not that it cured or caused a mental-health outcome.

### Epic 4: Explainable About Me Graph

#### Story 4.1: See how Nora understands me

- As a user, I want to explore Nora's memory as a connected graph so that I can understand the patterns influencing her responses.

Acceptance criteria:

- The graph presents a bounded, legible set of connected nodes rather than an unfiltered history dump.
- Visible node categories include user facts, people, goals, habits, themes, observations, and source entries.
- User-provided facts, Nora observations, and tentative interpretations have distinct labels.
- Selecting a node reveals its title, category, date, source, and related nodes.
- The graph uses brain-like or synapse-like movement only as a visual metaphor.
- The product never claims that the graph is a neurological, clinical, or complete psychological model.

#### Story 4.2: Trace a recommendation to evidence

- As a user, I want "Why this?" to reveal the relevant memory path so that a proactive suggestion does not feel arbitrary or invasive.

Acceptance criteria:

- "Why this?" opens a focused graph state rather than the entire network at once.
- The focused state highlights the active invitation and its supporting nodes.
- The dry-spell demo identifies previous walking-related Eurekas, current readiness context, and the absence of recent Eureka entries.
- Each highlighted relationship can be inspected.
- The user can return to the invitation without losing its pending state.
- The explanation uses tentative language where the relationship is inferred rather than stated by the user.

#### Story 4.3: Correct Nora's memory

- As a user, I want to affirm, correct, or remove a memory so that Nora's model of me remains accountable to me.

Acceptance criteria:

- Every inspectable memory offers That's right, Not quite, and Forget this.
- That's right records visible confirmation without exaggerating confidence.
- Not quite lets the user provide a correction or mark the relationship as inaccurate.
- The corrected node visibly changes in the current graph state.
- Forget this requires confirmation before removing the memory from the visible experience.
- A removed memory no longer appears as evidence for the active recommendation.
- The interface clearly distinguishes hiding demo data from deleting production account data.

### Epic 5: Cross-Device Continuity

#### Story 5.1: Understand delivery state

- As a user, I want to see exactly where an invitation is in the device chain so that I can trust the handoff.

Acceptance criteria:

- The visible states are Pending, Delivered to iPhone, Delivered to Watch, Acknowledged, Expired, and Failed.
- The dashboard never displays Delivered to Watch before the Watch path confirms it.
- Each state uses text as well as color.
- A pending or failed state exposes Cancel or Retry when appropriate.
- An expired invitation cannot be mistaken for an active one.
- The status display does not expose private journal text, raw health data, credentials, or security tokens.

#### Story 5.2: Preserve the phone as the Watch bridge

- As a user, I want Watch communication to follow the existing trusted device relationship so that the dashboard cannot create a hidden direct channel to my Watch.

Acceptance criteria:

- The user-facing device map shows Dashboard, iPhone, then Watch in that order.
- If iPhone is unavailable, the product does not claim that the Watch can still receive a new dashboard invitation.
- If Watch is unavailable, the invitation may remain on iPhone or be cancelled.
- Watch acknowledgement returns through iPhone before the dashboard displays it.
- The interface never asks the user to enter credentials on Apple Watch for the Workbench.

#### Story 5.3: Recover from interruption

- As a user, I want clear recovery choices when a device is offline so that continuity failures do not create uncertainty.

Acceptance criteria:

- If iPhone is offline, the dashboard identifies iPhone as unavailable and does not imply Watch delivery.
- If Watch is unavailable, the dashboard identifies that the invitation reached iPhone only.
- The user can cancel a pending invitation.
- Retry requires a visible user action after reconnection or follows a clearly disclosed pending rule.
- Duplicate acknowledgements do not create duplicate Field Notes or completion events on screen.
- Reopening the dashboard restores the last confirmed visible delivery state during the demo.

### Epic 6: Conversations And Capture Modes

#### Story 6.1: Move among Dream, Daily, and Eureka

- As a Somnora user, I want to switch among my core conversation modes so that the Workbench feels connected to the whole product rather than a separate tool.

Acceptance criteria:

- Dream, Daily, and Eureka are clearly named and reachable from one Conversations view.
- Switching modes changes the atmosphere and content without changing the global navigation model.
- Each mode shows representative seeded history.
- Returning to a mode preserves the user's visible position during the current session.
- Eureka supports the complete hero interaction.
- Dream and Daily do not imply complete live chat parity in demo mode.

#### Story 6.2: Capture a Eureka reflection

- As a user returning from an invitation, I want to record a thought quickly so that real-world activity can flow back into Somnora.

Acceptance criteria:

- A completed Field Note offers an optional Eureka prompt.
- The user can enter a short reflection or skip it.
- Saving creates one visible Eureka entry in the demo history.
- The new entry references the invitation only as context.
- Skipping does not mark the activity as failed.

### Epic 7: Themes, Analytics, And Visible Growth

#### Story 7.1: Review recurring personal themes

- As a user, I want recurring people, emotions, subjects, and dream imagery organized on a larger screen so that I can notice patterns that are difficult to see in individual entries.

Acceptance criteria:

- Themes has separate, understandable groupings for people, emotions, subjects, concerns, and imagery.
- Every theme shows representative frequency or recurrence without implying clinical significance.
- Selecting a theme reveals representative source entries from the seeded profile.
- Dream imagery is framed through the user's own associations and recorded history.
- Tentative interpretations are labeled as tentative.
- No universal symbol definition is presented as fact.

#### Story 7.2: Review sleep and biometric context

- As a user, I want detailed sleep and biometric information in a dedicated place so that Home can remain focused on Nora's current insight.

Acceptance criteria:

- Analytics is separate from Home.
- The view contains representative sleep, readiness, and biometric charts from the seeded profile.
- Charts have readable labels, units, dates, and explanatory text.
- The product distinguishes raw or reported signals from Nora's observations.
- No chart assigns a mental-health diagnosis or treatment score.
- Demo mode clearly identifies seeded values.

#### Story 7.3: See change over time without a shame score

- As a user, I want to recognize broken habits and increased openness over time so that growth feels visible without becoming another streak to maintain.

Acceptance criteria:

- The dashboard can show before-and-now comparisons grounded in representative entries.
- Growth language describes observed behavior or self-report rather than declaring clinical improvement.
- Missed days and declined invitations are not presented as failures.
- No single score claims to summarize the user's mental health.
- The user can inspect the evidence behind a highlighted change.

### Epic 8: Reflective And Restorative Activities

#### Story 8.1: Complete a private symbolic release exercise

- As a user, I want to write something privately and intentionally release it so that reflection can feel embodied and memorable.

Acceptance criteria:

- The exercise explains that the text is not saved by default.
- The user reviews the text before choosing Burn.
- Burning requires an intentional confirmation.
- The full-motion experience visibly reduces the paper to ash.
- Reduced motion replaces the burn with a calm dissolve or fade.
- The user may explicitly save a separate reflection before burning.
- Without that explicit choice, the entered text is absent after completion and is not added to Nora's memory.
- The completion message does not claim that the concern has been resolved.

#### Story 8.2: Continue an existing breathing exercise

- As a user, I want the Workbench to recognize Somnora's breathing experiences so that restorative tools feel continuous across devices.

Acceptance criteria:

- The dashboard can present breathing as a Reset invitation.
- The invitation clearly indicates which device will guide the exercise.
- Beginning the exercise still requires confirmation.
- The Workbench does not claim the pre-existing breathing behavior as new hackathon work.
- The user can decline or choose a non-breathing alternative.

#### Story 8.3: Discover future invitation concepts

- As a user, I want to see that Nora can suggest different forms of action so that the system feels broader than one photo walk.

Acceptance criteria:

- The seeded library can display representative concepts from all six invitation families.
- Only activities that are actually interactive are presented as available to start.
- Preview-only concepts are labeled as coming later or remain non-actionable.
- Representative future concepts include a color hunt, a different route home, a no-input walk, a six-line story, a trusted-person prompt, and a gentle unfamiliar-place challenge.
- The library does not become the primary navigation or resemble a gamified task marketplace.

### Epic 9: Safety, Privacy, And Accessibility

#### Story 9.1: Understand why private context is used

- As a user, I want to know what personal context shaped an invitation so that I can make an informed choice.

Acceptance criteria:

- Invitations identify categories of context used, such as recent activity, readiness, weather, calendar space, location, or personal memory.
- Sensitive source details remain behind Why this rather than appearing in notification previews.
- The user can decline location-sensitive behavior and receive a location-neutral alternative.
- Photo activities state that images are private by default.
- The product does not analyze faces, infer identities, or publish photos as part of the demo flow.

#### Story 9.2: Receive a context-appropriate alternative

- As a user, I want Nora to adapt when an activity is impractical so that proactivity remains useful rather than tone-deaf.

Acceptance criteria:

- Outdoor invitations offer an indoor alternative when weather or time makes the original unsuitable.
- Walking invitations offer a seated or stationary alternative.
- Social invitations are optional and can be replaced with a private activity.
- Late-night or unsafe-context states do not encourage travel to an unfamiliar place.
- The user can request less energy or no social contact from Adjust.
- Safety constraints cannot be disabled by selecting Bold Stretch Level.

#### Story 9.3: Use the Workbench with reduced motion or keyboard navigation

- As a user with accessibility preferences, I want core interactions to remain understandable without animation or a pointer so that visual polish does not block participation.

Acceptance criteria:

- Every major destination and action is keyboard reachable.
- Focus is visible against glass and image backgrounds.
- Status and node categories are not conveyed by color alone.
- Reduced motion disables ambient graph drift, large parallax, and the full burn animation.
- Text remains readable over artwork at the supported desktop sizes.
- The hero demo remains understandable with reduced motion enabled.

## Edge Cases

### New or sparse account

- If Nora lacks sufficient history, Home says that Nora is still learning rather than inventing a personalized pattern.
- The user receives a self-selected starter invitation instead of a falsely personalized recommendation.
- About Me shows a calm sparse state and explains how confirmed memories appear over time.

### No current invitation

- Home presents a quiet state with a user-initiated Ask Nora action and recent context.
- The interface does not manufacture urgency to fill the space.

### Invitation declined

- Nora acknowledges the choice neutrally.
- The user may choose less like this, not now, or a different activity.
- The decline does not affect a streak or wellness score.

### Invitation accepted without iPhone connectivity

- Delivery remains Pending or Failed.
- Watch delivery is not shown.
- The user can cancel or retry after reconnecting.
- Private invitation details are not exposed in an error message.

### iPhone connected but Watch unavailable

- The dashboard shows Delivered to iPhone and Watch unavailable.
- The user may continue with iPhone only or cancel.
- Completion on iPhone can close the loop without pretending the Watch participated.

### Duplicate or delayed acknowledgement

- The dashboard displays one completed invitation.
- A delayed duplicate does not create a second Field Note.
- The latest confirmed state remains understandable after refresh.

### Location denied or unavailable

- Nora offers a location-neutral activity.
- The product does not block the rest of the dashboard.
- The user is not repeatedly pressured to enable location.

### Camera permission denied

- Three Beautiful Things can become a text observation exercise.
- The user can record three short descriptions instead of photos.
- The activity still produces an optional private Field Note.

### Photo includes a person or sensitive detail

- The product reminds the user to respect other people's privacy.
- The demo does not perform identity recognition or social sharing.
- The user can remove the image before saving the Field Note.

### Weather, darkness, low energy, or accessibility constraint

- Adjust offers an indoor, seated, shorter, or non-social alternative.
- Bold Stretch Level does not bypass the safer alternative.

### Memory evidence is wrong

- The user can select Not quite or Forget this.
- The current explanation updates so removed evidence no longer supports the active invitation.
- Nora does not argue with the correction.

### Memory evidence is unavailable

- The product says the source is unavailable.
- It does not display a fabricated quotation or false certainty.

### User enters urgent or crisis-related content

- Nora Invitations and comfort-zone challenges do not take precedence over the existing safety response.
- The Workbench does not claim to provide crisis care.
- The hackathon build does not introduce a new clinical triage claim.

### Reduced motion enabled

- Graph relationships remain explorable without ambient movement.
- The burn exercise uses a calm non-combustion transition.
- Delivery status and mission progress remain fully visible.

## What We Are Building

- A polished responsive desktop shell with Home, Conversations, About Me, Themes, and Analytics.
- A visible privacy-safe demo mode with approximately 30 days of seeded context.
- One complete Eureka dry-spell recommendation and Three Beautiful Things invitation.
- Accept, adjust, decline, why-this, autonomy, and stretch-level behavior.
- One focused interactive About Me graph with inspectable and correctable evidence.
- One visible dashboard-to-iPhone-to-Watch delivery and acknowledgement sequence.
- One private Field Note completion state with optional Eureka reflection.
- Seeded Dream, Daily, Eureka, Themes, Analytics, and growth states.
- One working symbolic release exercise with private-by-default text handling.
- Representation of the existing breathing experience as a Reset invitation.
- Clear empty, offline, declined, permission-denied, and reduced-motion states.

## What We Would Add With More Time

- Real account synchronization after the seeded demo is reliable.
- Complete production chat behavior across Dream, Daily, and Eureka.
- A comprehensive user-editable memory graph with durable correction and deletion workflows.
- Production photo synchronization and richer Field Note creation if the initial build uses seeded completion media.
- A larger Nora Invitations library with authoring, history, and personalization.
- A complete Grill Me goal-accountability workflow.
- Calendar, weather, maps, events, and location integrations beyond the bounded demo context.
- Production ingestion for all supported sleep and biometric history.
- Somnora Fitness and Somnora Nutrition adapters.
- Multi-device conflict handling beyond the single-user demo path.
- Additional accessibility testing and localization.

## Submission Proof Points

### Agentic behavior

- Nora notices the Eureka dry spell without a direct user prompt.
- Nora combines bounded personal evidence and current context into one recommendation.
- Nora exposes Why this rather than hiding the reasoning.
- Nora adapts or backs off according to user choice.

### Human control

- Autonomy controls surfacing frequency, not execution authority.
- Stretch Level controls challenge intensity without weakening safety.
- The invitation does not cross devices until the user accepts.
- The user can correct or forget supporting memory.

### Ecosystem continuity

- The dashboard initiates and explains the invitation.
- The iPhone acts as the secure bridge and photo-capture surface.
- Apple Watch presents compact progress and acknowledgement.
- The dashboard reflects the confirmed result.

### Explainable personal memory

- A judge can open the About Me graph and trace the invitation to specific seeded evidence.
- User facts, Nora observations, and tentative interpretations are visibly distinct.
- The graph feels personal and brain-like without making neurological or clinical claims.

### Product breadth

- Dream, Daily, Eureka, Themes, Analytics, breathing, and reflective activities establish the wider Somnora ecosystem.
- Seeded and pre-existing behavior is disclosed honestly.
- The new Workbench and cross-device synergy remain the center of the submission.

### Visual and emotional impact

- The Workbench feels like Somnora on a larger canvas, not a generic admin panel.
- Three Beautiful Things demonstrates movement from private context to real-world action and back.
- The reflective burn interaction provides a memorable desktop-native visual moment while remaining private and optional.

## Product Acceptance Summary

The proof of concept is product-complete when a judge can follow the seeded dry-spell story from Nora's proactive Home observation, through an inspectable About Me explanation, into an explicitly accepted Three Beautiful Things invitation, across visible iPhone and Watch delivery states, and back to a private Field Note or Eureka reflection. The broader seeded views must make Somnora's ecosystem legible, but they must not compete with or obscure this loop.
