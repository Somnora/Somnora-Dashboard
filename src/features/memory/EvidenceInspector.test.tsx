import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { demoProfile } from '../../demo/profile'
import { initialWorkbenchState } from '../../state/initialState'
import { WorkbenchContext } from '../../state/workbenchContext'
import { EvidenceInspector } from './EvidenceInspector'

const mission = {
  send: vi.fn(),
  retry: vi.fn(),
  cancel: vi.fn(),
  start: vi.fn(),
  addPhoto: vi.fn(),
  simulateFailure: vi.fn(),
  simulateExpiry: vi.fn(),
  reset: vi.fn(),
}

const connection = {
  mode: 'demo' as const,
  pairing: null,
  errorMessage: null,
  pair: vi.fn(),
}

const live = {
  threads: [],
  activeThread: null,
  contextGraph: null,
  timelineEvents: [],
  timelineTruncated: false,
  loading: false,
  sending: false,
  errorMessage: null,
  refresh: vi.fn(),
  openThread: vi.fn(),
  startThread: vi.fn(),
  sendMessage: vi.fn(),
  correctMemory: vi.fn(),
}

describe('EvidenceInspector', () => {
  it('shows source type, date, evidence, and correction controls', async () => {
    const user = userEvent.setup()
    const dispatch = vi.fn()
    render(
      <WorkbenchContext.Provider
        value={{
          state: {
            ...initialWorkbenchState,
            selectedMemoryNodeId: 'pattern-movement-ideas',
          },
          dispatch,
          profile: demoProfile,
          connection,
          live,
          mission,
        }}
      >
        <EvidenceInspector />
      </WorkbenchContext.Provider>,
    )

    expect(screen.getByRole('heading', { name: 'Movement loosens ideas' })).toBeInTheDocument()
    expect(screen.getAllByText('activity check in')).toHaveLength(1)
    expect(screen.getByText(/long way home/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Not quite' }))
    await user.type(
      screen.getByLabelText('What is more accurate?'),
      'Movement sometimes helps, but quiet rooms can help too.',
    )
    await user.click(screen.getByRole('button', { name: 'Apply for this session' }))

    expect(dispatch).toHaveBeenCalledWith({
      type: 'correct-memory',
      correction: {
        nodeId: 'pattern-movement-ideas',
        kind: 'corrected',
        note: 'Movement sometimes helps, but quiet rooms can help too.',
      },
    })
  })

  it('requires confirmation before forgetting a memory', async () => {
    const user = userEvent.setup()
    const dispatch = vi.fn()
    render(
      <WorkbenchContext.Provider
        value={{
          state: {
            ...initialWorkbenchState,
            selectedMemoryNodeId: 'signal-visual-flatness',
          },
          dispatch,
          profile: demoProfile,
          connection,
          live,
          mission,
        }}
      >
        <EvidenceInspector />
      </WorkbenchContext.Provider>,
    )

    await user.click(screen.getByRole('button', { name: 'Forget this' }))
    expect(dispatch).not.toHaveBeenCalled()
    await user.click(
      screen.getByRole('button', { name: 'Forget for this session' }),
    )
    expect(dispatch).toHaveBeenCalledWith({
      type: 'correct-memory',
      correction: { nodeId: 'signal-visual-flatness', kind: 'forgotten' },
    })
  })
})
