import type {
  NoraActionDispatch,
  NoraActionSnapshot,
  NoraActionType,
} from './types'
import {
  createActionConsentReceipt,
  noraActionDefinitions,
  prepareNoraAction,
  routeLabel,
  validateActionSnapshot,
} from './actionRuntime'

const createdAt = '2026-08-28T18:00:00.000Z'
const expiresAt = '2026-08-28T19:30:00.000Z'

function consent(actionType: NoraActionType, approved = true) {
  return createActionConsentReceipt({
    id: `consent-${actionType}`,
    actionType,
    invitationId: `invitation-${actionType}`,
    approved,
    approvedAt: createdAt,
  })
}

function heroDispatch(): NoraActionDispatch {
  return prepareNoraAction({
    actionType: 'three-beautiful-things',
    invitationId: 'invitation-three-beautiful-things',
    title: 'Three Beautiful Things',
    prompt: 'Capture three things that catch your eye.',
    actionInput: {
      type: 'three-beautiful-things',
      targetCount: 3,
      captureMode: 'photo-or-text',
      setting: 'outdoor-or-indoor',
    },
    route: 'watch-via-iphone',
    consent: consent('three-beautiful-things'),
    idempotencyKey: 'runtime-idempotency-key',
    createdAt,
    expiresAt,
  })
}

function snapshot(
  dispatch: NoraActionDispatch,
  status: NoraActionSnapshot['status'],
  completed = 0,
  updatedAt = createdAt,
): NoraActionSnapshot {
  return {
    id: 'runtime-action-1',
    invitationId: dispatch.invitationId,
    actionType: dispatch.actionType,
    status,
    progress: { ...dispatch.progress, completed },
    route: dispatch.route,
    simulated: true,
    expiresAt: dispatch.expiresAt,
    updatedAt,
  }
}

describe('Nora action runtime', () => {
  it('registers typed action families without exposing unfinished UI controls', () => {
    expect(Object.keys(noraActionDefinitions).sort()).toEqual([
      'breathing-reset',
      'six-line-story',
      'three-beautiful-things',
      'tiny-detour',
    ])
    expect(noraActionDefinitions['six-line-story'].allowedRoutes).toEqual(['workbench-only'])
    expect(routeLabel('watch-via-iphone')).toBe('Workbench to iPhone to Watch')
  })

  it('requires explicit, action-scoped consent before preparation', () => {
    expect(() => consent('three-beautiful-things', false)).toThrow('Explicit approval')

    const wrongConsent = consent('breathing-reset')
    expect(() => prepareNoraAction({
      ...heroDispatch(),
      actionType: 'three-beautiful-things',
      actionInput: heroDispatch().input,
      consent: wrongConsent,
    })).toThrow('Consent receipt does not authorize')
  })

  it('validates typed input, routes, text bounds, and expiry', () => {
    const dispatch = heroDispatch()
    expect(dispatch.progress).toEqual({ kind: 'count', target: 3, unit: 'discoveries' })
    expect(dispatch.route).toBe('watch-via-iphone')

    expect(() => prepareNoraAction({
      ...dispatch,
      actionType: 'three-beautiful-things',
      actionInput: dispatch.input,
      route: 'workbench-only',
    })).toThrow('cannot use the requested route')
    expect(() => prepareNoraAction({
      ...dispatch,
      actionType: 'three-beautiful-things',
      actionInput: dispatch.input,
      expiresAt: '2026-08-28T21:00:01.000Z',
    })).toThrow('two hour runtime boundary')
  })

  it('supports a private Workbench action through the same runtime', () => {
    const story = prepareNoraAction({
      actionType: 'six-line-story',
      invitationId: 'invitation-six-line-story',
      title: 'Six Line Story',
      prompt: 'Write a story in exactly six lines.',
      actionInput: {
        type: 'six-line-story',
        lineCount: 6,
        promptStyle: 'constraint',
      },
      route: 'workbench-only',
      consent: consent('six-line-story'),
      idempotencyKey: 'story-idempotency-key',
      createdAt,
      expiresAt,
    })
    expect(story.progress).toEqual({ kind: 'count', target: 6, unit: 'lines' })
  })

  it('keeps route-specific capabilities inside their permission boundary', () => {
    expect(() => prepareNoraAction({
      actionType: 'breathing-reset',
      invitationId: 'invitation-breathing-reset',
      title: 'Breathing Reset',
      prompt: 'Follow a one minute breathing guide.',
      actionInput: {
        type: 'breathing-reset',
        durationSeconds: 60,
        guidanceSurface: 'watch',
      },
      route: 'workbench-only',
      consent: consent('breathing-reset'),
      idempotencyKey: 'breathing-idempotency-key',
      createdAt,
      expiresAt,
    })).toThrow('guidance surface')

    expect(() => prepareNoraAction({
      actionType: 'tiny-detour',
      invitationId: 'invitation-tiny-detour',
      title: 'Tiny Detour',
      prompt: 'Take a short optional change of route.',
      actionInput: {
        type: 'tiny-detour',
        maximumMinutes: 10,
        locationMode: 'nearby-with-permission',
      },
      route: 'iphone',
      consent: consent('tiny-detour'),
      idempotencyKey: 'detour-idempotency-key',
      createdAt,
      expiresAt,
    })).toThrow('connector permission contract')
  })

  it('enforces monotonic lifecycle and produces a privacy-safe outcome', () => {
    const dispatch = heroDispatch()
    const pending = validateActionSnapshot(dispatch, snapshot(dispatch, 'pending'))
    const watch = validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'delivered-watch'),
      pending,
    )
    expect(() => validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'delivered-phone'),
      watch,
    )).toThrow('Invalid action transition')
    const acknowledged = validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'acknowledged'),
      watch,
    )
    const completed = validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'completed', 3, '2026-08-28T18:20:00.000Z'),
      acknowledged,
    )

    expect(completed.outcome).toMatchObject({
      kind: 'completed',
      memoryDisposition: 'awaiting-user-choice',
    })
    expect(JSON.stringify(completed.outcome)).not.toContain('prompt')
  })

  it('allows polling to skip confirmed states but enforces the prepared route', () => {
    const dispatch = heroDispatch()
    const pending = validateActionSnapshot(dispatch, snapshot(dispatch, 'pending'))
    const acknowledged = validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'acknowledged', 0, '2026-08-28T18:05:00.000Z'),
      pending,
    )
    expect(acknowledged.status).toBe('acknowledged')

    const story = prepareNoraAction({
      actionType: 'six-line-story',
      invitationId: 'invitation-six-line-story',
      title: 'Six Line Story',
      prompt: 'Write a story in exactly six lines.',
      actionInput: {
        type: 'six-line-story',
        lineCount: 6,
        promptStyle: 'constraint',
      },
      route: 'workbench-only',
      consent: consent('six-line-story'),
      idempotencyKey: 'story-route-key',
      createdAt,
      expiresAt,
    })
    expect(() => validateActionSnapshot(
      story,
      snapshot(story, 'delivered-phone'),
    )).toThrow('prepared route')
  })

  it('rejects backward timestamps and forged outcome details', () => {
    const dispatch = heroDispatch()
    const pending = validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'pending', 0, '2026-08-28T18:10:00.000Z'),
    )
    expect(() => validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'delivered-phone', 0, '2026-08-28T18:09:00.000Z'),
      pending,
    )).toThrow('time cannot move backward')

    expect(() => validateActionSnapshot(dispatch, {
      ...snapshot(dispatch, 'completed', 3, '2026-08-28T18:20:00.000Z'),
      outcome: {
        kind: 'completed',
        recordedAt: '2026-08-28T18:20:00.000Z',
        summary: 'The private prompt said something important.',
        memoryDisposition: 'awaiting-user-choice',
      },
    })).toThrow('privacy-safe contract')
  })

  it('rejects progress after expiry and incomplete completion', () => {
    const dispatch = heroDispatch()
    expect(() => validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'completed', 2),
    )).toThrow('prepared progress target')
    expect(() => validateActionSnapshot(
      dispatch,
      snapshot(dispatch, 'in-progress', 1, '2026-08-28T19:31:00.000Z'),
    )).toThrow('expired action')
  })
})
