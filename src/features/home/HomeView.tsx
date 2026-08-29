import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { AutonomyControl } from './AutonomyControl'
import { InvitationCard } from './InvitationCard'
import { StretchLevelControl } from './StretchLevelControl'
import { ActivityShelf } from '../reflect/ActivityShelf'
import { evaluateHeroConsent } from '../../domain/consentPolicy'

export function HomeView() {
  const { state, dispatch } = useWorkbench()
  const heroConsent = evaluateHeroConsent(state.consentPolicies)
  const existingAction = state.invitationDisposition === 'accepted' || state.delivery.status !== 'idle'

  return (
    <div className="home-layout">
      <section className="home-primary" aria-label="Nora's current invitation">
        <div className="nora-opening">
          <span className="nora-orb" aria-hidden="true" />
          <div>
            <p className="eyebrow">Nora noticed something</p>
            <p>
              You have kept moving, but your surroundings have not. I found one
              small experiment that fits tonight.
            </p>
          </div>
        </div>
        {state.autonomy === 'quiet' && !existingAction ? (
          <GlassPanel className="quiet-card">
            <p className="eyebrow">Quiet autonomy</p>
            <h2>Nora is holding the observation.</h2>
            <p>
              Switch Autonomy to Balanced or Active when you want proactive
              invitations to appear.
            </p>
          </GlassPanel>
        ) : !heroConsent.canSuggest && !existingAction ? (
          <GlassPanel className="quiet-card consent-held-card">
            <p className="eyebrow">Held by your consent settings</p>
            <h2>Nora noticed the pattern and stopped there.</h2>
            <p>{heroConsent.suggestionBoundary}</p>
            <button
              className="secondary-button"
              onClick={() => dispatch({ type: 'navigate', destination: 'consent' })}
              type="button"
            >
              Review consent settings
            </button>
          </GlassPanel>
        ) : (
          <InvitationCard />
        )}
      </section>
      <aside className="home-sidebar" aria-label="Nora invitation preferences">
        <GlassPanel className="preferences-panel">
          <p className="eyebrow">Boundaries</p>
          <h2>Your pace, still your call.</h2>
          <AutonomyControl />
          <StretchLevelControl />
          <p className="consent-copy">
            Nora can notice and suggest. Scheduling, messaging, and device
            handoff always wait for you.
          </p>
          <button
            className="text-button consent-console-link"
            onClick={() => dispatch({ type: 'navigate', destination: 'consent' })}
            type="button"
          >
            Open Consent Console
          </button>
        </GlassPanel>
        <GlassPanel className="memory-preview">
          <p className="eyebrow">About Me signal</p>
          <strong>Scene changes restore curiosity</strong>
          <p>Confirmed by you, supported by two recent entries.</p>
        </GlassPanel>
        <ActivityShelf />
      </aside>
    </div>
  )
}
