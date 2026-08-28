import type {
  DeliveryStatus,
  InvitationAction,
  InvitationDispatch,
  PairingSession,
  PairingStatus,
} from '../domain/types'
import type { WorkbenchTransport } from './WorkbenchTransport'

const deliverySequence: DeliveryStatus[] = [
  'pending',
  'delivered-phone',
  'delivered-watch',
  'acknowledged',
]

function cloneAction(action: InvitationAction): InvitationAction {
  return { ...action }
}

export class DemoTransport implements WorkbenchTransport {
  private readonly actions = new Map<string, InvitationAction>()
  private readonly idempotencyIndex = new Map<string, string>()

  async pair(): Promise<PairingSession> {
    return {
      id: 'demo-pairing-local',
      status: 'paired',
      simulated: true,
      expiresAt: '2026-08-28T00:00:00.000Z',
    }
  }

  async getPairingStatus(pairingId: string): Promise<PairingStatus> {
    return {
      id: pairingId,
      status: pairingId === 'demo-pairing-local' ? 'paired' : 'expired',
      simulated: true,
    }
  }

  async sendInvitation(
    invitation: InvitationDispatch,
  ): Promise<InvitationAction> {
    const existingId = this.idempotencyIndex.get(invitation.idempotencyKey)
    if (existingId) {
      const existing = this.actions.get(existingId)
      if (existing) return cloneAction(existing)
    }

    const action: InvitationAction = {
      id: `demo-action-${invitation.idempotencyKey}`,
      invitationId: invitation.invitationId,
      status: 'pending',
      progressCount: 0,
      simulated: true,
      expiresAt: '2026-08-28T00:00:00.000Z',
    }
    this.actions.set(action.id, action)
    this.idempotencyIndex.set(invitation.idempotencyKey, action.id)
    return cloneAction(action)
  }

  async getActionStatus(actionId: string): Promise<InvitationAction> {
    const action = this.requireAction(actionId)
    const index = deliverySequence.indexOf(action.status)
    if (index >= 0 && index < deliverySequence.length - 1) {
      action.status = deliverySequence[index + 1]
    }
    return cloneAction(action)
  }

  async cancelAction(actionId: string): Promise<InvitationAction> {
    const action = this.requireAction(actionId)
    if (!['completed', 'expired'].includes(action.status)) {
      action.status = 'cancelled'
    }
    return cloneAction(action)
  }

  restoreAction(
    actionId: string,
    invitationId: string,
    status: DeliveryStatus,
    progressCount: 0 | 1 | 2 | 3,
  ): void {
    if (this.actions.has(actionId)) return
    this.actions.set(actionId, {
      id: actionId,
      invitationId,
      status,
      progressCount,
      simulated: true,
      expiresAt: '2026-08-28T00:00:00.000Z',
    })
  }

  retryAction(actionId: string): InvitationAction {
    const action = this.requireAction(actionId)
    action.status = 'pending'
    action.progressCount = 0
    return cloneAction(action)
  }

  failAction(actionId: string): InvitationAction {
    const action = this.requireAction(actionId)
    action.status = 'failed'
    return cloneAction(action)
  }

  expireAction(actionId: string): InvitationAction {
    const action = this.requireAction(actionId)
    action.status = 'expired'
    return cloneAction(action)
  }

  recordProgress(actionId: string, count: number): InvitationAction {
    const action = this.requireAction(actionId)
    const bounded = Math.min(3, Math.max(action.progressCount, count)) as 0 | 1 | 2 | 3
    action.progressCount = bounded
    action.status = bounded === 3 ? 'completed' : 'in-progress'
    return cloneAction(action)
  }

  private requireAction(actionId: string): InvitationAction {
    const action = this.actions.get(actionId)
    if (!action) throw new Error(`Unknown demo action: ${actionId}`)
    return action
  }
}
