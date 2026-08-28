import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type NodeTypes,
} from '@xyflow/react'
import {
  applyMemoryOverlay,
  remainingEvidenceIds,
} from '../../domain/memoryOverlay'
import { useWorkbench } from '../../state/workbenchContext'
import { MemoryNode, type MemoryFlowNode } from './MemoryNode'

const nodeTypes: NodeTypes = { memory: MemoryNode }

export function MemoryGraph() {
  const { state, profile, dispatch } = useWorkbench()
  const activeGraph = useMemo(
    () =>
      applyMemoryOverlay(
        profile.memoryNodes,
        profile.memoryEdges,
        state.memoryOverlay,
      ),
    [profile.memoryEdges, profile.memoryNodes, state.memoryOverlay],
  )
  const activeFocusEvidence = useMemo(
    () =>
      remainingEvidenceIds(
        state.focusEvidenceIds,
        profile.memoryNodes,
        state.memoryOverlay,
      ),
    [profile.memoryNodes, state.focusEvidenceIds, state.memoryOverlay],
  )
  const hasFocus = activeFocusEvidence.length > 0

  const nodes = useMemo<MemoryFlowNode[]>(
    () =>
      activeGraph.nodes.map((memory) => {
        const focused = memory.evidenceIds.some((id) =>
          activeFocusEvidence.includes(id),
        )
        return {
          id: memory.id,
          type: 'memory',
          position: memory.position,
          data: {
            memory,
            focused,
            dimmed: hasFocus && !focused,
            correction: state.memoryOverlay.corrections[memory.id],
            onSelect: (nodeId: string) =>
              dispatch({ type: 'select-memory-node', nodeId }),
          },
          selected: state.selectedMemoryNodeId === memory.id,
          draggable: false,
        }
      }),
    [
      activeFocusEvidence,
      activeGraph.nodes,
      dispatch,
      hasFocus,
      state.memoryOverlay.corrections,
      state.selectedMemoryNodeId,
    ],
  )

  const edges = useMemo<Edge[]>(
    () =>
      activeGraph.edges.map((edge) => {
        const focused = edge.evidenceIds.some((id) =>
          activeFocusEvidence.includes(id),
        )
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: focused ? edge.label : undefined,
          markerEnd: { type: MarkerType.ArrowClosed, width: 11, height: 11 },
          animated: focused && !state.reducedMotionOverride,
          style: {
            stroke: focused ? 'rgba(244, 182, 158, 0.88)' : 'rgba(255, 255, 255, 0.16)',
            strokeWidth: focused ? 2.2 : 1,
            opacity: hasFocus && !focused ? 0.2 : 1,
          },
          labelStyle: { fill: 'rgba(255, 255, 255, 0.76)', fontSize: 10 },
          labelBgStyle: { fill: 'rgba(13, 21, 32, 0.82)' },
          labelBgPadding: [5, 3] as [number, number],
          labelBgBorderRadius: 6,
        }
      }),
    [activeFocusEvidence, activeGraph.edges, hasFocus, state.reducedMotionOverride],
  )

  return (
    <div className="memory-canvas" aria-label="Interactive About Me memory graph">
      <ReactFlow
        colorMode="dark"
        edges={edges}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.42, maxZoom: 1.05 }}
        maxZoom={1.5}
        minZoom={0.28}
        nodeTypes={nodeTypes}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        zoomOnDoubleClick={false}
      >
        <Background
          color="rgba(255,255,255,0.11)"
          gap={28}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls
          fitViewOptions={{ padding: 0.18 }}
          position="bottom-left"
          showInteractive={false}
        />
      </ReactFlow>
      <div className="memory-legend" aria-label="Memory category legend">
        <span className="legend-user">You said</span>
        <span className="legend-nora">Nora noticed</span>
        <span className="legend-tentative">Tentative</span>
        <span className="legend-growth">Growth</span>
      </div>
    </div>
  )
}
