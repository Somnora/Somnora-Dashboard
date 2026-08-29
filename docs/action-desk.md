# Nora Action Desk

The Nora Action Desk is the inspectable activity history for Somnora Workbench. Home remains the place where Nora presents one current judgment. Action Desk shows the authority and lifecycle behind that judgment without becoming a task marketplace or an execution console.

## Product distinction

The Desk keeps three concepts separate:

1. Nora notices bounded context.
2. Nora proposes an optional action and explains why.
3. The user authorizes, declines, or leaves the proposal waiting.

Device activity appears only after a separate send decision. Device status is reported as confirmation, never inferred from intent.

## Record stages

- Noticed: Nora observed bounded context. No consent is requested and no action is prepared.
- Proposed: Nora surfaced one optional invitation. It is waiting for the user.
- Approved: the user approved the invitation. Sending remains a separate decision.
- Active: an approved action is moving through its prepared route or gathering bounded progress.
- Completed: the prepared progress boundary was confirmed.
- Failed: the device chain did not confirm completion.
- Declined: the user chose not now. This is a preference boundary, not a failure.
- Stopped: cancellation or expiry ended authority for the action.

## Inspector contract

Every record can expose:

- Authority: who noticed, approved, initiated, or confirmed the state.
- Consent: not requested, waiting for the user, explicitly approved, or declined.
- Route: no route, a planned route that has not been sent, or the prepared active route.
- Progress: the bounded target and confirmed amount.
- Source: current session or privacy-safe seeded history.
- Memory: no durable write, not eligible, or awaiting a separate user choice.
- Privacy: the data categories that remain outside the relay and record.

Current records can route the user back to Home or into the supporting About Me context. The Desk cannot start, send, schedule, message, or write an outcome to durable memory.

## Demo boundary

The current invitation and runtime state are derived from the live Workbench reducer. Older completed, failed, and declined records are privacy-safe seeded history. They demonstrate the history language and are labeled as seeded. They are not a production activity ledger and do not imply deployed account synchronization.

The Action Desk stores no additional browser data. It derives its current record from existing bounded state and static demo fixtures.
