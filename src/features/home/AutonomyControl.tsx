import type { AutonomyLevel } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'

const levels: Array<{ value: AutonomyLevel; label: string }> = [
  { value: 'quiet', label: 'Quiet' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'active', label: 'Active' },
]

export function AutonomyControl() {
  const { state, dispatch } = useWorkbench()

  return (
    <fieldset className="preference-control">
      <legend>Autonomy</legend>
      <p>How often Nora may surface an idea. Actions still need your approval.</p>
      <div className="segmented-control">
        {levels.map((level) => (
          <label key={level.value}>
            <input
              checked={state.autonomy === level.value}
              name="autonomy"
              onChange={() =>
                dispatch({ type: 'set-autonomy', value: level.value })
              }
              type="radio"
              value={level.value}
            />
            <span>{level.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
