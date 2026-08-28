import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { MemoryCorrection, MemoryNode as MemoryNodeModel } from '../../domain/types'

export interface MemoryNodeData extends Record<string, unknown> {
  memory: MemoryNodeModel
  focused: boolean
  dimmed: boolean
  correction?: MemoryCorrection
  onSelect: (nodeId: string) => void
}

export type MemoryFlowNode = Node<MemoryNodeData, 'memory'>

const categoryLabels = {
  'user-fact': 'You said',
  'nora-observation': 'Nora noticed',
  'tentative-interpretation': 'Still tentative',
  'growth-marker': 'Growth marker',
} as const

export function MemoryNode({ data, selected }: NodeProps<MemoryFlowNode>) {
  const status = data.correction?.kind ?? data.memory.confidence

  return (
    <div className="memory-node-frame">
      <Handle
        className="memory-node-handle"
        isConnectable={false}
        position={Position.Left}
        type="target"
      />
      <button
        aria-label={`${data.memory.label}. ${categoryLabels[data.memory.category]}. ${status}.`}
        className={`memory-node memory-${data.memory.category}${data.focused ? ' is-focused' : ''}${data.dimmed ? ' is-dimmed' : ''}${selected ? ' is-selected' : ''}`}
        data-focused={data.focused}
        onClick={() => data.onSelect(data.memory.id)}
        type="button"
      >
        <span>{categoryLabels[data.memory.category]}</span>
        <strong>{data.memory.label}</strong>
        <small>{status.replaceAll('-', ' ')}</small>
      </button>
      <Handle
        className="memory-node-handle"
        isConnectable={false}
        position={Position.Right}
        type="source"
      />
    </div>
  )
}
