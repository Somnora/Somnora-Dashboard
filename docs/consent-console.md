# Consent and Autonomy Console

The Consent Console is Somnora Workbench's domain governance surface. It lets the user decide the maximum Nora may do with each context source while keeping consequential action authority outside the autonomy setting.

## Four context boundaries

Each available domain has one maximum capability:

1. Off: Nora cannot use the domain.
2. Observe: Nora may use available context while the user is inside Somnora.
3. Suggest: Nora may surface an optional idea using that context.
4. Prepare: Nora may build a reviewable draft action.

Prepare is not execution authority. Sending, scheduling, publishing, contacting another person, or beginning a device handoff still requires explicit approval for the individual action.

## Global controls

Autonomy controls how often Nora may surface something. Stretch level controls how challenging an invitation may feel. They remain separate because frequency and intensity are different user choices.

Neither control can elevate a domain above its selected context boundary. Neither control changes the consequential action rule from Ask every time.

## Domain model

The console currently represents:

- Dream journal
- Daily journal
- Eureka ideas
- Sleep and recovery
- Activity and location
- Somnora Fitness
- Somnora Nutrition

The current Workbench uses privacy-safe seeded context for Dream, Daily, Eureka, Sleep, and Activity. Fitness and Nutrition are visible as future adapters, remain Off, and cannot be elevated because no connector or live data source exists.

## Current enforcement

The Eureka dry-spell workflow uses the same policy model as the console:

- If Eureka cannot be observed, the dry-spell signal is not shown.
- If Eureka or Activity cannot support suggestions, Home holds the invitation.
- If Eureka or Activity allows Suggest but not Prepare, the user may review and accept the invitation, but Workbench cannot create the device action.
- If both domains allow Prepare, the accepted invitation may reach the separate send decision.
- Device handoff still requires explicit single-action consent.

The provider repeats the preparation check before creating an action contract. This prevents a hidden or stale UI path from bypassing the selected boundary.

## Active action behavior

Changing a domain policy does not rewrite the consent receipt of an action already in motion. The active action keeps its original bounded authority until completion, cancellation, failure, or expiry. New settings apply to future suggestions and preparations. Existing activity remains visible in Action Desk and can be cancelled from the active Home workspace.

## Persistence and privacy

The Workbench persists only compact policy enums alongside Autonomy and Stretch Level. It does not persist source content, prompts, consent receipts, health values, locations, journal entries, memory evidence, or private exercise text in the preference record.

Older Workbench preference records migrate to the documented default policy. Invalid capability values and unavailable authority for future adapters fail closed.

## Action history

The console links to Action Desk instead of creating a second activity ledger. Action Desk remains the readable record of what Nora noticed, what the user approved, which route was prepared, and what devices confirmed.
