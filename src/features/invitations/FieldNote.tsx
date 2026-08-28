import { useState } from 'react'
import { useWorkbench } from '../../state/workbenchContext'

export function FieldNote() {
  const { profile, mission } = useWorkbench()
  const [reflectionOpen, setReflectionOpen] = useState(false)
  const [reflection, setReflection] = useState('')
  const [kept, setKept] = useState(false)

  return (
    <div className="field-note">
      <div className="field-note-heading">
        <div>
          <p className="eyebrow">Private Field Note</p>
          <h2>Three things interrupted the ordinary.</h2>
          <p>
            The images are bundled demo assets. In the live design, photo bytes stay on iPhone and only completion returns to the Workbench.
          </p>
        </div>
        <span className="completion-seal">3 of 3</span>
      </div>
      <div className="field-note-collage" aria-label="Three privacy-safe demo photographs">
        {profile.fieldNoteImages.map((image, index) => (
          <figure key={image}>
            <img alt={`Privacy-safe demo field note ${index + 1}`} src={image} />
            <figcaption>Beautiful thing {index + 1}</figcaption>
          </figure>
        ))}
      </div>
      {reflectionOpen ? (
        <div className="field-reflection">
          <label htmlFor="field-reflection">Optional Eureka reflection</label>
          <textarea
            id="field-reflection"
            maxLength={400}
            onChange={(event) => {
              setReflection(event.target.value)
              setKept(false)
            }}
            placeholder="What did you notice before you tried to explain it?"
            rows={3}
            value={reflection}
          />
          <div>
            <button
              className="primary-button"
              disabled={!reflection.trim()}
              onClick={() => setKept(true)}
              type="button"
            >
              Keep with this demo note
            </button>
            <button
              className="text-button"
              onClick={() => {
                setReflection('')
                setReflectionOpen(false)
                setKept(false)
              }}
              type="button"
            >
              Skip reflection
            </button>
          </div>
          {kept ? (
            <p className="session-overlay" role="status">
              Kept in component memory for this open Field Note only.
            </p>
          ) : null}
        </div>
      ) : (
        <button
          className="secondary-button"
          onClick={() => setReflectionOpen(true)}
          type="button"
        >
          Add optional Eureka reflection
        </button>
      )}
      <button className="text-button muted-action" onClick={mission.reset} type="button">
        Reset the demo loop
      </button>
    </div>
  )
}
