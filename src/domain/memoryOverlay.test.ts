import { demoProfile } from '../demo/profile'
import {
  applyMemoryOverlay,
  emptyMemoryOverlay,
  remainingEvidenceIds,
  setMemoryCorrection,
} from './memoryOverlay'

describe('memory overlay', () => {
  it('keeps the seeded graph immutable while applying a correction', () => {
    const original = demoProfile.memoryNodes.find(
      (node) => node.id === 'signal-visual-flatness',
    )
    const overlay = setMemoryCorrection(emptyMemoryOverlay, {
      nodeId: 'signal-visual-flatness',
      kind: 'corrected',
      note: 'The room feels familiar, but not creatively flat.',
    })
    const result = applyMemoryOverlay(
      demoProfile.memoryNodes,
      demoProfile.memoryEdges,
      overlay,
    )

    expect(original?.detail).toContain('visually repetitive')
    expect(
      result.nodes.find((node) => node.id === 'signal-visual-flatness')?.detail,
    ).toBe('The room feels familiar, but not creatively flat.')
  })

  it('removes forgotten evidence from the active explanation', () => {
    const overlay = setMemoryCorrection(emptyMemoryOverlay, {
      nodeId: 'pattern-movement-ideas',
      kind: 'forgotten',
    })
    const result = applyMemoryOverlay(
      demoProfile.memoryNodes,
      demoProfile.memoryEdges,
      overlay,
    )
    const evidence = remainingEvidenceIds(
      ['evidence-long-way-home', 'evidence-current-flatness'],
      demoProfile.memoryNodes,
      overlay,
    )

    expect(result.nodes.some((node) => node.id === 'pattern-movement-ideas')).toBe(false)
    expect(result.edges.some((edge) => edge.source === 'pattern-movement-ideas')).toBe(false)
    expect(evidence).toEqual(['evidence-current-flatness'])
  })
})
