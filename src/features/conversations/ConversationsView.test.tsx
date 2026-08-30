import { render, screen, waitFor } from '@testing-library/react'
import { demoProfile } from '../../demo/profile'
import { initialWorkbenchState } from '../../state/initialState'
import { WorkbenchContext } from '../../state/workbenchContext'
import type { WorkbenchContextValue } from '../../state/workbenchContext'
import { ConversationsView } from './ConversationsView'

function contextValue(): WorkbenchContextValue {
  return {
    state: { ...initialWorkbenchState, destination: 'conversations', conversationMode: 'eureka' },
    dispatch: vi.fn(),
    profile: demoProfile,
    connection: {
      mode: 'relay',
      pairing: {
        id: '11111111-1111-4111-8111-111111111111',
        status: 'paired',
        simulated: false,
        expiresAt: '2099-08-30T18:30:00.000Z',
      },
      errorMessage: null,
      pair: vi.fn(async () => undefined),
    },
    live: {
      threads: [],
      activeThread: null,
      contextGraph: null,
      timelineEvents: [],
      timelineTruncated: false,
      loading: true,
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

describe('ConversationsView', () => {
  it('holds the composer while a source thread is still loading', () => {
    const value = contextValue()
    render(
      <WorkbenchContext.Provider value={value}>
        <ConversationsView />
      </WorkbenchContext.Provider>,
    )

    expect(screen.getByPlaceholderText('Talk with Nora...')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('opens a newly synced iPhone conversation as a live handoff', async () => {
    const openThread = vi.fn(async () => undefined)
    const existingThread = {
      threadId: 'existing-thread',
      mode: 'eureka' as const,
      title: 'Existing Eureka',
      createdAt: '2026-08-30T18:00:00.000Z',
      updatedAt: '2026-08-30T18:00:00.000Z',
      sourceDevice: 'iphone' as const,
      archived: false,
      messageCount: 2,
    }
    const value = contextValue()
    value.live.loading = false
    value.live.openThread = openThread
    value.live.threads = [existingThread]

    const view = render(
      <WorkbenchContext.Provider value={value}>
        <ConversationsView />
      </WorkbenchContext.Provider>,
    )

    const incomingThread = {
      ...existingThread,
      threadId: 'incoming-thread',
      title: 'A voice note from the trail',
      createdAt: '2026-08-30T18:05:00.000Z',
      updatedAt: '2026-08-30T18:05:00.000Z',
    }
    const updated = {
      ...value,
      live: {
        ...value.live,
        threads: [incomingThread, existingThread],
      },
    }

    view.rerender(
      <WorkbenchContext.Provider value={updated}>
        <ConversationsView />
      </WorkbenchContext.Provider>,
    )

    await waitFor(() => expect(openThread).toHaveBeenCalledWith('incoming-thread'))
    expect(screen.getByText('Receiving linked conversation')).toBeInTheDocument()
    expect(screen.getAllByText('A voice note from the trail')).toHaveLength(2)
  })
})
