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

function DeliveryTimeline({ status, simulated }: { status: DeliveryStatus; simulated: boolean }) {
  const currentIndex = timeline.findIndex((item) => item.status === status)
  const finalIndex = ['in-progress', 'completed'].includes(status)
    ? timeline.length - 1
    : currentIndex

  return (
    <ol className="delivery-timeline" aria-label={`${simulated ? 'Simulated' : 'Live'} device delivery progress`}>
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
  const { connection, state, mission } = useWorkbench()
  const active = !['completed', 'cancelled', 'expired'].includes(state.delivery.status)

  if (connection.mode !== 'demo' || !active || state.delivery.status === 'idle') return null

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
  const { connection, state, mission } = useWorkbench()
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
          The {delivery.simulated ? 'simulated' : 'device'} relay stopped without implying delivery. Reset the loop when you want to try again.
        </p>
        <button className="secondary-button" onClick={mission.reset} type="button">Reset invitation</button>
      </GlassPanel>
    )
  }

  if (delivery.status === 'idle') {
    const relayWaiting = connection.mode === 'relay' && connection.pairing?.status !== 'paired'
    return (
      <GlassPanel className="invitation-card mission-card consented-mission">
        <p className="eyebrow">Invitation accepted</p>
        <h2>{invitation.title}</h2>
        <p>{invitation.prompt}</p>
        <div className="consent-summary">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>Consent recorded. No delivery yet.</strong>
            <small>
              {connection.mode === 'demo'
                ? 'The next button starts a clearly labeled local simulation.'
                : 'Pair iPhone before the Workbench can send this bounded action.'}
            </small>
          </div>
        </div>
        {relayWaiting ? (
          <div className="relay-pairing-card">
            <div>
              <p className="eyebrow">Secure device pairing</p>
              <strong>
                {connection.pairing?.status === 'waiting'
                  ? 'Enter this code on iPhone'
                  : 'Generate a single-use code'}
              </strong>
              <small>The code expires after ten minutes. The relay session expires after two hours.</small>
            </div>
            {connection.pairing?.code ? (
              <output className="pairing-code" aria-label={`Pairing code ${connection.pairing.code}`}>
                {connection.pairing.code}
              </output>
            ) : (
              <button className="primary-button" onClick={() => void connection.pair()} type="button">
                Generate pairing code
              </button>
            )}
          </div>
        ) : (
          <button className="primary-button" onClick={() => void mission.send()} type="button">
            Send to iPhone and Watch
          </button>
        )}
        {connection.errorMessage ? <p className="relay-error" role="alert">{connection.errorMessage}</p> : null}
        <p className="privacy-note">
          {connection.mode === 'demo'
            ? 'DemoTransport runs offline. It carries the activity and status only, never photo bytes, health data, or memory evidence.'
            : 'Relay mode authenticates both surfaces separately. Apple Watch receives no backend token, photo bytes, health data, journal content, or memory evidence.'}
        </p>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel className="invitation-card mission-card">
      <div className="mission-heading">
        <div>
          <p className="eyebrow">{delivery.simulated ? 'Simulated' : 'Live'} ecosystem handoff</p>
          <h2>{invitation.title}</h2>
        </div>
        <span className="demo-badge">{delivery.simulated ? 'Demo status' : 'Relay status'}</span>
      </div>
      <DeliveryTimeline simulated={delivery.simulated} status={delivery.status} />
      {delivery.status === 'acknowledged' && delivery.simulated ? (
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
          {delivery.simulated ? (
            <button className="primary-button" onClick={mission.addPhoto} type="button">
              Add next demo photo
            </button>
          ) : (
            <p>Continue on Apple Watch. This dashboard updates only after the iPhone confirms each count.</p>
          )}
          <p className="privacy-note">Only the count changes in relay state. The images shown here are bundled privacy-safe demo assets.</p>
        </div>
      ) : null}
      {connection.errorMessage ? <p className="relay-error" role="alert">{connection.errorMessage}</p> : null}
      <DemoQaControls />
    </GlassPanel>
  )
}
