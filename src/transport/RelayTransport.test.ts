import {
  createActionConsentReceipt,
  prepareNoraAction,
} from '../domain/actionRuntime'
import { RelayTransport } from './RelayTransport'

const pairingId = '11111111-1111-4111-8111-111111111111'
const actionId = `${pairingId}.${'a'.repeat(32)}`
const createdAt = '2099-08-28T18:30:00.000Z'
const dispatch = prepareNoraAction({
  actionType: 'three-beautiful-things',
  invitationId: 'three-beautiful-things-v1',
  title: 'Three Beautiful Things',
  prompt: 'Photograph three things that catch your eye.',
  actionInput: {
    type: 'three-beautiful-things',
    targetCount: 3,
    captureMode: 'photo-or-text',
    setting: 'outdoor-or-indoor',
  },
  route: 'watch-via-iphone',
  consent: createActionConsentReceipt({
    id: 'consent-receipt-2',
    actionType: 'three-beautiful-things',
    invitationId: 'three-beautiful-things-v1',
    approved: true,
    approvedAt: createdAt,
  }),
  idempotencyKey: '22222222-2222-4222-8222-222222222222',
  createdAt,
  expiresAt: '2099-08-28T20:00:00.000Z',
})

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function actionEnvelope(status: string, progressCount = 0) {
  return {
    ok: true,
    workbenchAction: {
      actionId,
      pairingId,
      action: {
        protocolVersion: 1,
        type: 'three_beautiful_things',
        title: dispatch.title,
        prompt: dispatch.prompt,
        progressTarget: 3,
        expiresAt: '2099-08-28T20:00:00.000Z',
      },
      status,
      progressCount,
      createdAt,
      updatedAt: createdAt,
      expiresAt: '2099-08-28T20:00:00.000Z',
    },
  }
}

describe('RelayTransport', () => {
  it('authenticates pairing and carries only the allowlisted action body', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({
        ok: true,
        pairingId,
        code: '123456',
        expiresAt: '2099-08-28T20:00:00.000Z',
      }, 201))
      .mockResolvedValueOnce(response({
        ok: true,
        pairing: {
          pairingId,
          state: 'active',
          expiresAt: '2099-08-28T20:00:00.000Z',
        },
      }))
      .mockResolvedValueOnce(response(actionEnvelope('pending'), 201))
    const transport = new RelayTransport(
      'https://relay.example.test',
      async () => 'browser-token',
      fetcher,
    )

    const pairing = await transport.pair()
    expect(pairing.code).toBe('123456')
    expect((await transport.getPairingStatus(pairing.id)).status).toBe('paired')
    const action = await transport.sendAction(dispatch)
    expect(action.simulated).toBe(false)

    const [, request] = fetcher.mock.calls[2]
    expect(request?.headers).toMatchObject({ Authorization: 'Bearer browser-token' })
    const body = JSON.parse(String(request?.body)) as Record<string, unknown>
    expect(Object.keys(body).sort()).toEqual(['action', 'idempotencyKey', 'pairingId'])
    expect(JSON.stringify(body)).not.toContain('health')
    expect(JSON.stringify(body)).not.toContain('photo')
    expect(JSON.stringify(body)).not.toContain('memory')
  })

  it('maps live progress and fails closed on unsupported actions', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response(actionEnvelope('in_progress', 2)))
      .mockResolvedValueOnce(response({
        ...actionEnvelope('completed', 3),
        workbenchAction: {
          ...actionEnvelope('completed', 3).workbenchAction,
          action: {
            ...actionEnvelope('completed', 3).workbenchAction.action,
            type: 'unsupported',
          },
        },
      }))
    const transport = new RelayTransport(
      'https://relay.example.test',
      async () => 'browser-token',
      fetcher,
    )

    const progress = await transport.getActionStatus(actionId)
    expect(progress.status).toBe('in-progress')
    expect(progress.progress.completed).toBe(2)
    await expect(transport.getActionStatus(actionId)).rejects.toThrow('unsupported action')
  })

  it('rejects oversized and unauthenticated responses', async () => {
    const oversized = new RelayTransport(
      'https://relay.example.test',
      async () => 'browser-token',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response('a'.repeat(16 * 1024 + 1), { status: 200 }),
      ),
    )
    await expect(oversized.getActionStatus(actionId)).rejects.toThrow('safety limit')

    const unauthenticated = new RelayTransport(
      'https://relay.example.test',
      async () => '',
      vi.fn<typeof fetch>(),
    )
    await expect(unauthenticated.getActionStatus(actionId)).rejects.toThrow('did not return a token')
  })
})
