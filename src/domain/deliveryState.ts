import type { DeliveryState, DeliveryStatus } from './types'

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
