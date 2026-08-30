import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { demoProfile } from '../../demo/profile'
import type { ContextTimelineEvent } from '../../domain/types'
import { initialWorkbenchState } from '../../state/initialState'
import { WorkbenchContext } from '../../state/workbenchContext'
import type { WorkbenchContextValue } from '../../state/workbenchContext'
import { ContextTimelineView } from './ContextTimelineView'

const threadId = '33333333-3333-4333-8333-333333333333'
const liveEvent: ContextTimelineEvent = {
  id: 'conversation-44444444-4444-4444-8444-444444444444',
  occurredAt: '2026-08-30T18:30:00.000Z',
  domain: 'eureka',
  kind: 'capture',
  actor: 'user',
  confidence: 'confirmed',
  title: 'Eureka capture',
  summary: 'I talked this idea out on my run.',
  sourceLabel: 'Eureka conversation from watch',
  evidenceIds: [],
  tags: ['watch', 'voice'],
  privacy: 'private-profile',
  relatedDestination: 'conversations',
  relatedConversationMode: 'eureka',
  relatedThreadId: threadId,
}

function contextValue(paired: boolean): WorkbenchContextValue {
  return {
    state: { ...initialWorkbenchState, destination: 'timeline' },
    dispatch: vi.fn(),
    profile: demoProfile,
    connection: {
      mode: 'relay',
      pairing: paired ? {
        id: '11111111-1111-4111-8111-111111111111',
        status: 'paired',
        simulated: false,
        expiresAt: '2099-08-30T18:30:00.000Z',
      } : null,
      errorMessage: null,
      pair: vi.fn(async () => undefined),
    },
    live: {
      threads: [],
      activeThread: null,
      contextGraph: null,
      timelineEvents: [liveEvent],
      timelineTruncated: false,
      loading: false,
      sending: false,
      errorMessage: null,
      refresh: vi.fn(async () => undefined),
      openThread: vi.fn(async () => undefined),
      startThread: vi.fn(),
      sendMessage: vi.fn(async () => true),
      correctMemory: vi.fn(async () => undefined),
    },
    mission: {
      send: vi.fn(async () => undefined),
      retry: vi.fn(async () => undefined),
      cancel: vi.fn(async () => undefined),
      start: vi.fn(),
      addPhoto: vi.fn(),
      simulateFailure: vi.fn(),
      simulateExpiry: vi.fn(),
      reset: vi.fn(),
    },
  }
}

describe('ContextTimelineView', () => {
  it('renders account events and opens their exact conversation thread', async () => {
    const user = userEvent.setup()
    const value = contextValue(true)
    render(
      <WorkbenchContext.Provider value={value}>
        <ContextTimelineView />
      </WorkbenchContext.Provider>,
    )

    expect(screen.getByText('Live account chronology')).toBeInTheDocument()
    expect(screen.getAllByText(liveEvent.summary)).toHaveLength(2)
    expect(screen.queryByText('Seeded iPhone and Watch context')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open source view' }))
    expect(value.live.openThread).toHaveBeenCalledWith(threadId)
    expect(value.dispatch).toHaveBeenCalledWith({
      type: 'navigate',
      destination: 'conversations',
    })
  })

  it('does not reveal preview history before the iPhone is paired', () => {
    const value = contextValue(false)
    render(
      <WorkbenchContext.Provider value={value}>
        <ContextTimelineView />
      </WorkbenchContext.Provider>,
    )

    expect(screen.getByText('Connect your iPhone to bring your story together.')).toBeInTheDocument()
    expect(screen.queryByText(liveEvent.summary)).not.toBeInTheDocument()
  })
})
