import type { DeliveryState, DeliveryStatus } from './types'

const deliveryOrder: Partial<Record<DeliveryStatus, number>> = {
  idle: 0,
  pending: 1,
  'delivered-phone': 2,
  'delivered-watch': 3,
  acknowledged: 3,
  'in-progress': 4,
  completed: 5,
}

const allowedTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  idle: ['pending'],
  pending: ['delivered-phone', 'failed', 'cancelled', 'expired'],
  'delivered-phone': ['delivered-watch', 'failed', 'cancelled', 'expired'],
  'delivered-watch': ['acknowledged', 'failed', 'cancelled', 'expired'],
  acknowledged: ['in-progress', 'completed', 'cancelled', 'expired'],
  'in-progress': ['in-progress', 'completed', 'failed', 'cancelled', 'expired'],
  completed: ['completed'],
  failed: ['pending', 'cancelled'],
  cancelled: [],
  expired: [],
}

export function canTransitionDelivery(
  from: DeliveryStatus,
  to: DeliveryStatus,
): boolean {
  return allowedTransitions[from].includes(to)
}

export function transitionDelivery(
  state: DeliveryState,
  status: DeliveryStatus,
  updatedAt: string,
): DeliveryState {
  if (!canTransitionDelivery(state.status, status)) {
    throw new Error(`Invalid delivery transition: ${state.status} to ${status}`)
  }

  return {
    ...state,
    status,
    updatedAt,
    errorMessage: status === 'failed' ? state.errorMessage : undefined,
  }
}

export function updateDeliveryProgress(
  state: DeliveryState,
  count: number,
  updatedAt: string,
): DeliveryState {
  if (!['acknowledged', 'in-progress'].includes(state.status)) {
    throw new Error(`Progress is not valid while delivery is ${state.status}`)
  }
  if (!Number.isInteger(count) || count < state.progressCount || count > 3) {
    throw new Error(`Invalid progress count: ${count}`)
  }

  return {
    ...state,
    status: count === 3 ? 'completed' : 'in-progress',
    progressCount: count as 0 | 1 | 2 | 3,
    updatedAt,
  }
}

export function reconcileDeliverySnapshot(
  state: DeliveryState,
  snapshot: Pick<DeliveryState, 'status' | 'progressCount' | 'simulated'>,
  updatedAt: string,
): DeliveryState {
  if (snapshot.progressCount < state.progressCount || snapshot.progressCount > 3) {
    throw new Error(`Invalid progress count: ${snapshot.progressCount}`)
  }
  if (snapshot.status === 'completed' && snapshot.progressCount !== 3) {
    throw new Error('Completion requires three discoveries')
  }
  if (
    ['pending', 'delivered-phone', 'delivered-watch', 'acknowledged'].includes(snapshot.status) &&
    snapshot.progressCount !== 0
  ) {
    throw new Error(`Progress is not valid while delivery is ${snapshot.status}`)
  }

  const terminal = ['failed', 'cancelled', 'expired'].includes(snapshot.status)
  const currentRank = deliveryOrder[state.status]
  const nextRank = deliveryOrder[snapshot.status]
  if (!terminal && (currentRank === undefined || nextRank === undefined || nextRank < currentRank)) {
    throw new Error(`Invalid delivery snapshot: ${state.status} to ${snapshot.status}`)
  }
  if (['completed', 'cancelled', 'expired'].includes(state.status) && snapshot.status !== state.status) {
    throw new Error(`Terminal delivery cannot change from ${state.status}`)
  }

  return {
    ...state,
    status: snapshot.status,
    progressCount: snapshot.progressCount,
    simulated: snapshot.simulated,
    updatedAt,
    errorMessage: snapshot.status === 'failed' ? state.errorMessage : undefined,
  }
}
