# Nora Action Runtime

The Nora Action Runtime is the shared contract beneath proactive activities in Somnora Workbench. It separates noticing, suggesting, consent, preparation, delivery, progress, and outcomes so that new activities do not need custom trust rules.

## Runtime contract

Every prepared action contains:

- A registered action type and validated typed input.
- One explicit consent receipt scoped to one invitation and one action.
- One allowed route: Workbench only, Workbench to iPhone, or Workbench to iPhone to Watch.
- A bounded progress contract with a target and unit.
- A unique idempotency key.
- Creation and expiry timestamps within a two hour boundary.

The runtime rejects mismatched action inputs, unsupported routes, control characters, backward timestamps, decreasing progress, impossible lifecycle transitions, active updates at or after expiry, and completion below the prepared target.

## Registered actions

| Action | Family | Routes | Progress |
| --- | --- | --- | --- |
| Three Beautiful Things | Discover | iPhone, Watch through iPhone | 3 discoveries |
| Breathing Reset | Reset | Workbench, iPhone, Watch through iPhone | 60, 120, or 180 seconds |
| Six Line Story | Create | Workbench only | 6 lines |
| Tiny Detour | Discover | iPhone, Watch through iPhone | 1 completion |

Nearby Tiny Detour preparation remains blocked until a separate location connector permission contract exists. The location-neutral version does not require that capability.

## Lifecycle

The guarded lifecycle is pending, delivered to iPhone, delivered to Watch, acknowledged, in progress, and completed. Failed actions may be retried within the existing safe handoff behavior. Cancellation and expiry are explicit terminal states. Completion is accepted only when the prepared progress target is confirmed.

## Outcome and memory boundary

An outcome contains status, time, a fixed privacy-safe summary, and a memory disposition. It never copies the prompt, response text, photo content, location, health data, or evidence into the runtime result.

Successful completion is marked `awaiting-user-choice`. It does not become durable Nora memory automatically. Failed, cancelled, and expired actions are not eligible for memory.

## Transport support

`DemoTransport` exercises the full typed runtime offline and remains the recordable hackathon path. `RelayTransport` maps the Three Beautiful Things action to the existing version 1 relay protocol and validates every returned snapshot against the prepared contract.

The live relay does not yet accept the other registered action types. Their runtime contracts are implemented and tested, but their device adapters and user-facing launch controls are later work.

## Persistence boundary

Session recovery stores only bounded simulated status metadata: action ID, type, route, progress target, progress unit, progress count, expiry, and update time. It does not store prompts, consent receipts, private writing, photos, memory evidence, or health data.
