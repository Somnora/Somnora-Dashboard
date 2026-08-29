import {
  createActionConsentReceipt,
  prepareNoraAction,
} from '../domain/actionRuntime'
import type { NoraActionDispatch, NoraActionSnapshot } from '../domain/types'
import { DemoTransport } from './DemoTransport'

function heroDispatch(idempotencyKey = 'fixed-key'): NoraActionDispatch {
  const createdAt = '2099-08-28T18:00:00.000Z'
  return prepareNoraAction({
    actionType: 'three-beautiful-things',
    invitationId: 'three-beautiful-things-v1',
    title: 'Three Beautiful Things',
    prompt: 'Photograph three things.',
    actionInput: {
      type: 'three-beautiful-things',
      targetCount: 3,
      captureMode: 'photo-or-text',
      setting: 'outdoor-or-indoor',
    },
    route: 'watch-via-iphone',
    consent: createActionConsentReceipt({
      id: 'consent-receipt-1',
      actionType: 'three-beautiful-things',
      invitationId: 'three-beautiful-things-v1',
      approved: true,
      approvedAt: createdAt,
    }),
    idempotencyKey,
    createdAt,
    expiresAt: '2099-08-28T19:30:00.000Z',
  })
}

describe('DemoTransport', () => {
  it('moves through confirmed device states without skipping', async () => {
    const transport = new DemoTransport()
    const pending = await transport.sendAction(heroDispatch())

    expect(pending.status).toBe('pending')
    expect((await transport.getActionStatus(pending.id)).status).toBe('delivered-phone')
    expect((await transport.getActionStatus(pending.id)).status).toBe('delivered-watch')
    expect((await transport.getActionStatus(pending.id)).status).toBe('acknowledged')
  })

  it('coalesces duplicate dispatch and completion', async () => {
    const transport = new DemoTransport()
    const dispatch = heroDispatch()
    const first = await transport.sendAction(dispatch)
    const duplicate = await transport.sendAction(dispatch)

    expect(duplicate.id).toBe(first.id)
    await transport.getActionStatus(first.id)
    await transport.getActionStatus(first.id)
    await transport.getActionStatus(first.id)
    transport.recordProgress(first.id, 3)
    const repeated = transport.recordProgress(first.id, 3)
    expect(repeated.status).toBe('completed')
    expect(repeated.progress.completed).toBe(3)
    expect(repeated.outcome?.memoryDisposition).toBe('awaiting-user-choice')
  })

  it('supports honest failure, retry, cancel, expiry, and refresh restoration', async () => {
    const transport = new DemoTransport()
    const dispatch = heroDispatch()
    const action = await transport.sendAction(dispatch)

    expect(transport.failAction(action.id).status).toBe('failed')
    expect(transport.retryAction(action.id).status).toBe('pending')
    expect((await transport.cancelAction(action.id)).status).toBe('cancelled')

    const restoredDispatch = heroDispatch('restored-key')
    const restored: NoraActionSnapshot = {
      id: 'restored-id',
      invitationId: restoredDispatch.invitationId,
      actionType: restoredDispatch.actionType,
      status: 'delivered-phone',
      progress: { ...restoredDispatch.progress, completed: 0 },
      route: restoredDispatch.route,
      simulated: true,
      expiresAt: restoredDispatch.expiresAt,
      updatedAt: restoredDispatch.createdAt,
    }
    transport.restoreAction(restoredDispatch, restored)
    expect((await transport.getActionStatus('restored-id')).status).toBe('delivered-watch')
    expect(transport.expireAction('restored-id').status).toBe('expired')
  })
})
