import { useMemo, useState } from 'react'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'

const categoryCopy = {
  'user-fact': 'This came from something you directly said or confirmed.',
  'nora-observation': 'Nora noticed this pattern across the available entries.',
  'tentative-interpretation': 'This is a hypothesis, not a fact about you.',
  'growth-marker': 'This reflects a change you sustained over time.',
} as const

export function EvidenceInspector() {
  const { state, profile, dispatch } = useWorkbench()
  const [editing, setEditing] = useState(false)
  const [correction, setCorrection] = useState('')
  const [confirmForget, setConfirmForget] = useState(false)
  const node = profile.memoryNodes.find(
    (item) => item.id === state.selectedMemoryNodeId,
  )
  const evidence = useMemo(
    () =>
      node
        ? profile.evidence.filter((item) => node.evidenceIds.includes(item.id))
        : [],
    [node, profile.evidence],
  )

  if (!node) {
    return (
      <GlassPanel className="evidence-inspector empty-inspector">
        <p className="eyebrow">Evidence inspector</p>
        <h2>Select a memory.</h2>
        <p>
          Open any node to see where it came from, how certain it is, and how to
          correct or forget it for this session.
        </p>
      </GlassPanel>
    )
  }

  const overlay = state.memoryOverlay.corrections[node.id]

  return (
    <GlassPanel className="evidence-inspector">
      <div className="inspector-heading">
        <div>
          <p className="eyebrow">Evidence inspector</p>
          <h2>{node.label}</h2>
        </div>
        <button
          aria-label="Close evidence inspector"
          className="icon-button"
          onClick={() => dispatch({ type: 'select-memory-node', nodeId: null })}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p className="inspector-category">{categoryCopy[node.category]}</p>
      <p className="inspector-detail">{overlay?.note ?? node.detail}</p>
      {overlay ? (
        <p className="session-overlay" role="status">
          Session update: {overlay.kind.replaceAll('-', ' ')}
        </p>
      ) : null}
      <div className="evidence-list">
        {evidence.map((item) => (
          <article key={item.id}>
            <div>
              <span>{item.sourceType.replaceAll('-', ' ')}</span>
              <time dateTime={item.occurredAt}>
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(item.occurredAt))}
              </time>
            </div>
            <blockquote>{item.excerpt}</blockquote>
          </article>
        ))}
      </div>
      {editing ? (
        <div className="correction-form">
          <label htmlFor="memory-correction">What is more accurate?</label>
          <textarea
            autoFocus
            id="memory-correction"
            maxLength={240}
            onChange={(event) => setCorrection(event.target.value)}
            placeholder="Keep the correction short and in your own words."
            rows={3}
            value={correction}
          />
          <div>
            <button
              className="primary-button"
              disabled={!correction.trim()}
              onClick={() => {
                dispatch({
                  type: 'correct-memory',
                  correction: {
                    nodeId: node.id,
                    kind: 'corrected',
                    note: correction.trim(),
                  },
                })
                setEditing(false)
              }}
              type="button"
            >
              Apply for this session
            </button>
            <button
              className="text-button"
              onClick={() => setEditing(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {confirmForget ? (
        <div className="forget-confirmation" role="alert">
          <p>Remove this memory and its connections from the current demo session?</p>
          <button
            className="secondary-button"
            onClick={() => {
              dispatch({
                type: 'correct-memory',
                correction: { nodeId: node.id, kind: 'forgotten' },
              })
              dispatch({ type: 'select-memory-node', nodeId: null })
            }}
            type="button"
          >
            Forget for this session
          </button>
          <button
            className="text-button"
            onClick={() => setConfirmForget(false)}
            type="button"
          >
            Keep it
          </button>
        </div>
      ) : (
        <div className="memory-actions">
          <button
            className="secondary-button"
            onClick={() =>
              dispatch({
                type: 'correct-memory',
                correction: { nodeId: node.id, kind: 'confirmed' },
              })
            }
            type="button"
          >
            That's right
          </button>
          <button
            className="secondary-button"
            onClick={() => setEditing(true)}
            type="button"
          >
            Not quite
          </button>
          <button
            className="text-button muted-action"
            onClick={() => setConfirmForget(true)}
            type="button"
          >
            Forget this
          </button>
        </div>
      )}
    </GlassPanel>
  )
}
