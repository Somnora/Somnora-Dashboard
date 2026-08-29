import { useWorkbench } from '../../state/workbenchContext'

export function DemoBadge() {
  const { connection } = useWorkbench()
  if (connection.mode === 'relay') {
    const paired = connection.pairing?.status === 'paired'
    return (
      <span
        className="demo-badge"
        title={paired
          ? 'Conversations and About Me use the paired Somnora account.'
          : 'Connect an iPhone to load live Somnora account data.'}
      >
        {paired ? 'Live account' : 'Live mode'}
      </span>
    )
  }
  return (
    <span className="demo-badge" title="No real Somnora account data is loaded">
      Seeded demo
    </span>
  )
}
