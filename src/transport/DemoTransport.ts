import { validateActionSnapshot } from '../domain/actionRuntime'
import type {
  NoraActionDispatch,
  NoraActionSnapshot,
  NoraActionStatus,
  PairingSession,
  PairingStatus,
} from '../domain/types'
import type { WorkbenchTransport } from './WorkbenchTransport'

const deliverySequence: NoraActionStatus[] = [
  'pending',
  'delivered-phone',
  'delivered-watch',
  'acknowledged',
]

function cloneSnapshot(snapshot: NoraActionSnapshot): NoraActionSnapshot {
  return {
    ...snapshot,
    progress: { ...snapshot.progress },
    outcome: snapshot.outcome ? { ...snapshot.outcome } : undefined,
  }
}

function nextTimestamp(snapshot: NoraActionSnapshot): string {
  return new Date(Math.max(Date.now(), Date.parse(snapshot.updatedAt) + 1)).toISOString()
}

export class DemoTransport implements WorkbenchTransport {
  readonly mode = 'demo' as const
  private readonly actions = new Map<string, NoraActionSnapshot>()
  private readonly dispatches = new Map<string, NoraActionDispatch>()
  private readonly idempotencyIndex = new Map<string, string>()

  async pair(): Promise<PairingSession> {
    return {
      id: 'demo-pairing-local',
      status: 'paired',
      simulated: true,
      expiresAt: '2099-08-28T00:00:00.000Z',
    }
  }

  async getPairingStatus(pairingId: string): Promise<PairingStatus> {
    return {
      id: pairingId,
      status: pairingId === 'demo-pairing-local' ? 'paired' : 'expired',
      simulated: true,
    }
  }

  async sendAction(dispatch: NoraActionDispatch): Promise<NoraActionSnapshot> {
    const existingId = this.idempotencyIndex.get(dispatch.idempotencyKey)
    if (existingId) {
      const existing = this.actions.get(existingId)
      if (existing) return cloneSnapshot(existing)
    }

    const snapshot = validateActionSnapshot(dispatch, {
      id: `demo-action-${dispatch.idempotencyKey}`,
      invitationId: dispatch.invitationId,
      actionType: dispatch.actionType,
      status: 'pending',
      progress: { ...dispatch.progress, completed: 0 },
      route: dispatch.route,
      simulated: true,
      expiresAt: dispatch.expiresAt,
      updatedAt: dispatch.createdAt,
    })
    this.actions.set(snapshot.id, snapshot)
    this.dispatches.set(snapshot.id, dispatch)
    this.idempotencyIndex.set(dispatch.idempotencyKey, snapshot.id)
    return cloneSnapshot(snapshot)
  }

  async getActionStatus(actionId: string): Promise<NoraActionSnapshot> {
    const current = this.requireAction(actionId)
    const index = deliverySequence.indexOf(current.status)
    if (index >= 0 && index < deliverySequence.length - 1) {
      return this.replaceSnapshot(current, {
        ...current,
        status: deliverySequence[index + 1],
        updatedAt: nextTimestamp(current),
      })
    }
    return cloneSnapshot(current)
  }

  async cancelAction(actionId: string): Promise<NoraActionSnapshot> {
    const current = this.requireAction(actionId)
    if (['completed', 'expired'].includes(current.status)) return cloneSnapshot(current)
    return this.replaceSnapshot(current, {
      ...current,
      status: 'cancelled',
      updatedAt: nextTimestamp(current),
    })
  }

  restoreAction(dispatch: NoraActionDispatch, snapshot: NoraActionSnapshot): void {
    if (this.actions.has(snapshot.id)) return
    const restored = validateActionSnapshot(dispatch, snapshot)
    this.actions.set(restored.id, restored)
    this.dispatches.set(restored.id, dispatch)
    this.idempotencyIndex.set(dispatch.idempotencyKey, restored.id)
  }

  retryAction(actionId: string): NoraActionSnapshot {
    const current = this.requireAction(actionId)
    return this.replaceSnapshot(current, {
      ...current,
      status: 'pending',
      progress: { ...current.progress, completed: 0 },
      outcome: undefined,
      updatedAt: nextTimestamp(current),
    })
  }

  failAction(actionId: string): NoraActionSnapshot {
    const current = this.requireAction(actionId)
    return this.replaceSnapshot(current, {
      ...current,
      status: 'failed',
      updatedAt: nextTimestamp(current),
    })
  }

  expireAction(actionId: string): NoraActionSnapshot {
    const current = this.requireAction(actionId)
    return this.replaceSnapshot(current, {
      ...current,
      status: 'expired',
      updatedAt: current.expiresAt,
    })
  }

  recordProgress(actionId: string, count: number): NoraActionSnapshot {
    const current = this.requireAction(actionId)
    const completed = Math.min(
      current.progress.target,
      Math.max(current.progress.completed, count),
    )
    return this.replaceSnapshot(current, {
      ...current,
      progress: { ...current.progress, completed },
      status: completed === current.progress.target ? 'completed' : 'in-progress',
      updatedAt: nextTimestamp(current),
    })
  }

  private replaceSnapshot(
    previous: NoraActionSnapshot,
    candidate: NoraActionSnapshot,
  ): NoraActionSnapshot {
    const dispatch = this.dispatches.get(previous.id)
    if (!dispatch) throw new Error(`Missing demo action contract: ${previous.id}`)
    const next = validateActionSnapshot(dispatch, candidate, previous)
    this.actions.set(next.id, next)
    return cloneSnapshot(next)
  }

  private requireAction(actionId: string): NoraActionSnapshot {
    const action = this.actions.get(actionId)
    if (!action) throw new Error(`Unknown demo action: ${actionId}`)
    return action
  }
}
