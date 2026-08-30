import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type {
  ConversationMode,
  DemoProfile,
  LiveContextGraph,
  LiveConversationThread,
  MemoryCorrection,
  PairingSession,
  WorkbenchState,
} from '../domain/types'
import type { WorkbenchAction } from './reducer'

export interface WorkbenchContextValue {
  state: WorkbenchState
  dispatch: Dispatch<WorkbenchAction>
  profile: DemoProfile
  connection: {
    mode: 'demo' | 'relay'
    pairing: PairingSession | null
    errorMessage: string | null
    pair: () => Promise<void>
  }
  live: {
    threads: LiveConversationThread[]
    activeThread: LiveConversationThread | null
    contextGraph: LiveContextGraph | null
    loading: boolean
    sending: boolean
    errorMessage: string | null
    refresh: () => Promise<void>
    openThread: (threadId: string) => Promise<void>
    startThread: (mode: ConversationMode) => void
    sendMessage: (message: string, mode: ConversationMode) => Promise<boolean>
    correctMemory: (correction: MemoryCorrection) => Promise<void>
  }
  mission: {
    send: () => Promise<void>
    retry: () => Promise<void>
    cancel: () => Promise<void>
    start: () => void
    addPhoto: () => void
    simulateFailure: () => void
    simulateExpiry: () => void
    reset: () => void
  }
}

export const WorkbenchContext = createContext<WorkbenchContextValue | null>(null)

export function useWorkbench(): WorkbenchContextValue {
  const context = useContext(WorkbenchContext)
  if (!context) {
    throw new Error('useWorkbench must be used within WorkbenchProvider')
  }
  return context
}
