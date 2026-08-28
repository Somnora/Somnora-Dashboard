import type { DeliveryStatus } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { ErrorState } from '../common/ErrorState'
import { GlassPanel } from '../common/GlassPanel'
import { FieldNote } from './FieldNote'

const timeline: Array<{ status: DeliveryStatus; label: string; detail: string }> = [
  { status: 'pending', label: 'Pending', detail: 'Accepted in Workbench' },
  { status: 'delivered-phone', label: 'Delivered to iPhone', detail: 'Phone relay confirmed' },
  { status: 'delivered-watch', label: 'Delivered to Watch', detail: 'Watch relay confirmed' },
  { status: 'acknowledged', label: 'Acknowledged', detail: 'Ready to begin' },
]

function DeliveryTimeline({ status }: { status: DeliveryStatus }) {
  const currentIndex = timeline.findIndex((item) => item.status === status)
  const finalIndex = ['in-progress', 'completed'].includes(status)
    ? timeline.length - 1
    : currentIndex

  return (
    <ol className="delivery-timeline" aria-label="Simulated device delivery progress">
      {timeline.map((item, index) => {
        const reached = index <= finalIndex
        const current = index === finalIndex
        return (
          <li className={reached ? 'is-reached' : ''} key={item.status}>
            <span aria-hidden="true">{reached ? '' : index + 1}</span>
            <div>
              <strong>{item.label}</strong>
              <small>{current ? item.detail : reached ? 'Confirmed' : 'Waiting'}</small>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function DemoQaControls() {
  const { state, mission } = useWorkbench()
  const active = !['completed', 'cancelled', 'expired'].includes(state.delivery.status)

  if (!active || state.delivery.status === 'idle') return null

  return (
    <details className="demo-qa-controls">
      <summary>Demo recovery checks</summary>
      <p>These controls expose failure handling for judging and QA. They do not represent live devices.</p>
      <div>
        {state.delivery.status !== 'failed' ? (
          <button className="text-button" onClick={mission.simulateFailure} type="button">
            Simulate relay failure
          </button>
        ) : null}
        {!['failed', 'in-progress'].includes(state.delivery.status) ? (
          <button className="text-button" onClick={mission.simulateExpiry} type="button">
            Simulate expiry
          </button>
        ) : null}
        <button className="text-button muted-action" onClick={() => void mission.cancel()} type="button">
          Cancel handoff
        </button>
      </div>
    </details>
  )
}

export function InvitationWorkspace() {
  const { state, mission } = useWorkbench()
  const { delivery, invitation } = state

  if (delivery.status === 'completed') {
    return (
      <GlassPanel className="invitation-card mission-card completed-mission">
        <FieldNote />
      </GlassPanel>
    )
  }

  if (delivery.status === 'failed') {
    return (
      <GlassPanel className="invitation-card mission-card">
        <ErrorState
          actions={
            <>
              <button className="primary-button" onClick={mission.retry} type="button">Retry handoff</button>
              <button className="text-button" onClick={() => void mission.cancel()} type="button">Cancel</button>
            </>
          }
          body={delivery.errorMessage ?? 'The next device state was not confirmed.'}
          title="Nothing was marked delivered."
        />
      </GlassPanel>
    )
  }

  if (delivery.status === 'cancelled' || delivery.status === 'expired') {
    return (
      <GlassPanel className="invitation-card mission-card">
        <p className="eyebrow">{delivery.status === 'expired' ? 'Handoff expired' : 'Handoff cancelled'}</p>
        <h2>No device action is active.</h2>
        <p>
          The simulated relay stopped without implying delivery. Reset the loop when you want to try again.
        </p>
        <button className="secondary-button" onClick={mission.reset} type="button">Reset invitation</button>
      </GlassPanel>
    )
  }

  if (delivery.status === 'idle') {
    return (
      <GlassPanel className="invitation-card mission-card consented-mission">
        <p className="eyebrow">Invitation accepted</p>
        <h2>{invitation.title}</h2>
        <p>{invitation.prompt}</p>
        <div className="consent-summary">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>Consent recorded. No delivery yet.</strong>
            <small>The next button starts a clearly labeled local simulation.</small>
          </div>
        </div>
        <button className="primary-button" onClick={() => void mission.send()} type="button">
          Send to iPhone and Watch
        </button>
        <p className="privacy-note">
          DemoTransport runs offline. It carries the activity and status only, never photo bytes, health data, or memory evidence.
        </p>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel className="invitation-card mission-card">
      <div className="mission-heading">
        <div>
          <p className="eyebrow">Simulated ecosystem handoff</p>
          <h2>{invitation.title}</h2>
        </div>
        <span className="demo-badge">Demo status</span>
      </div>
      <DeliveryTimeline status={delivery.status} />
      {delivery.status === 'acknowledged' ? (
        <div className="mission-next-step">
          <p>The Watch acknowledged the invitation. The activity still starts only when you choose.</p>
          <button className="primary-button" onClick={mission.start} type="button">Start activity</button>
        </div>
      ) : null}
      {delivery.status === 'in-progress' ? (
        <div className="mission-progress">
          <div className="progress-heading">
            <p className="eyebrow">Field progress</p>
            <strong>{delivery.progressCount} of 3</strong>
          </div>
          <div className="photo-progress" aria-label={`${delivery.progressCount} of 3 demo photos complete`}>
            {[0, 1, 2].map((index) => (
              <div className={index < delivery.progressCount ? 'is-complete' : ''} key={index}>
                {index < delivery.progressCount ? <img alt="" src={`/assets/demo-field-notes/${['glass', 'ocean', 'rain'][index]}.jpg`} /> : <span>{index + 1}</span>}
              </div>
            ))}
          </div>
          <button className="primary-button" onClick={mission.addPhoto} type="button">
            Add next demo photo
          </button>
          <p className="privacy-note">Only the count changes in relay state. The images shown here are bundled demo assets.</p>
        </div>
      ) : null}
      <DemoQaControls />
    </GlassPanel>
  )
}
