import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { DemoProfile, PairingSession, WorkbenchState } from '../domain/types'
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
