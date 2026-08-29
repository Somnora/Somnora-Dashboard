import {
  reconcileDeliverySnapshot,
  transitionDelivery,
  updateDeliveryProgress,
} from './deliveryState'
import type { DeliveryState } from './types'

const idle: DeliveryState = {
  status: 'idle',
  progressCount: 0,
  progressTarget: 3,
  progressUnit: 'discoveries',
  simulated: true,
}

describe('delivery state', () => {
  it('allows the verified device sequence and monotonic progress', () => {
    const pending = transitionDelivery(idle, 'pending', '2026-08-27T19:00:00Z')
    const phone = transitionDelivery(
      pending,
      'delivered-phone',
      '2026-08-27T19:00:01Z',
    )
    const watch = transitionDelivery(
      phone,
      'delivered-watch',
      '2026-08-27T19:00:02Z',
    )
    const acknowledged = transitionDelivery(
      watch,
      'acknowledged',
      '2026-08-27T19:00:03Z',
    )
    const progress = updateDeliveryProgress(
      acknowledged,
      1,
      '2026-08-27T19:00:04Z',
    )

    expect(progress.status).toBe('in-progress')
    expect(progress.progressCount).toBe(1)
  })

  it('rejects implied delivery and decreasing progress', () => {
    expect(() =>
      transitionDelivery(idle, 'delivered-watch', '2026-08-27T19:00:00Z'),
    ).toThrow('Invalid delivery transition')

    const active: DeliveryState = {
      status: 'in-progress',
      progressCount: 2,
      progressTarget: 3,
      progressUnit: 'discoveries',
      simulated: true,
    }
    expect(() =>
      updateDeliveryProgress(active, 1, '2026-08-27T19:00:00Z'),
    ).toThrow('Invalid progress count')
  })

  it('accepts a forward live snapshot without inventing intermediate confirmation', () => {
    const pending: DeliveryState = {
      status: 'pending',
      progressCount: 0,
      progressTarget: 3,
      progressUnit: 'discoveries',
      simulated: false,
    }
    const completed = reconcileDeliverySnapshot(
      pending,
      { status: 'completed', progressCount: 3, simulated: false },
      '2026-08-28T19:00:00Z',
    )

    expect(completed.status).toBe('completed')
    expect(completed.progressCount).toBe(3)
    expect(completed.simulated).toBe(false)
  })

  it('rejects backward live snapshots and incomplete completion', () => {
    const active: DeliveryState = {
      status: 'in-progress',
      progressCount: 2,
      progressTarget: 3,
      progressUnit: 'discoveries',
      simulated: false,
    }
    expect(() =>
      reconcileDeliverySnapshot(
        active,
        { status: 'delivered-watch', progressCount: 2, simulated: false },
        '2026-08-28T19:00:00Z',
      ),
    ).toThrow()
    expect(() =>
      reconcileDeliverySnapshot(
        active,
        { status: 'completed', progressCount: 2, simulated: false },
        '2026-08-28T19:00:00Z',
      ),
    ).toThrow('Completion requires the prepared progress target')
  })
})
