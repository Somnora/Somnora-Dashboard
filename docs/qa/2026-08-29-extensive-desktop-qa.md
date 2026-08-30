# Somnora Workbench extensive desktop QA

Date: August 29, 2026

## Release decision

Status: PARTIAL

The desktop Workbench is stable in preview mode and the unpaired relay state. Conversations, pairing, and About Me are implemented against the live relay, but the physical iPhone claim and Apple Watch round trip remain unverified. Most other destinations still use clearly labeled seeded preview data.

## Coverage completed

- Hands-on navigation through Home, Action Desk, Consent Console, Conversations, Context Timeline, About Me, Growth, Activity Studio, Context Sources, Themes, and Analytics.
- Interaction checks for Action Desk filters, consent controls, timeline filters, activity filtering, the private Six Line Story, memory evidence inspection, memory correction entry, and pairing code generation.
- Private Six Line Story text was confirmed to clear when the exercise closes.
- Keyboard checks covered primary navigation, modal focus trapping, Escape dismissal, focus restoration, and the workspace skip link.
- Responsive checks covered 1440 by 900, 1280 by 800, 1280 by 600, and relay mode at 760 by 800.
- Reduced motion, browser console output, lazy destination failure, server interruption, relay recovery, and production build behavior were checked.
- The live pairing status fix was deployed to Cloud Run revision `somnora-proxy-00163-bsv`, verified at 100 percent traffic, and confirmed to recover automatically on the next ten-second check with no browser console errors.
- Automated results: 79 unit and component tests passed. 34 browser end-to-end tests passed. The focused compact relay test passed.

## Fixed during QA

### WB-QA-001: Paired browser link expired after ten minutes

Severity: High

The browser stored the pairing code expiration as the paired device expiration. Reloading after ten minutes could discard a link that the product promises will last 30 days. The paired state now adopts the relay's 30-day expiration before it is saved.

### WB-QA-002: Pairing polling could leave a permanent rate-limit alert

Severity: High

The waiting screen checked pairing every 2.5 seconds and did not clear a polling error after a later successful response. Polling now runs every ten seconds, successful waiting checks clear the error, and temporary interruptions explain that automatic retry continues. The authenticated read budget now matches the existing 30-per-minute ceiling across a full day without changing pairing creation or claim limits.

### WB-QA-003: A failed destination chunk blanked the entire Workbench

Severity: High

If a lazy-loaded destination failed during a local server interruption or stale deployment, React removed the complete interface. A destination error boundary now preserves navigation and presents a clear reload action without implying account data changed.

### WB-QA-004: Short desktop windows hid Themes and Analytics

Severity: High

At 1280 by 600, the navigation rail extended below the clipped application window. The rail now scrolls independently in short desktop windows, and Analytics is covered by a regression test at that size.

### WB-QA-005: Compact Conversations delayed the pairing instructions

Severity: Medium

The unpaired compact layout reserved 520 pixels for an empty thread list before showing the phone link. The unpaired list may now collapse while the pairing workspace retains a usable minimum height.

### WB-QA-006: Compact relay mode hid every preview disclosure

Severity: High

Below 820 pixels, both the preview badge and device status disappeared. Seeded Jules content could therefore look like live account data. The preview badge now remains visible, and a relay-specific 760 by 800 regression test covers the state.

### WB-QA-007: A failed Nora send discarded the draft

Severity: Medium

The composer cleared text before the relay confirmed success. It now clears only after a successful send, so a network or Nora error leaves the draft available to retry.

### WB-QA-008: An unpaired relay used the connected status color

Severity: Medium

The status dot defaulted to the success color whenever it was not waiting. Unpaired relay state is now neutral, waiting remains coral, and only a connected or demo continuity state uses success.

### WB-QA-009: Keyboard users had to cross the full navigation rail

Severity: Medium

A visible-on-focus Skip to workspace link now moves focus directly to the main content.

## Open issues and proof gaps

### WB-QA-010: Most destinations are not live account surfaces

Severity: Critical product gap

Only Conversations and About Me currently load paired account data. Home, Action Desk, Consent Console, Context Timeline, Growth, Activity Studio, Context Sources, Themes, and Analytics still use the seeded Jules preview. The header now labels those surfaces as Preview data, including when an account is paired, but this remains the largest gap between the current product and a fully live demo.

### WB-QA-011: Physical three-device continuity is not proven

Severity: Critical release proof gap

This pass generated and polled real production pairing codes, but it did not claim one from a physical iPhone. Live history loading, continuing a Nora thread, Apple Watch capture provenance, background interruption, and persistence after a physical claim still require the TestFlight build and devices.

### WB-QA-012: Live browser permissions were not granted

Severity: Medium proof gap

Location and calendar behavior passed mocked browser tests. This pass did not grant the browser precise location access or upload a personal calendar file. Those actions require an explicit privacy decision and are not necessary for the core phone and Nora continuity proof.

### WB-QA-013: Paired send failure recovery lacks physical account proof

Severity: Medium proof gap

The composer now retains text unless the send succeeds, and the transport path has automated coverage. A real paired account should still be taken offline during a physical QA pass to confirm the draft remains visible and resends cleanly.

## Recommended next QA run

1. Install build 30 on the physical iPhone.
2. Generate one fresh Workbench code and claim it from Settings.
3. Confirm the Workbench remains paired after a reload and again after the original ten-minute code window passes.
4. Continue one Dream, Daily, and Eureka thread from the desktop.
5. Interrupt the network during a desktop draft and verify the draft remains.
6. Capture a new Eureka idea on Apple Watch and continue that exact thread on the desktop.
7. Record the complete live path without using any seeded preview destination as proof of account data.
