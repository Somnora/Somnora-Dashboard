import { useEffect, useState } from 'react'
import { Modal } from '../common/Modal'

type BurnStage = 'write' | 'confirm' | 'burning' | 'complete'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function BurnExercise({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<BurnStage>('write')
  const [burnText, setBurnText] = useState('')
  const [reflection, setReflection] = useState('')
  const [reflectionKept, setReflectionKept] = useState(false)
  const reducedMotion = open ? prefersReducedMotion() : false

  useEffect(() => {
    if (stage !== 'burning') return
    const timer = window.setTimeout(
      () => setStage('complete'),
      reducedMotion ? 260 : 1450,
    )
    return () => window.clearTimeout(timer)
  }, [reducedMotion, stage])

  const clearAndClose = () => {
    setStage('write')
    setBurnText('')
    setReflection('')
    setReflectionKept(false)
    onClose()
  }

  const beginBurn = () => {
    setBurnText('')
    setStage('burning')
  }

  return (
    <Modal
      description="A private, temporary writing exercise. Burn text is never stored, added to memory, or sent to a device."
      eyebrow="Private reflection"
      onClose={clearAndClose}
      open={open}
      title="Write it. Let it go."
    >
      <div className={`burn-exercise stage-${stage}${reducedMotion ? ' reduced-burn' : ''}`}>
        {stage === 'write' ? (
          <>
            <div className="paper-sheet">
              <label htmlFor="burn-text">Write what you are ready to release</label>
              <textarea
                autoFocus
                data-modal-initial-focus
                id="burn-text"
                maxLength={700}
                onChange={(event) => setBurnText(event.target.value)}
                placeholder="Three insecurities, one fear, or a sentence you no longer want to carry."
                rows={8}
                value={burnText}
              />
              <small>{burnText.length} of 700 · temporary component memory only</small>
            </div>
            <div className="burn-actions">
              <button
                className="primary-button"
                disabled={!burnText.trim()}
                onClick={() => setStage('confirm')}
                type="button"
              >
                Review before burning
              </button>
              <button className="text-button" onClick={clearAndClose} type="button">
                Close and clear
              </button>
            </div>
          </>
        ) : null}

        {stage === 'confirm' ? (
          <div className="burn-confirmation">
            <div className="paper-preview" aria-label="Private writing ready to be cleared">
              <p>{burnText}</p>
            </div>
            <div>
              <p className="eyebrow">Permanent within this exercise</p>
              <h3>Burning clears the original text immediately.</h3>
              <p>
                It will not be saved as a reflection or added to About Me. If you want to keep an insight, write a separate reflection after the burn.
              </p>
              <button className="primary-button" onClick={beginBurn} type="button">
                Burn and clear the text
              </button>
              <button className="text-button" onClick={() => setStage('write')} type="button">
                Go back
              </button>
            </div>
          </div>
        ) : null}

        {stage === 'burning' ? (
          <div className="burn-animation" aria-live="polite">
            <div className="burn-sheet" aria-hidden="true">
              <span className="burn-edge" />
              <span className="burn-flame flame-one" />
              <span className="burn-flame flame-two" />
              <span className="ash-particle ash-one" />
              <span className="ash-particle ash-two" />
              <span className="ash-particle ash-three" />
            </div>
            <p>{reducedMotion ? 'The page dissolves quietly.' : 'The page is becoming ash.'}</p>
          </div>
        ) : null}

        {stage === 'complete' ? (
          <div className="burn-complete">
            <div className="ash-mark" aria-hidden="true" />
            <p className="eyebrow">Released</p>
            <h3>The original words are gone.</h3>
            <p>
              Nothing from the page was stored. A separate reflection below is optional and stays only while this exercise remains open.
            </p>
            <label htmlFor="after-burn-reflection">Optional separate reflection</label>
            <textarea
              id="after-burn-reflection"
              maxLength={300}
              onChange={(event) => {
                setReflection(event.target.value)
                setReflectionKept(false)
              }}
              placeholder="What do you want to make room for now?"
              rows={3}
              value={reflection}
            />
            <div className="burn-actions">
              <button
                className="secondary-button"
                disabled={!reflection.trim()}
                onClick={() => setReflectionKept(true)}
                type="button"
              >
                Keep in this open exercise
              </button>
              <button className="primary-button" onClick={clearAndClose} type="button">
                Finish and clear
              </button>
            </div>
            {reflectionKept ? (
              <p className="session-overlay" role="status">
                Kept in component memory only. Closing still clears it.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
