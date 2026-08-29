import { useState } from 'react'
import { Modal } from '../common/Modal'

export function SixLineStory({
  open,
  onClose,
  prompt,
  variantLabel,
}: {
  open: boolean
  onClose: () => void
  prompt: string
  variantLabel: string
}) {
  const [lines, setLines] = useState(() => Array.from({ length: 6 }, () => ''))
  const [complete, setComplete] = useState(false)

  const clearAndClose = () => {
    setLines(Array.from({ length: 6 }, () => ''))
    setComplete(false)
    onClose()
  }

  const updateLine = (index: number, value: string) => {
    setLines((current) => current.map((line, lineIndex) =>
      lineIndex === index ? value : line))
  }

  const allLinesReady = lines.every((line) => line.trim().length > 0)

  return (
    <Modal
      description="A six-line creative constraint. The story remains in temporary component memory and is cleared when this exercise closes."
      eyebrow={`Private creation · ${variantLabel}`}
      onClose={clearAndClose}
      open={open}
      title="Six Line Story"
    >
      <div className="six-line-exercise">
        {!complete ? (
          <>
            <p className="six-line-prompt">{prompt}</p>
            <ol>
              {lines.map((line, index) => (
                <li key={index}>
                  <label htmlFor={`story-line-${index}`}>Line {index + 1}</label>
                  <input
                    autoFocus={index === 0}
                    data-modal-initial-focus={index === 0 ? true : undefined}
                    id={`story-line-${index}`}
                    maxLength={160}
                    onChange={(event) => updateLine(index, event.target.value)}
                    placeholder={index === 0 ? 'Begin with one concrete detail.' : 'Keep moving.'}
                    value={line}
                  />
                </li>
              ))}
            </ol>
            <div className="six-line-actions">
              <button
                className="primary-button"
                disabled={!allLinesReady}
                onClick={() => setComplete(true)}
                type="button"
              >
                Complete private story
              </button>
              <button className="text-button" onClick={clearAndClose} type="button">
                Close and clear
              </button>
            </div>
            <p className="privacy-note">
              No line enters local storage, the relay, Nora memory, or analytics.
            </p>
          </>
        ) : (
          <div className="six-line-complete">
            <p className="eyebrow">Constraint complete</p>
            <h3>Six lines exist that did not exist before.</h3>
            <blockquote>
              {lines.map((line, index) => <p key={index}>{line}</p>)}
            </blockquote>
            <p>
              Somnora does not grade the result. Closing clears every line from this exercise.
            </p>
            <button className="primary-button" onClick={clearAndClose} type="button">
              Finish and clear
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
