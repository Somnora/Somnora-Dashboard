import type { StretchLevel } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'

const levels: Array<{ value: StretchLevel; label: string }> = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'open', label: 'Open' },
  { value: 'bold', label: 'Bold' },
]

export function StretchLevelControl() {
  const { state, dispatch } = useWorkbench()

  return (
    <fieldset className="preference-control">
      <legend>Stretch level</legend>
      <p>How far Nora can invite you beyond the familiar.</p>
      <div className="segmented-control">
        {levels.map((level) => (
          <label key={level.value}>
            <input
              checked={state.stretch === level.value}
              name="stretch"
              onChange={() =>
                dispatch({ type: 'set-stretch', value: level.value })
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
