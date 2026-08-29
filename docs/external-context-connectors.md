# External World Connectors

Context Sources is Somnora's permissioned boundary between outside signals and Nora's activity matching. It gives the user one place to inspect what a connector can see, why Nora would use it, how fresh it is, whether it failed, and what Somnora retains.

## What is implemented

The Workbench implements four connector surfaces with deliberately different availability states:

- Approximate location is requested only after the user selects **Use location once for weather**. The browser supplies coordinates for one weather request. Somnora does not store or reverse geocode them.
- Weather can replace the privacy-safe seeded condition with current Open-Meteo conditions. It returns to the deterministic demo source on request or if the live request fails.
- Calendar availability imports one ICS file locally. The browser reduces the next eight hours to busy block count, busy minutes, and the largest useful gap. Titles, attendees, locations, descriptions, and file contents are not retained.
- Local events are three explicitly fictitious, privacy-safe demo options. Opening a location requires a separate click and uses Apple Maps. These are not live listings.

Somnora Fitness and Somnora Nutrition remain visible but disconnected. They have no permission control because no adapter exists yet.

## Normalized context

Nora receives only a small activity-matching summary:

- Clear, rain, or hot weather state and its visible source
- A five, ten, twenty, or thirty minute availability window and its visible source
- The number of seeded event options

Activity Studio applies that summary only when the user selects **Use current context**. Connecting context does not start an activity or grant Nora permission to message, schedule, purchase, share, or contact a device.

## Network and storage boundary

The default demo makes no connector network request. A live request occurs only after the browser's location prompt and user approval. Coordinates are sent directly from the browser to Open-Meteo's forecast endpoint for current conditions, then discarded by the Workbench. No location history is created.

Calendar parsing occurs in the browser. Imported calendar contents and derived summaries are not written to local storage or session storage. Connector state lasts only for the current page session.

## Failure behavior

- Location denial, an unavailable browser API, timeout, oversized response, malformed response, or unsupported weather values produce a visible failure state.
- Weather failures keep the privacy-safe seeded condition available instead of presenting stale live data.
- Calendar files larger than 256 KB or without a valid ICS calendar envelope are rejected with a visible message.
- Disconnected future adapters cannot imply active access.

## Current limits

Open-Meteo is called directly by the browser for this local proof of concept. Production should move provider policy, quotas, observability, and any location privacy controls behind an authenticated Somnora service before deployment.

Live event discovery, calendar account authorization, Fitness, and Nutrition are not implemented. Their interfaces remain demo-only or disconnected and are labeled accordingly.
