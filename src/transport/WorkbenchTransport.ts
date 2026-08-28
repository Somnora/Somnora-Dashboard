import type {
  InvitationAction,
  InvitationDispatch,
  PairingSession,
  PairingStatus,
} from '../domain/types'

export interface WorkbenchTransport {
  pair(): Promise<PairingSession>
  getPairingStatus(pairingId: string): Promise<PairingStatus>
  sendInvitation(invitation: InvitationDispatch): Promise<InvitationAction>
  getActionStatus(actionId: string): Promise<InvitationAction>
  cancelAction(actionId: string): Promise<InvitationAction>
}
