import type {
  MemoryCorrection,
  MemoryEdge,
  MemoryNode,
  MemoryOverlay,
} from './types'

export const emptyMemoryOverlay: MemoryOverlay = { corrections: {} }

export function setMemoryCorrection(
  overlay: MemoryOverlay,
  correction: MemoryCorrection,
): MemoryOverlay {
  return {
    corrections: {
      ...overlay.corrections,
      [correction.nodeId]: correction,
    },
  }
}

export function applyMemoryOverlay(
  nodes: MemoryNode[],
  edges: MemoryEdge[],
  overlay: MemoryOverlay,
): { nodes: MemoryNode[]; edges: MemoryEdge[] } {
  const forgotten = new Set(
    Object.values(overlay.corrections)
      .filter((correction) => correction.kind === 'forgotten')
      .map((correction) => correction.nodeId),
  )

  return {
    nodes: nodes
      .filter((node) => !forgotten.has(node.id))
      .map((node) => {
        const correction = overlay.corrections[node.id]
        if (!correction) return node
        if (correction.kind === 'confirmed') {
          return { ...node, confidence: 'confirmed' as const }
        }
        if (correction.kind === 'corrected') {
          return {
            ...node,
            detail: correction.note ?? node.detail,
            confidence: 'tentative' as const,
          }
        }
        return node
      }),
    edges: edges.filter(
      (edge) => !forgotten.has(edge.source) && !forgotten.has(edge.target),
    ),
  }
}

export function remainingEvidenceIds(
  evidenceIds: string[],
  nodes: MemoryNode[],
  overlay: MemoryOverlay,
): string[] {
  const forgottenEvidence = new Set(
    nodes
      .filter(
        (node) => overlay.corrections[node.id]?.kind === 'forgotten',
      )
      .flatMap((node) => node.evidenceIds),
  )

  return evidenceIds.filter((id) => !forgottenEvidence.has(id))
}
