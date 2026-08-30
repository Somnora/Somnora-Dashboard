import { useWorkbench } from '../../state/workbenchContext'

export function DemoBadge() {
  const { connection, state } = useWorkbench()
  if (connection.mode === 'relay') {
    const paired = connection.pairing?.status === 'paired'
    const destinationUsesLiveAccount = state.destination === 'conversations' || state.destination === 'about-me'
    if (paired && destinationUsesLiveAccount) {
      return (
        <span
          className="demo-badge"
          title="This screen uses the paired Somnora account."
        >
          Live account
        </span>
      )
    }
    return (
      <span
        className="demo-badge"
        title={paired
          ? 'This screen still uses preview data. Conversations and About Me use the paired account.'
          : 'This screen uses preview data until an iPhone is linked.'}
      >
        Preview data
      </span>
    )
  }
  return (
    <span className="demo-badge" title="No real Somnora account data is loaded">
      Seeded demo
    </span>
  )
}
