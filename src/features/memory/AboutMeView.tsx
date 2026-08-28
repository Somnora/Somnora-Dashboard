import { remainingEvidenceIds } from '../../domain/memoryOverlay'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { EvidenceInspector } from './EvidenceInspector'
import { MemoryGraph } from './MemoryGraph'

export function AboutMeView() {
  const { state, profile, dispatch } = useWorkbench()
  const activeEvidence = remainingEvidenceIds(
    state.focusEvidenceIds,
    profile.memoryNodes,
    state.memoryOverlay,
  )

  return (
    <div className="about-me-layout">
      <section className="graph-workspace" aria-label="About Me graph workspace">
        <div className="graph-intro">
          <div>
            <p className="eyebrow">
              {state.whyOpen ? 'Focused explanation' : 'Your living context'}
            </p>
            <p>
              {state.whyOpen
                ? `${activeEvidence.length} of ${state.focusEvidenceIds.length} invitation sources remain active.`
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
          <MemoryGraph />
        </GlassPanel>
      </section>
      <aside aria-label="Selected memory evidence">
        <EvidenceInspector />
      </aside>
    </div>
  )
}
