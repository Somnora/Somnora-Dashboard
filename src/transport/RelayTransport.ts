import type {
  DeliveryStatus,
  InvitationAction,
  InvitationDispatch,
  PairingSession,
  PairingStatus,
} from '../domain/types'
import type { WorkbenchTransport } from './WorkbenchTransport'
import { getWorkbenchIDToken } from './firebaseAuth'

const protocolVersion = 1
const maximumResponseBytes = 16 * 1024

type TokenProvider = () => Promise<string>
type Fetcher = typeof fetch

interface PairingEnvelope {
  ok: boolean
  pairing?: {
    pairingId: string
    state: 'pending' | 'active' | 'revoked'
    expiresAt: string
  }
  pairingId?: string
  code?: string
  expiresAt?: string
}

interface ActionEnvelope {
  ok: boolean
  workbenchAction?: {
    actionId: string
    pairingId: string
    action: {
      type: 'three_beautiful_things'
      protocolVersion: number
      expiresAt: string
    }
    status: string
    progressCount: number
    expiresAt: string
  }
}

const statusMap: Record<string, DeliveryStatus> = {
  pending: 'pending',
  delivered_phone: 'delivered-phone',
  delivered_watch: 'delivered-watch',
  in_progress: 'in-progress',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'cancelled',
  expired: 'expired',
}

function requireUUID(value: string, name: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`${name} is invalid.`)
  }
  return value
}

function requireAction(envelope: ActionEnvelope, invitationId: string): InvitationAction {
  const action = envelope.workbenchAction
  if (
    envelope.ok !== true ||
    !action ||
    action.action.protocolVersion !== protocolVersion ||
    action.action.type !== 'three_beautiful_things' ||
    !statusMap[action.status] ||
    !Number.isInteger(action.progressCount) ||
    action.progressCount < 0 ||
    action.progressCount > 3
  ) {
    throw new Error('The relay returned an unsupported action.')
  }
  return {
    id: action.actionId,
    invitationId,
    status: statusMap[action.status],
    progressCount: action.progressCount as 0 | 1 | 2 | 3,
    simulated: false,
    expiresAt: action.expiresAt,
  }
}

export class RelayTransport implements WorkbenchTransport {
  readonly mode = 'relay' as const
  private pairingId: string | null = null
  private readonly invitationIds = new Map<string, string>()

  constructor(
    private readonly baseURL: string,
    private readonly tokenProvider: TokenProvider = getWorkbenchIDToken,
    private readonly fetcher: Fetcher = fetch,
  ) {
    const normalized = baseURL.trim().replace(/\/$/, '')
    if (!/^https?:\/\/[^/]+(?::\d+)?$/i.test(normalized)) {
      throw new Error('Relay mode requires a valid VITE_WORKBENCH_API_ORIGIN.')
    }
    this.baseURL = normalized
  }

  async pair(): Promise<PairingSession> {
    const envelope = await this.request<PairingEnvelope>('/workbench/pairing/start', {
      method: 'POST',
      body: JSON.stringify({ client: 'somnora-workbench', protocolVersion }),
    })
    if (
      envelope.ok !== true ||
      typeof envelope.pairingId !== 'string' ||
      typeof envelope.code !== 'string' ||
      !/^\d{6}$/.test(envelope.code) ||
      typeof envelope.expiresAt !== 'string'
    ) {
      throw new Error('The relay returned an invalid pairing code.')
    }
    this.pairingId = requireUUID(envelope.pairingId, 'Pairing ID')
    return {
      id: this.pairingId,
      status: 'waiting',
      simulated: false,
      expiresAt: envelope.expiresAt,
      code: envelope.code,
    }
  }

  async getPairingStatus(pairingId: string): Promise<PairingStatus> {
    const id = requireUUID(pairingId, 'Pairing ID')
    const envelope = await this.request<PairingEnvelope>(`/workbench/pairing/${id}`)
    const pairing = envelope.pairing
    if (envelope.ok !== true || !pairing || pairing.pairingId !== id) {
      throw new Error('The relay returned an invalid pairing state.')
    }
    this.pairingId = id
    const status = pairing.state === 'active'
      ? 'paired'
      : pairing.state === 'revoked'
        ? 'revoked'
        : Date.parse(pairing.expiresAt) <= Date.now()
          ? 'expired'
          : 'waiting'
    return { id, status, simulated: false }
  }

  async sendInvitation(invitation: InvitationDispatch): Promise<InvitationAction> {
    const pairingId = this.requirePairing()
    const idempotencyKey = requireUUID(invitation.idempotencyKey, 'Idempotency key')
    const expiresAt = new Date(Date.now() + 90 * 60 * 1000).toISOString()
    const envelope = await this.request<ActionEnvelope>('/workbench/actions', {
      method: 'POST',
      body: JSON.stringify({
        pairingId,
        idempotencyKey,
        action: {
          protocolVersion,
          type: 'three_beautiful_things',
          title: invitation.title,
          prompt: invitation.prompt,
          progressTarget: 3,
          expiresAt,
        },
      }),
    })
    const action = requireAction(envelope, invitation.invitationId)
    this.invitationIds.set(action.id, invitation.invitationId)
    return action
  }

  async getActionStatus(actionId: string): Promise<InvitationAction> {
    const envelope = await this.request<ActionEnvelope>(
      `/workbench/actions/${encodeURIComponent(actionId)}`,
    )
    return requireAction(
      envelope,
      this.invitationIds.get(actionId) ?? 'three-beautiful-things-v1',
    )
  }

  async cancelAction(actionId: string): Promise<InvitationAction> {
    const envelope = await this.request<ActionEnvelope>(
      `/workbench/actions/${encodeURIComponent(actionId)}`,
      { method: 'DELETE' },
    )
    return requireAction(
      envelope,
      this.invitationIds.get(actionId) ?? 'three-beautiful-things-v1',
    )
  }

  private requirePairing(): string {
    if (!this.pairingId) throw new Error('Pair the Workbench with iPhone first.')
    return this.pairingId
  }

  private async request<Response>(path: string, init: RequestInit = {}): Promise<Response> {
    const token = await this.tokenProvider()
    if (!token.trim()) throw new Error('Firebase authentication did not return a token.')
    const response = await this.fetcher(`${this.baseURL}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
    const text = await response.text()
    if (new TextEncoder().encode(text).length > maximumResponseBytes) {
      throw new Error('The relay response exceeded the safety limit.')
    }
    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      throw new Error('The relay returned an unreadable response.')
    }
    if (!response.ok) {
      const message = typeof body === 'object' && body && 'error' in body
        ? String((body as { error: unknown }).error)
        : `Relay request failed with status ${response.status}.`
      throw new Error(message)
    }
    return body as Response
  }
}
