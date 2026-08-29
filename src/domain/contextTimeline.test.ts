import { describe, expect, it } from 'vitest'
import { demoProfile } from '../demo/profile'
import { initialWorkbenchState } from '../state/initialState'
import { buildContextTimeline } from './contextTimeline'

describe('buildContextTimeline', () => {
  it('combines profile sources in reverse chronological order', () => {
    const events = buildContextTimeline(demoProfile, initialWorkbenchState)
    const times = events.map((event) => new Date(event.occurredAt).getTime())

    expect(events.some((event) => event.domain === 'dream')).toBe(true)
    expect(events.some((event) => event.domain === 'daily')).toBe(true)
    expect(events.some((event) => event.domain === 'eureka')).toBe(true)
    expect(events.some((event) => event.domain === 'sleep')).toBe(true)
    expect(events.some((event) => event.domain === 'activity')).toBe(true)
    expect(events.some((event) => event.domain === 'nora')).toBe(true)
    expect(times).toEqual([...times].sort((left, right) => right - left))
  })

  it('attaches conversation evidence without duplicating it as a capture', () => {
    const events = buildContextTimeline(demoProfile, initialWorkbenchState)
    const dailyCapture = events.find((event) => event.id === 'conversation-daily-0827-user')

    expect(dailyCapture?.evidenceIds).toEqual(['evidence-current-flatness'])
    expect(events.some((event) => event.id === 'evidence-evidence-current-flatness')).toBe(false)
  })

  it('returns a user-reviewed growth comparison as session-only context', () => {
    const events = buildContextTimeline(demoProfile, {
      ...initialWorkbenchState,
      growthReflections: { 'growth-curiosity-returned': 'needs-nuance' },
    })
    const review = events.find((event) =>
      event.id === 'growth-reflection-growth-curiosity-returned')

    expect(review).toMatchObject({
      kind: 'correction',
      actor: 'user',
      privacy: 'session-only',
      relatedDestination: 'growth',
    })
    expect(review?.summary).toContain('needing more nuance')
  })

  it('keeps Nora interpretations tentative and user choices confirmed', () => {
    const acceptedState = {
      ...initialWorkbenchState,
      invitationDisposition: 'accepted' as const,
    }
    const events = buildContextTimeline(demoProfile, acceptedState)
    const invitation = events.find((event) => event.kind === 'invitation')
    const acceptance = events.find((event) => event.title === 'Invitation accepted')

    expect(invitation?.confidence).toBe('tentative')
    expect(acceptance?.confidence).toBe('confirmed')
    expect(acceptance?.privacy).toBe('session-only')
  })

  it('adds current device progress without turning it into a score', () => {
    const events = buildContextTimeline(demoProfile, {
      ...initialWorkbenchState,
      delivery: {
        status: 'in-progress',
        progressCount: 2,
        progressTarget: 3,
        progressUnit: 'discoveries',
        simulated: true,
        actionId: 'demo-action',
        updatedAt: '2026-08-27T19:08:00.000Z',
      },
    })
    const delivery = events.find((event) => event.id === 'delivery-demo-action')

    expect(delivery?.summary).toContain('2 of 3 discoveries')
    expect(delivery?.sourceLabel).toBe('Simulated device relay')
  })
})
