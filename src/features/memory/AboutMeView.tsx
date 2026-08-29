import { remainingEvidenceIds } from '../../domain/memoryOverlay'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { EvidenceInspector } from './EvidenceInspector'
import { MemoryGraph } from './MemoryGraph'

export function AboutMeView() {
  const { state, profile, dispatch, connection, live } = useWorkbench()
  const memoryNodes = connection.mode === 'relay' && live.contextGraph
    ? live.contextGraph.nodes
    : profile.memoryNodes
  const activeEvidence = remainingEvidenceIds(
    state.focusEvidenceIds,
    memoryNodes,
    state.memoryOverlay,
  )

  return (
    <div className="about-me-layout">
      <section className="graph-workspace" aria-label="About Me graph workspace">
        <div className="graph-intro">
          <div>
            <p className="eyebrow">
              {state.whyOpen
                ? 'Focused explanation'
                : connection.mode === 'relay'
                  ? 'Your live account context'
                  : 'Your living context'}
            </p>
            <p>
              {state.whyOpen
                ? `${activeEvidence.length} of ${state.focusEvidenceIds.length} invitation sources remain active.`
                : connection.mode === 'relay'
                  ? 'Explore what you said, what Nora noticed, and correct the account record when needed.'
                  : 'Explore what you said, what Nora noticed, and what remains uncertain.'}
            </p>
          </div>
          {state.whyOpen ? (
            <button
              className="secondary-button"
              onClick={() => dispatch({ type: 'close-why' })}
              type="button"
            >
              Back to invitation
            </button>
          ) : null}
        </div>
        <GlassPanel className="graph-panel">
          {connection.mode === 'relay' && connection.pairing?.status !== 'paired' ? (
            <div className="live-pairing-required">
              <p className="eyebrow">Phone link required</p>
              <h2>Connect your Somnora account.</h2>
              <p>The graph appears after the iPhone claims the six-digit code.</p>
              {connection.pairing?.code ? (
                <>
                  <output className="pairing-code" aria-label={`Pairing code ${connection.pairing.code}`}>
                    {connection.pairing.code}
                  </output>
                  <small>The code expires after ten minutes. The revocable device link lasts 30 days.</small>
                </>
              ) : (
                <button className="primary-button" onClick={() => void connection.pair()} type="button">
                  Generate code
                </button>
              )}
              {connection.errorMessage ? <p className="live-error-copy" role="alert">{connection.errorMessage}</p> : null}
            </div>
          ) : live.loading && !live.contextGraph ? (
            <div className="live-pairing-required" role="status">Loading your context...</div>
          ) : (
            <MemoryGraph />
          )}
        </GlassPanel>
      </section>
      <aside aria-label="Selected memory evidence">
        <EvidenceInspector />
      </aside>
    </div>
  )
}
