import { useMemo, useState } from 'react'
import {
  consentCapabilities,
  consentCapabilityAllows,
  consentDomains,
  isConsentCapabilityAvailable,
} from '../../domain/consentPolicy'
import type {
  ConsentCapability,
  ConsentDomain,
} from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { buildActionDeskRecords } from '../../domain/actionDesk'
import { GlassPanel } from '../common/GlassPanel'
import { AutonomyControl } from '../home/AutonomyControl'
import { StretchLevelControl } from '../home/StretchLevelControl'

function capabilityAnswer(
  current: ConsentCapability,
  required: ConsentCapability,
): string {
  return consentCapabilityAllows(current, required) ? 'Allowed' : 'Not allowed'
}

export function ConsentConsoleView() {
  const { profile, state, dispatch } = useWorkbench()
  const [selectedDomain, setSelectedDomain] = useState<ConsentDomain>('eureka')
  const selected = consentDomains.find((domain) => domain.id === selectedDomain) ?? consentDomains[0]
  const selectedCapability = state.consentPolicies[selected.id]
  const actionRecords = useMemo(
    () => buildActionDeskRecords(profile, state),
    [profile, state],
  )
  const activeActionCount = actionRecords.filter((record) => record.stage === 'active').length
  const availableDomains = consentDomains.filter((domain) => domain.sourceState === 'seeded').length
  const preparedDomains = consentDomains.filter((domain) =>
    consentCapabilityAllows(state.consentPolicies[domain.id], 'prepare'),
  ).length
  const actionInMotion = ![
    'idle',
    'completed',
    'failed',
    'cancelled',
    'expired',
  ].includes(state.delivery.status)

  return (
    <div className="consent-console-layout">
      <section className="consent-console-main" aria-label="Consent and autonomy controls">
        <GlassPanel className="consent-console-introduction">
          <div>
            <p className="eyebrow">Permission before proactivity</p>
            <h2>Nora can be proactive without being in charge.</h2>
            <p>
              Choose where Nora may observe, suggest, or prepare. Every consequential
              action still asks you at the moment it matters.
            </p>
          </div>
          <dl aria-label="Consent Console summary">
            <div><dt>Available now</dt><dd>{availableDomains}</dd></div>
            <div><dt>May prepare</dt><dd>{preparedDomains}</dd></div>
            <div><dt>May act</dt><dd>Ask</dd></div>
          </dl>
        </GlassPanel>

        <GlassPanel className="consent-global-posture">
          <div className="consent-global-heading">
            <div>
              <p className="eyebrow">Global posture</p>
              <h3>Initiative and challenge stay separate.</h3>
            </div>
            <div className="global-action-lock">
              <span aria-hidden="true">A</span>
              <div>
                <small>Consequential actions</small>
                <strong>Ask every time</strong>
              </div>
            </div>
          </div>
          <div className="consent-global-controls">
            <AutonomyControl />
            <StretchLevelControl />
          </div>
        </GlassPanel>

        <section className="consent-domain-browser" aria-labelledby="consent-domains-title">
          <header>
            <div>
              <p className="eyebrow">Context permissions</p>
              <h3 id="consent-domains-title">Set the maximum Nora may do in each domain.</h3>
            </div>
            <p>Prepare means draft for review. It never means send, schedule, publish, or contact.</p>
          </header>

          <div className="consent-domain-list">
            {consentDomains.map((domain) => {
              const current = state.consentPolicies[domain.id]
              return (
                <article
                  className={`consent-domain-row ${selected.id === domain.id ? 'is-selected' : ''}`}
                  key={domain.id}
                >
                  <button
                    aria-pressed={selected.id === domain.id}
                    className="consent-domain-summary"
                    onClick={() => setSelectedDomain(domain.id)}
                    type="button"
                  >
                    <span>
                      <strong>{domain.label}</strong>
                      <small>{domain.description}</small>
                    </span>
                    <span className={`source-state source-${domain.sourceState}`}>
                      {domain.sourceLabel}
                    </span>
                  </button>

                  <div
                    aria-label={`${domain.label} maximum access`}
                    className="consent-capability-control"
                    role="group"
                  >
                    {consentCapabilities.map((capability) => {
                      const available = isConsentCapabilityAvailable(domain, capability.id)
                      return (
                        <button
                          aria-pressed={current === capability.id}
                          disabled={!available}
                          key={capability.id}
                          onClick={() => {
                            setSelectedDomain(domain.id)
                            dispatch({
                              type: 'set-consent-capability',
                              domain: domain.id,
                              value: capability.id,
                            })
                          }}
                          title={available ? capability.description : 'No connector is available.'}
                          type="button"
                        >
                          {capability.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="consent-action-authority">
                    <small>Act</small>
                    <strong>{domain.sourceState === 'future' ? 'Unavailable' : 'Ask every time'}</strong>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </section>

      <aside className="consent-console-inspector" aria-label="Selected consent domain">
        <GlassPanel className="consent-inspector-card">
          <p className="eyebrow">Inspect permission boundary</p>
          <div className="consent-inspector-badges">
            <span>{selected.sourceLabel}</span>
            <span>{consentCapabilities.find((item) => item.id === selectedCapability)?.label}</span>
          </div>
          <h2>{selected.label}</h2>
          <p className="consent-inspector-description">{selected.description}</p>

          <dl className="consent-inspector-details">
            <div><dt>Observe</dt><dd>{capabilityAnswer(selectedCapability, 'observe')}</dd></div>
            <div><dt>Suggest</dt><dd>{capabilityAnswer(selectedCapability, 'suggest')}</dd></div>
            <div><dt>Prepare</dt><dd>{capabilityAnswer(selectedCapability, 'prepare')}</dd></div>
            <div><dt>Act</dt><dd>{selected.sourceState === 'future' ? 'No connector' : 'Explicit approval required'}</dd></div>
            <div><dt>Source</dt><dd>{selected.sourceLabel}</dd></div>
          </dl>

          <div className="consent-boundary-note">
            <p className="eyebrow">Data boundary</p>
            <p>{selected.dataBoundary}</p>
          </div>
          <div className="consent-preparation-note">
            <p className="eyebrow">What prepare means here</p>
            <p>{selected.preparationExample}</p>
          </div>

          {actionInMotion ? (
            <p className="active-consent-note" role="status">
              An active action keeps its original single-action consent. New settings apply
              to future suggestions and preparations. You can cancel the active action from Home.
            </p>
          ) : null}
        </GlassPanel>

        <GlassPanel className="consent-history-link">
          <div>
            <p className="eyebrow">Readable action history</p>
            <h3>{activeActionCount > 0 ? `${activeActionCount} action in motion` : 'No action in motion'}</h3>
            <p>Action Desk shows what Nora noticed, what you approved, and what devices confirmed.</p>
          </div>
          <button
            className="secondary-button"
            onClick={() => dispatch({ type: 'navigate', destination: 'action-desk' })}
            type="button"
          >
            Open Action Desk
          </button>
        </GlassPanel>
      </aside>
    </div>
  )
}
