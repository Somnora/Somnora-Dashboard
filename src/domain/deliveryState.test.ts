import { transitionDelivery, updateDeliveryProgress } from './deliveryState'
import type { DeliveryState } from './types'

const idle: DeliveryState = {
  status: 'idle',
  progressCount: 0,
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
      simulated: true,
    }
    expect(() =>
      updateDeliveryProgress(active, 1, '2026-08-27T19:00:00Z'),
    ).toThrow('Invalid progress count')
  })
})
