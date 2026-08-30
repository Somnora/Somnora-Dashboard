import { useWorkbench } from '../state/workbenchContext'

export function DeviceStatus() {
  const { connection } = useWorkbench()
  const relayStatus = connection.pairing?.status
  const connected = connection.mode === 'demo' || relayStatus === 'paired'
  const detail = connection.mode === 'demo'
    ? 'Demo continuity ready'
    : relayStatus === 'paired'
      ? 'Secure relay paired'
      : relayStatus === 'waiting'
        ? 'Waiting for iPhone'
        : 'Relay not paired'

  return (
    <div className="device-status" aria-label={`Device connection status: ${detail}`}>
      <span
        className={`status-dot${connected ? ' is-connected' : relayStatus === 'waiting' ? ' is-waiting' : ''}`}
        aria-hidden="true"
      />
      <span>
        <strong>iPhone + Watch</strong>
        <small>{detail}</small>
      </span>
    </div>
  )
}
