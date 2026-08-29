import type {
  InvitationFamily,
  NoraActionConsentReceipt,
  NoraActionDispatch,
  NoraActionInput,
  NoraActionOutcome,
  NoraActionProgressContract,
  NoraActionRoute,
  NoraActionSnapshot,
  NoraActionStatus,
  NoraActionType,
} from './types'

export interface NoraActionDefinition {
  type: NoraActionType
  family: InvitationFamily
  label: string
  description: string
  allowedRoutes: NoraActionRoute[]
  consent: {
    mode: 'explicit'
    scope: 'single-action'
  }
}

export const noraActionDefinitions: Record<NoraActionType, NoraActionDefinition> = {
  'three-beautiful-things': {
    type: 'three-beautiful-things',
    family: 'discover',
    label: 'Three Beautiful Things',
    description: 'A small observation walk with three private discoveries.',
    allowedRoutes: ['iphone', 'watch-via-iphone'],
    consent: { mode: 'explicit', scope: 'single-action' },
  },
  'breathing-reset': {
    type: 'breathing-reset',
    family: 'reset',
    label: 'Breathing Reset',
    description: 'A short guided reset on the surface the user chooses.',
    allowedRoutes: ['workbench-only', 'iphone', 'watch-via-iphone'],
    consent: { mode: 'explicit', scope: 'single-action' },
  },
  'six-line-story': {
    type: 'six-line-story',
    family: 'create',
    label: 'Six Line Story',
    description: 'A bounded writing constraint completed privately in Workbench.',
    allowedRoutes: ['workbench-only'],
    consent: { mode: 'explicit', scope: 'single-action' },
  },
  'tiny-detour': {
    type: 'tiny-detour',
    family: 'discover',
    label: 'Tiny Detour',
    description: 'A short, optional change of route with a location-neutral mode.',
    allowedRoutes: ['iphone', 'watch-via-iphone'],
    consent: { mode: 'explicit', scope: 'single-action' },
  },
}

const lifecycleRank: Partial<Record<NoraActionStatus, number>> = {
  pending: 0,
  'delivered-phone': 1,
  'delivered-watch': 2,
  acknowledged: 3,
  'in-progress': 4,
  completed: 5,
}

const terminalStatuses = new Set<NoraActionStatus>([
  'completed',
  'failed',
  'cancelled',
  'expired',
])

function assertISODate(value: string, label: string): number {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) throw new Error(`${label} must be a valid ISO date.`)
  return timestamp
}

function assertBoundedText(value: string, label: string, maximum: number): void {
  const trimmed = value.trim()
  const containsControlCharacter = Array.from(trimmed).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint < 32 || codePoint === 127
  })
  if (!trimmed || trimmed.length > maximum || containsControlCharacter) {
    throw new Error(`${label} is outside the action runtime boundary.`)
  }
}

function validateInput(input: NoraActionInput): NoraActionProgressContract {
  switch (input.type) {
    case 'three-beautiful-things':
      if (
        input.targetCount !== 3 ||
        input.captureMode !== 'photo-or-text' ||
        input.setting !== 'outdoor-or-indoor'
      ) throw new Error('Three Beautiful Things input is invalid.')
      return { kind: 'count', target: 3, unit: 'discoveries' }
    case 'breathing-reset':
      if (![60, 120, 180].includes(input.durationSeconds)) {
        throw new Error('Breathing Reset duration is invalid.')
      }
      return { kind: 'duration', target: input.durationSeconds, unit: 'seconds' }
    case 'six-line-story':
      if (input.lineCount !== 6 || input.promptStyle !== 'constraint') {
        throw new Error('Six Line Story input is invalid.')
      }
      return { kind: 'count', target: 6, unit: 'lines' }
    case 'tiny-detour':
      if (![5, 10, 15].includes(input.maximumMinutes)) {
        throw new Error('Tiny Detour duration is invalid.')
      }
      return { kind: 'completion', target: 1, unit: 'detour' }
  }
}

function canAcceptSnapshotTransition(
  previous: NoraActionStatus,
  candidate: NoraActionStatus,
): boolean {
  if (previous === 'completed') return candidate === 'completed'
  if (previous === 'cancelled' || previous === 'expired') return false
  if (previous === 'failed') return candidate === 'pending' || candidate === 'cancelled'
  if (['failed', 'cancelled', 'expired'].includes(candidate)) return true
  const previousRank = lifecycleRank[previous]
  const candidateRank = lifecycleRank[candidate]
  return previousRank !== undefined && candidateRank !== undefined && candidateRank >= previousRank
}

export function createActionConsentReceipt(input: {
  id: string
  actionType: NoraActionType
  invitationId: string
  approved: boolean
  approvedAt: string
}): NoraActionConsentReceipt {
  if (!input.approved) throw new Error('Explicit approval is required before action preparation.')
  assertBoundedText(input.id, 'Consent receipt ID', 120)
  assertBoundedText(input.invitationId, 'Invitation ID', 120)
  assertISODate(input.approvedAt, 'Consent approval time')
  return {
    id: input.id,
    actionType: input.actionType,
    invitationId: input.invitationId,
    decision: 'approved',
    scope: 'single-action',
    approvedAt: input.approvedAt,
    surface: 'workbench',
  }
}

export function prepareNoraAction(input: {
  actionType: NoraActionType
  invitationId: string
  title: string
  prompt: string
  actionInput: NoraActionInput
  route: NoraActionRoute
  consent: NoraActionConsentReceipt
  idempotencyKey: string
  createdAt: string
  expiresAt: string
}): NoraActionDispatch {
  const definition = noraActionDefinitions[input.actionType]
  if (!definition.allowedRoutes.includes(input.route)) {
    throw new Error(`${definition.label} cannot use the requested route.`)
  }
  if (input.actionInput.type !== input.actionType) {
    throw new Error('Action input does not match the requested action type.')
  }
  if (input.actionInput.type === 'breathing-reset') {
    const expectedSurface = input.route === 'workbench-only'
      ? 'workbench'
      : input.route === 'iphone'
        ? 'iphone'
        : 'watch'
    if (input.actionInput.guidanceSurface !== expectedSurface) {
      throw new Error('Breathing Reset guidance surface does not match its route.')
    }
  }
  if (
    input.actionInput.type === 'tiny-detour' &&
    input.actionInput.locationMode === 'nearby-with-permission'
  ) {
    throw new Error('Nearby Tiny Detour requires a connector permission contract.')
  }
  if (
    input.consent.actionType !== input.actionType ||
    input.consent.invitationId !== input.invitationId ||
    input.consent.decision !== 'approved' ||
    input.consent.scope !== 'single-action'
  ) {
    throw new Error('Consent receipt does not authorize this action.')
  }
  assertBoundedText(input.invitationId, 'Invitation ID', 120)
  assertBoundedText(input.idempotencyKey, 'Idempotency key', 120)
  assertBoundedText(input.title, 'Action title', 80)
  assertBoundedText(input.prompt, 'Action prompt', 320)
  const createdAt = assertISODate(input.createdAt, 'Action creation time')
  const expiresAt = assertISODate(input.expiresAt, 'Action expiry')
  const approvedAt = assertISODate(input.consent.approvedAt, 'Consent approval time')
  if (approvedAt > createdAt) {
    throw new Error('Consent approval cannot occur after action preparation.')
  }
  if (expiresAt <= createdAt || expiresAt - createdAt > 2 * 60 * 60 * 1000) {
    throw new Error('Action expiry must be within the two hour runtime boundary.')
  }

  return {
    runtimeVersion: 1,
    actionType: input.actionType,
    invitationId: input.invitationId,
    title: input.title.trim(),
    prompt: input.prompt.trim(),
    input: input.actionInput,
    route: input.route,
    progress: validateInput(input.actionInput),
    consent: input.consent,
    idempotencyKey: input.idempotencyKey,
    createdAt: input.createdAt,
    expiresAt: input.expiresAt,
  }
}

export function createActionOutcome(
  status: NoraActionStatus,
  recordedAt: string,
): NoraActionOutcome | undefined {
  if (!terminalStatuses.has(status)) return undefined
  assertISODate(recordedAt, 'Outcome time')
  const summaries: Record<NoraActionOutcome['kind'], string> = {
    completed: 'The action reached its confirmed completion boundary.',
    failed: 'The action stopped before completion was confirmed.',
    cancelled: 'The user cancelled the action.',
    expired: 'The action expired without implying completion.',
  }
  const kind = status as NoraActionOutcome['kind']
  return {
    kind,
    recordedAt,
    summary: summaries[kind],
    memoryDisposition: kind === 'completed' ? 'awaiting-user-choice' : 'not-eligible',
  }
}

export function validateActionSnapshot(
  dispatch: NoraActionDispatch,
  candidate: NoraActionSnapshot,
  previous?: NoraActionSnapshot,
): NoraActionSnapshot {
  if (
    candidate.actionType !== dispatch.actionType ||
    candidate.invitationId !== dispatch.invitationId ||
    candidate.route !== dispatch.route ||
    candidate.expiresAt !== dispatch.expiresAt ||
    candidate.progress.kind !== dispatch.progress.kind ||
    candidate.progress.target !== dispatch.progress.target ||
    candidate.progress.unit !== dispatch.progress.unit
  ) throw new Error('Action snapshot does not match its prepared contract.')
  if (
    (dispatch.route === 'workbench-only' &&
      ['delivered-phone', 'delivered-watch'].includes(candidate.status)) ||
    (dispatch.route === 'iphone' && candidate.status === 'delivered-watch')
  ) throw new Error('Action snapshot status is not valid for its prepared route.')
  const snapshotTime = assertISODate(candidate.updatedAt, 'Action snapshot time')
  const expiryTime = assertISODate(candidate.expiresAt, 'Action snapshot expiry')
  const createdTime = assertISODate(dispatch.createdAt, 'Action creation time')
  if (snapshotTime < createdTime) {
    throw new Error('Action snapshot cannot predate its prepared contract.')
  }
  if (candidate.status !== 'expired' && snapshotTime >= expiryTime) {
    throw new Error('An expired action cannot report a new active state.')
  }

  if (
    !Number.isInteger(candidate.progress.completed) ||
    candidate.progress.completed < 0 ||
    candidate.progress.completed > candidate.progress.target
  ) throw new Error('Action progress is outside its prepared contract.')

  if (candidate.status === 'completed' && candidate.progress.completed !== candidate.progress.target) {
    throw new Error('Action completion requires the prepared progress target.')
  }
  if (
    ['pending', 'delivered-phone', 'delivered-watch', 'acknowledged'].includes(candidate.status) &&
    candidate.progress.completed !== 0
  ) throw new Error(`Action progress is not valid while status is ${candidate.status}.`)

  if (previous) {
    if (previous.id !== candidate.id) throw new Error('Action identity cannot change.')
    if (snapshotTime < assertISODate(previous.updatedAt, 'Previous action snapshot time')) {
      throw new Error('Action snapshot time cannot move backward.')
    }
    if (!canAcceptSnapshotTransition(previous.status, candidate.status)) {
      throw new Error(`Invalid action transition: ${previous.status} to ${candidate.status}`)
    }
    if (candidate.progress.completed < previous.progress.completed) {
      throw new Error('Action progress cannot decrease.')
    }
  }

  const outcomeTime = candidate.outcome?.recordedAt ?? candidate.updatedAt
  const outcome = createActionOutcome(candidate.status, outcomeTime)
  if (candidate.outcome) {
    const recordedAt = assertISODate(candidate.outcome.recordedAt, 'Outcome time')
    if (
      !outcome ||
      recordedAt < createdTime ||
      recordedAt > snapshotTime ||
      candidate.outcome.kind !== outcome.kind ||
      candidate.outcome.summary !== outcome.summary ||
      candidate.outcome.memoryDisposition !== outcome.memoryDisposition
    ) throw new Error('Action outcome does not match its privacy-safe contract.')
  }
  return {
    ...candidate,
    progress: { ...candidate.progress },
    outcome: candidate.outcome ?? outcome,
  }
}

export function routeLabel(route: NoraActionRoute): string {
  switch (route) {
    case 'workbench-only': return 'Workbench only'
    case 'iphone': return 'Workbench to iPhone'
    case 'watch-via-iphone': return 'Workbench to iPhone to Watch'
  }
}
