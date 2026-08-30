import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function generateArchitectureDiagram() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Somnora Architecture Diagram</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #0b0f17;
      color: #e2e8f0;
      padding: 40px;
      width: 1920px;
      height: 1080px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      color: white;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }
    .title-group h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #f8fafc;
    }
    .title-group p {
      font-size: 14px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .badge-group {
      display: flex;
      gap: 10px;
    }
    .pill {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
    }
    .pill.highlight {
      background: rgba(99, 102, 241, 0.18);
      border-color: rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
    }
    .pill.cloud {
      background: rgba(59, 130, 246, 0.18);
      border-color: rgba(59, 130, 246, 0.4);
      color: #93c5fd;
    }

    /* Main Grid */
    .grid-container {
      display: grid;
      grid-template-columns: 1.15fr 1fr 1.15fr;
      gap: 24px;
      flex: 1;
    }

    /* Columns */
    .column {
      background: rgba(17, 24, 39, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      backdrop-filter: blur(12px);
    }
    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
    }
    .column-title {
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-indigo { background: #818cf8; box-shadow: 0 0 8px #818cf8; }
    .dot-blue { background: #60a5fa; box-shadow: 0 0 8px #60a5fa; }
    .dot-purple { background: #c084fc; box-shadow: 0 0 8px #c084fc; }
    .column-tag {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    /* Cards */
    .card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card.primary {
      background: rgba(30, 41, 59, 0.85);
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
    .card.google-card {
      border-color: rgba(59, 130, 246, 0.3);
      background: rgba(30, 41, 59, 0.85);
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }
    .card-badge.active {
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.4);
    }
    .card-desc {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.45;
    }
    .card-subitems {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 4px;
    }
    .subitem {
      background: rgba(15, 23, 42, 0.6);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.04);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Flow Connectors Bar */
    .flow-bar {
      margin-top: 20px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .flow-step {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .flow-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.25);
      border: 1px solid #818cf8;
      color: #e0e7ff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .flow-text {
      font-size: 12px;
      font-weight: 500;
      color: #cbd5e1;
    }
    .flow-arrow {
      color: #64748b;
      font-size: 14px;
      font-weight: 700;
    }

    /* Security banner */
    .security-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 10px;
      padding: 10px 18px;
      font-size: 11.5px;
      color: #6ee7b7;
      margin-top: 12px;
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <div class="header">
    <div class="header-left">
      <div class="logo-badge">S</div>
      <div class="title-group">
        <h1>Somnora System & Ecosystem Architecture</h1>
        <p>Explainable, Consent-Controlled AI Companion & Cross-Device Action Loop</p>
      </div>
    </div>
    <div class="badge-group">
      <div class="pill highlight">Track 2: Collaborative Partner</div>
      <div class="pill cloud">Google Cloud & Firebase Powered</div>
      <div class="pill">macOS • iOS • watchOS</div>
    </div>
  </div>

  <!-- 3-Tier Grid Layout -->
  <div class="grid-container">

    <!-- Column 1: Client Surfaces -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">
          <span class="dot dot-indigo"></span>
          Somnora Desktop Client (Electron & Web)
        </div>
        <span class="column-tag">TIER 1 • DESKTOP</span>
      </div>

      <div class="card primary">
        <div class="card-title">
          <span>Living Nora Home & Consent Loop</span>
          <span class="card-badge active">React 19 / Vite</span>
        </div>
        <div class="card-desc">
          Detects creative dry spells, presents inspectable "Why this" evidence paths, and issues bounded invitations.
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Inspectable Memory Graph ("About Me")</span>
          <span class="card-badge">React Flow</span>
        </div>
        <div class="card-desc">
          Interactive theme nodes linked to source journals and biometric trends with user-sovereign edit/forget controls.
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Action Desk & Consent Console</span>
          <span class="card-badge">Security Boundary</span>
        </div>
        <div class="card-desc">
          Strict separation of Observations, Proposals, and Authorized Execution with domain-level sliders (Observe / Suggest / Prepare).
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Capacity-Aware Activity Studio</span>
          <span class="card-badge">Adaptive Engine</span>
        </div>
        <div class="card-desc">
          Six Line Story, Sensory Reset, and Burn Exercise tuned to real-time energy, time budget, and local context.
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Transport Abstraction Layer</span>
          <span class="card-badge">Dual-Path</span>
        </div>
        <div class="card-subitems">
          <div class="subitem">Deterministic DemoTransport</div>
          <div class="subitem">Auth RelayTransport (Firebase)</div>
        </div>
      </div>
    </div>

    <!-- Column 2: Google Cloud & Firebase Backend Tier -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">
          <span class="dot dot-blue"></span>
          Google Cloud & Agentic Cloud Tier
        </div>
        <span class="column-tag">TIER 2 • CLOUD SERVICES</span>
      </div>

      <div class="card google-card">
        <div class="card-title">
          <span>Google Gemini API & Vertex AI</span>
          <span class="card-badge active">Agent Intelligence</span>
        </div>
        <div class="card-desc">
          Reasoning engine behind Nora pattern synthesis, explainable evidence correlation, and capacity-aware prompt distillation.
        </div>
      </div>

      <div class="card google-card">
        <div class="card-title">
          <span>Google Cloud Run (Nora Relay Proxy)</span>
          <span class="card-badge active">Serverless Microservice</span>
        </div>
        <div class="card-desc">
          Node.js / Express proxy enforcing role isolation (Browser vs Mobile), monotonic status machines, and strict JSON schemas.
        </div>
      </div>

      <div class="card google-card">
        <div class="card-title">
          <span>Google Cloud Firestore</span>
          <span class="card-badge active">Document Database</span>
        </div>
        <div class="card-desc">
          Stores short-lived HMAC-hashed pairing codes, bounded action contracts, expiry states, and telemetry metadata.
        </div>
      </div>

      <div class="card google-card">
        <div class="card-title">
          <span>Firebase Authentication & SDKs</span>
          <span class="card-badge active">Identity Boundary</span>
        </div>
        <div class="card-desc">
          Issues distinct, cryptographically verified tokens for Workbench and Mobile instances to prevent impersonation.
        </div>
      </div>

      <div class="card google-card">
        <div class="card-title">
          <span>Cloud SQL / Memorystore Redis</span>
          <span class="card-badge">Security & Caching</span>
        </div>
        <div class="card-desc">
          High-throughput rate limiting, token replay mitigation, and automated fallback caching for relay stability.
        </div>
      </div>
    </div>

    <!-- Column 3: Mobile & Wearable Execution Tier -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">
          <span class="dot dot-purple"></span>
          Mobile & Wearable Physical Loop
        </div>
        <span class="column-tag">TIER 3 • CROSS-DEVICE</span>
      </div>

      <div class="card primary">
        <div class="card-title">
          <span>Somnora iOS Application</span>
          <span class="card-badge active">Swift 6 / SwiftUI</span>
        </div>
        <div class="card-desc">
          Claims 6-digit pairing code via Firebase Auth, validates invitation schema, and coordinates haptic watch session.
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Somnora Apple Watch Application</span>
          <span class="card-badge active">watchOS 26</span>
        </div>
        <div class="card-desc">
          Receives credential-free compact action payload via WatchConnectivity. Guides user on "Three Beautiful Things" walk.
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Real-World Sensory Discovery</span>
          <span class="card-badge">Haptic Guidance</span>
        </div>
        <div class="card-desc">
          Haptic taps prompt user to notice surroundings, recording milestone count (1/3, 2/3, 3/3) without raw audio/photo transmission.
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Private Field Note Loop Closure</span>
          <span class="card-badge">Desktop Sync</span>
        </div>
        <div class="card-desc">
          Completed walk syncs back to Desktop Workbench to generate a permanent, private Field Note, restoring creative momentum.
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>On-Device Privacy Sandbox</span>
          <span class="card-badge">Data Residency</span>
        </div>
        <div class="card-subitems">
          <div class="subitem">HealthKit Stays Local</div>
          <div class="subitem">Raw Photos Kept on Phone</div>
        </div>
      </div>
    </div>

  </div>

  <!-- End-to-End Action Lifecycle -->
  <div class="flow-bar">
    <div class="flow-step">
      <div class="flow-number">1</div>
      <div class="flow-text">Pattern Noticed (Eureka Dry Spell)</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">
      <div class="flow-number">2</div>
      <div class="flow-text">Explainable Evidence Checked</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">
      <div class="flow-number">3</div>
      <div class="flow-text">User Explicit Acceptance</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">
      <div class="flow-number">4</div>
      <div class="flow-text">Cloud Run & Firebase Relay</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">
      <div class="flow-number">5</div>
      <div class="flow-text">Apple Watch Haptic Outing</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">
      <div class="flow-number">6</div>
      <div class="flow-text">Private Field Note Closure</div>
    </div>
  </div>

  <!-- Security & Privacy Guarantee Footer -->
  <div class="security-banner">
    <div><strong>Privacy & Governance Guarantee:</strong> Zero raw PII, journal text, or HealthKit metrics egress to cloud layers. Short-lived HMAC pairing codes with monotonic state validation.</div>
    <div><strong>Built For:</strong> All Things Agentic Hackathon (Track 2)</div>
  </div>

</body>
</html>
`;

  const outputPathHtml = '/tmp/architecture_diagram.html';
  fs.writeFileSync(outputPathHtml, htmlContent, 'utf8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });

  await page.goto('file://' + outputPathHtml, { waitUntil: 'networkidle' });

  const desktopPng = '/Users/jamesmcshane/Desktop/Somnora-Architecture-Diagram.png';
  const repoPng = '/Users/jamesmcshane/Desktop/Somnora-Workbench/docs/Somnora-Architecture-Diagram.png';
  const desktopPdf = '/Users/jamesmcshane/Desktop/Somnora-Architecture-Diagram.pdf';

  await page.screenshot({ path: desktopPng, fullPage: true });
  await page.screenshot({ path: repoPng, fullPage: true });
  await page.pdf({ path: desktopPdf, width: '1920px', height: '1080px', printBackground: true });

  await browser.close();
  console.log('Successfully generated architecture diagrams!');
  console.log('Desktop PNG:', desktopPng);
  console.log('Desktop PDF:', desktopPdf);
  console.log('Repo PNG:', repoPng);
}

generateArchitectureDiagram().catch(console.error);
