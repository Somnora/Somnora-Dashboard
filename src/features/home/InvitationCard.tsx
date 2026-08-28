import type { InvitationAdjustment } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { Modal } from '../common/Modal'
import { InvitationWorkspace } from '../invitations/InvitationWorkspace'

const familyLabels = {
  discover: 'Discover',
  connect: 'Connect',
  create: 'Create',
  reflect: 'Reflect',
  reset: 'Reset',
} as const

export function InvitationCard() {
  const { state, dispatch } = useWorkbench()
  const { invitation } = state

  if (state.invitationDisposition === 'declined') {
    return (
      <GlassPanel className="invitation-card declined-card">
        <p className="eyebrow">Invitation closed</p>
        <h2>No pressure.</h2>
        <p>
          Nora will leave this one here. Nothing was scheduled or sent to your
          devices.
        </p>
        {state.invitationFeedback === 'less-like-this' ? (
          <p className="feedback-confirmation" role="status">
            Got it. Photo walks will be treated as a weaker fit in this session.
          </p>
        ) : (
          <button
            className="text-button"
            onClick={() => dispatch({ type: 'less-like-this' })}
            type="button"
          >
            Less like this
          </button>
        )}
      </GlassPanel>
    )
  }

  if (state.invitationDisposition === 'accepted') {
    return <InvitationWorkspace />
  }

  return (
    <>
      <GlassPanel className="invitation-card">
        <div className="invitation-topline">
          <span className="family-pill">{familyLabels[invitation.family]}</span>
          <span className="invitation-time">{invitation.estimatedMinutes} min</span>
        </div>
        <p className="nora-observation">{invitation.observation}</p>
        <h2>{invitation.title}</h2>
        <p className="invitation-prompt">{invitation.prompt}</p>
        <dl className="invitation-facts">
          <div>
            <dt>Energy</dt>
            <dd>{invitation.energy}</dd>
          </div>
          <div>
            <dt>Privacy</dt>
            <dd>Photos stay on iPhone</dd>
          </div>
          <div>
            <dt>Why now</dt>
            <dd>Four quiet Eureka days</dd>
          </div>
        </dl>
        <div className="invitation-actions">
          <button
            className="primary-button"
            onClick={() => dispatch({ type: 'accept-invitation' })}
            type="button"
          >
            Accept invitation
          </button>
          <button
            className="secondary-button"
            onClick={() => dispatch({ type: 'open-adjustment' })}
            type="button"
          >
            Adjust
          </button>
          <button
            className="text-button"
            onClick={() => dispatch({ type: 'open-why' })}
            type="button"
          >
            Why this
          </button>
          <button
            className="text-button muted-action"
            onClick={() => dispatch({ type: 'decline-invitation' })}
            type="button"
          >
            Not now
          </button>
        </div>
        <p className="privacy-note">{invitation.privacy}</p>
      </GlassPanel>
      <Modal
        description="Choose one way to make the activity fit your current capacity. The revised invitation will still wait for acceptance."
        eyebrow="Adjust the invitation"
        onClose={() => dispatch({ type: 'close-adjustment' })}
        open={state.adjustmentOpen}
        title="What would fit better?"
      >
        <div className="adjustment-list">
          {invitation.alternatives.map((alternative) => (
            <button
              className="adjustment-option"
              key={alternative.adjustment}
              onClick={() =>
                dispatch({
                  type: 'apply-adjustment',
                  value: alternative.adjustment as InvitationAdjustment,
                })
              }
              type="button"
            >
              <strong>{alternative.label}</strong>
              <span>{alternative.description}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
