import { useState } from 'react'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { BurnExercise } from './BurnExercise'

export function ActivityShelf() {
  const { dispatch } = useWorkbench()
  const [burnOpen, setBurnOpen] = useState(false)

  return (
    <>
      <GlassPanel className="activity-shelf">
        <p className="eyebrow">Interactive reflection</p>
        <strong>Some thoughts need an action, not another chart.</strong>
        <div>
          <button className="secondary-button" onClick={() => setBurnOpen(true)} type="button">
            Open private burn exercise
          </button>
          <button
            className="text-button"
            onClick={() => dispatch({ type: 'navigate', destination: 'activities' })}
            type="button"
          >
            Open Activity Studio
          </button>
        </div>
      </GlassPanel>
      <BurnExercise onClose={() => setBurnOpen(false)} open={burnOpen} />
    </>
  )
}
