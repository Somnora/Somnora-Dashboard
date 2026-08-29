import type {
  NoraActionDispatch,
  NoraActionSnapshot,
  PairingSession,
  PairingStatus,
} from '../domain/types'

export interface WorkbenchTransport {
  readonly mode: 'demo' | 'relay'
  pair(): Promise<PairingSession>
  getPairingStatus(pairingId: string): Promise<PairingStatus>
  sendAction(action: NoraActionDispatch): Promise<NoraActionSnapshot>
  getActionStatus(actionId: string): Promise<NoraActionSnapshot>
  cancelAction(actionId: string): Promise<NoraActionSnapshot>
}
