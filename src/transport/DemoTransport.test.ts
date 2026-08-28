import { DemoTransport } from './DemoTransport'

const dispatch = {
  invitationId: 'three-beautiful-things-v1',
  title: 'Three Beautiful Things',
  prompt: 'Photograph three things.',
  estimatedMinutes: 20,
  idempotencyKey: 'fixed-key',
  version: 1 as const,
}

describe('DemoTransport', () => {
  it('moves through confirmed device states without skipping', async () => {
    const transport = new DemoTransport()
    const pending = await transport.sendInvitation(dispatch)

    expect(pending.status).toBe('pending')
    expect((await transport.getActionStatus(pending.id)).status).toBe('delivered-phone')
    expect((await transport.getActionStatus(pending.id)).status).toBe('delivered-watch')
    expect((await transport.getActionStatus(pending.id)).status).toBe('acknowledged')
  })

  it('coalesces duplicate dispatch and completion', async () => {
    const transport = new DemoTransport()
    const first = await transport.sendInvitation(dispatch)
    const duplicate = await transport.sendInvitation(dispatch)

    expect(duplicate.id).toBe(first.id)
    transport.recordProgress(first.id, 3)
    const repeated = transport.recordProgress(first.id, 3)
    expect(repeated.status).toBe('completed')
    expect(repeated.progressCount).toBe(3)
  })

  it('supports honest failure, retry, cancel, expiry, and refresh restoration', async () => {
    const transport = new DemoTransport()
    const action = await transport.sendInvitation(dispatch)

    expect(transport.failAction(action.id).status).toBe('failed')
    expect(transport.retryAction(action.id).status).toBe('pending')
    expect((await transport.cancelAction(action.id)).status).toBe('cancelled')

    transport.restoreAction('restored-id', dispatch.invitationId, 'delivered-phone', 0)
    expect((await transport.getActionStatus('restored-id')).status).toBe('delivered-watch')
    expect(transport.expireAction('restored-id').status).toBe('expired')
  })
})
