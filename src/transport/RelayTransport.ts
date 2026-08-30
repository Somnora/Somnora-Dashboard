import { validateActionSnapshot } from '../domain/actionRuntime'
import type {
  ConversationMode,
  LiveContextGraph,
  LiveConversationMessage,
  LiveConversationThread,
  MemoryCorrection,
  NoraActionDispatch,
  NoraActionSnapshot,
  NoraActionStatus,
  PairingSession,
  PairingStatus,
} from '../domain/types'
import type { WorkbenchTransport } from './WorkbenchTransport'
import { getWorkbenchIDToken } from './firebaseAuth'

const protocolVersion = 1
const maximumResponseBytes = 16 * 1024
const maximumAccountResponseBytes = 1024 * 1024

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
    updatedAt?: string
    expiresAt: string
  }
}

interface ThreadsEnvelope {
  ok: boolean
  threads?: LiveConversationThread[]
}

interface ThreadEnvelope {
  ok: boolean
  thread?: LiveConversationThread
}

interface ChatEnvelope {
  ok: boolean
  thread?: LiveConversationThread
  userMessage?: LiveConversationMessage
  noraMessage?: LiveConversationMessage
}

interface ContextGraphEnvelope {
  ok: boolean
  graph?: LiveContextGraph
}

const statusMap: Record<string, NoraActionStatus> = {
  pending: 'pending',
  delivered_phone: 'delivered-phone',
  delivered_watch: 'delivered-watch',
  acknowledged: 'acknowledged',
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

function requireAction(
  envelope: ActionEnvelope,
  invitationId: string,
  dispatch?: NoraActionDispatch,
): NoraActionSnapshot {
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
    actionType: 'three-beautiful-things',
    status: statusMap[action.status],
    progress: {
      kind: dispatch?.progress.kind ?? 'count',
      target: dispatch?.progress.target ?? 3,
      unit: dispatch?.progress.unit ?? 'discoveries',
      completed: action.progressCount,
    },
    route: dispatch?.route ?? 'watch-via-iphone',
    simulated: false,
    expiresAt: action.expiresAt,
    updatedAt: action.updatedAt ?? new Date().toISOString(),
  }
}

export class RelayTransport implements WorkbenchTransport {
  readonly mode = 'relay' as const
  private pairingId: string | null = null
  private readonly invitationIds = new Map<string, string>()
  private readonly dispatches = new Map<string, NoraActionDispatch>()
  private readonly snapshots = new Map<string, NoraActionSnapshot>()

  constructor(
    private readonly baseURL: string,
    private readonly tokenProvider: TokenProvider = getWorkbenchIDToken,
    private readonly fetcher: Fetcher = globalThis.fetch.bind(globalThis),
    restoredPairingId?: string,
  ) {
    const normalized = baseURL.trim().replace(/\/$/, '')
    if (!/^https?:\/\/[^/]+(?::\d+)?$/i.test(normalized)) {
      throw new Error('Relay mode requires a valid VITE_WORKBENCH_API_ORIGIN.')
    }
    this.baseURL = normalized
    if (restoredPairingId) {
      this.pairingId = requireUUID(restoredPairingId, 'Pairing ID')
    }
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
    return { id, status, simulated: false, expiresAt: pairing.expiresAt }
  }

  async sendAction(dispatch: NoraActionDispatch): Promise<NoraActionSnapshot> {
    if (dispatch.actionType !== 'three-beautiful-things') {
      throw new Error('The live relay does not support this action type yet.')
    }
    const pairingId = this.requirePairing()
    const idempotencyKey = requireUUID(dispatch.idempotencyKey, 'Idempotency key')
    const envelope = await this.request<ActionEnvelope>('/workbench/actions', {
      method: 'POST',
      body: JSON.stringify({
        pairingId,
        idempotencyKey,
        action: {
          protocolVersion,
          type: 'three_beautiful_things',
          title: dispatch.title,
          prompt: dispatch.prompt,
          progressTarget: dispatch.progress.target,
          expiresAt: dispatch.expiresAt,
        },
      }),
    })
    const action = this.acceptSnapshot(
      requireAction(envelope, dispatch.invitationId, dispatch),
      dispatch,
    )
    this.invitationIds.set(action.id, dispatch.invitationId)
    this.dispatches.set(action.id, dispatch)
    return action
  }

  async getActionStatus(actionId: string): Promise<NoraActionSnapshot> {
    const envelope = await this.request<ActionEnvelope>(
      `/workbench/actions/${encodeURIComponent(actionId)}`,
    )
    const dispatch = this.dispatches.get(actionId)
    const action = requireAction(
      envelope,
      this.invitationIds.get(actionId) ?? 'three-beautiful-things-v1',
      dispatch,
    )
    return dispatch ? this.acceptSnapshot(action, dispatch) : action
  }

  async cancelAction(actionId: string): Promise<NoraActionSnapshot> {
    const envelope = await this.request<ActionEnvelope>(
      `/workbench/actions/${encodeURIComponent(actionId)}`,
      { method: 'DELETE' },
    )
    const dispatch = this.dispatches.get(actionId)
    const action = requireAction(
      envelope,
      this.invitationIds.get(actionId) ?? 'three-beautiful-things-v1',
      dispatch,
    )
    return dispatch ? this.acceptSnapshot(action, dispatch) : action
  }

  async listThreads(): Promise<LiveConversationThread[]> {
    const pairingId = this.requirePairing()
    const envelope = await this.request<ThreadsEnvelope>(
      `/workbench/threads?pairingId=${encodeURIComponent(pairingId)}`,
      {},
      maximumAccountResponseBytes,
    )
    if (envelope.ok !== true || !Array.isArray(envelope.threads)) {
      throw new Error('The relay returned an invalid conversation list.')
    }
    return envelope.threads.filter((thread) => ['dream', 'daily', 'eureka'].includes(thread.mode))
  }

  async getThread(threadId: string): Promise<LiveConversationThread> {
    const pairingId = this.requirePairing()
    const id = requireUUID(threadId, 'Thread ID')
    const envelope = await this.request<ThreadEnvelope>(
      `/workbench/threads/${id}/messages?pairingId=${encodeURIComponent(pairingId)}`,
      {},
      maximumAccountResponseBytes,
    )
    if (envelope.ok !== true || !envelope.thread || !Array.isArray(envelope.thread.messages)) {
      throw new Error('The relay returned an invalid conversation.')
    }
    return envelope.thread
  }

  async sendChat(input: {
    threadId: string
    message: string
    mode: ConversationMode
    timezone: string
  }): Promise<ChatEnvelope> {
    const pairingId = this.requirePairing()
    const message = input.message.trim()
    if (!message || message.length > 8_000) {
      throw new Error('Messages must be between 1 and 8,000 characters.')
    }
    const envelope = await this.request<ChatEnvelope>('/workbench/chat', {
      method: 'POST',
      body: JSON.stringify({
        pairingId,
        threadId: requireUUID(input.threadId, 'Thread ID'),
        messageId: crypto.randomUUID(),
        message,
        mode: input.mode,
        timezone: input.timezone,
        protocolVersion,
      }),
    }, maximumAccountResponseBytes)
    if (
      envelope.ok !== true ||
      !envelope.thread ||
      !envelope.userMessage ||
      !envelope.noraMessage
    ) {
      throw new Error('The relay returned an invalid Nora response.')
    }
    return envelope
  }

  async getContextGraph(): Promise<LiveContextGraph> {
    const pairingId = this.requirePairing()
    const envelope = await this.request<ContextGraphEnvelope>(
      `/workbench/context-graph?pairingId=${encodeURIComponent(pairingId)}`,
      {},
      maximumAccountResponseBytes,
    )
    if (envelope.ok !== true || !envelope.graph) {
      throw new Error('The relay returned an invalid context graph.')
    }
    return envelope.graph
  }

  async correctContextGraph(correction: MemoryCorrection): Promise<LiveContextGraph> {
    const pairingId = this.requirePairing()
    const envelope = await this.request<ContextGraphEnvelope>(
      '/workbench/context-graph/corrections',
      {
        method: 'PATCH',
        body: JSON.stringify({ pairingId, ...correction }),
      },
      maximumAccountResponseBytes,
    )
    if (envelope.ok !== true || !envelope.graph) {
      throw new Error('The relay could not apply the memory correction.')
    }
    return envelope.graph
  }

  private acceptSnapshot(
    candidate: NoraActionSnapshot,
    dispatch: NoraActionDispatch,
  ): NoraActionSnapshot {
    const accepted = validateActionSnapshot(
      dispatch,
      candidate,
      this.snapshots.get(candidate.id),
    )
    this.snapshots.set(accepted.id, accepted)
    return accepted
  }

  private requirePairing(): string {
    if (!this.pairingId) throw new Error('Pair the Workbench with iPhone first.')
    return this.pairingId
  }

  private async request<Response>(
    path: string,
    init: RequestInit = {},
    responseLimit = maximumResponseBytes,
  ): Promise<Response> {
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
    if (new TextEncoder().encode(text).length > responseLimit) {
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
