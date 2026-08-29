# Growth Without Gamification

## Purpose

Growth gives the user a calm way to compare meaningful moments across time. It is not a wellness score, productivity system, or reward loop. Nora can assemble a possible story from inspectable context, but the user decides whether that story feels true.

## Current slice

The seeded Workbench presents three comparisons:

1. A bedtime boundary that the user confirmed had held for two weeks.
2. Returned curiosity across a park walk and a later Eureka entry.
3. Agency across a declined writing exercise and a completed breathing reset.

Each comparison labels its seeded source, confidence, supporting words, and source destination. The third comparison intentionally places a no beside a completion so the interface does not define growth as compliance.

## User review

Each story offers three equal choices:

- This feels true.
- Not yet.
- Needs nuance.

The review is held in Workbench reducer memory for the current session only. It is not written to local storage, session storage, the relay, or durable Nora memory. A reviewed story appears in the universal timeline as session-only context. A production memory write would require a separate, explicit user choice.

## Evidence and forgetting

Source-backed stories reuse the same evidence identifiers as About Me. If supporting memory is forgotten through the existing memory control, the dependent growth story is removed from the active view. Action history comparisons disclose when they contain no hidden journal evidence.

## Standing boundaries

- No points, levels, ranks, badges, or emotional leaderboards.
- No streak pressure or penalty for a quiet period.
- No reward for disclosing more private information.
- No diagnosis, clinical improvement score, or causal claim.
- No claim that an observed pattern is universally true.
- No durable learning without another explicit user decision.
