import { routeLabel } from './actionRuntime'
import { evaluateHeroConsent } from './consentPolicy'
import type {
  DemoProfile,
  NoraActionRoute,
  NoraActionType,
  WorkbenchState,
} from './types'

export type ActionDeskStage =
  | 'noticed'
  | 'proposed'
  | 'approved'
  | 'active'
  | 'completed'
  | 'failed'
  | 'declined'
  | 'stopped'

export type ActionDeskConsentState =
  | 'not-requested'
  | 'awaiting-user'
  | 'approved'
  | 'declined'

export interface ActionDeskRecord {
  id: string
  title: string
  stage: ActionDeskStage
  occurredAt: string
  summary: string
  sourceLabel: string
  provenance: 'current-session' | 'seeded-history'
  actor: 'nora' | 'user' | 'device'
  actionType?: NoraActionType
  consentState: ActionDeskConsentState
  authoritySummary: string
  route?: NoraActionRoute
  progress?: {
    completed: number
    target: number
    unit: string
  }
  evidenceIds: string[]
  privacySummary: string
  memorySummary: string
  current: boolean
}

const activeStatuses = new Set([
  'pending',
  'delivered-phone',
  'delivered-watch',
  'acknowledged',
  'in-progress',
])

function currentActionStage(state: WorkbenchState): ActionDeskStage {
  if (state.invitationDisposition === 'declined') return 'declined'
  if (state.invitationDisposition !== 'accepted') return 'proposed'
  if (state.delivery.status === 'idle') return 'approved'
  if (activeStatuses.has(state.delivery.status)) return 'active'
  if (state.delivery.status === 'completed') return 'completed'
  if (state.delivery.status === 'failed') return 'failed'
  return 'stopped'
}

function currentSummary(state: WorkbenchState, stage: ActionDeskStage): string {
  switch (stage) {
    case 'proposed':
      return 'Nora prepared a suggestion from the current dry-spell evidence. It has not been approved or sent.'
    case 'approved':
      return 'You approved this invitation. Nothing has been sent to another device.'
    case 'active':
      return `The bounded handoff is ${state.delivery.status}. ${state.delivery.progressCount} of ${state.delivery.progressTarget} ${state.delivery.progressUnit} are confirmed.`
    case 'completed':
      return 'The prepared progress target was confirmed. Any durable learning still waits for your choice.'
    case 'failed':
      return 'The handoff failed before completion was confirmed. No unconfirmed delivery is implied.'
    case 'declined':
      return 'You chose not now. Nora records a boundary, not a failure or a broken streak.'
    case 'stopped':
      return `The action is ${state.delivery.status}. No device action is active and completion is not implied.`
    case 'noticed':
      return ''
  }
}

function currentAuthority(stage: ActionDeskStage): string {
  switch (stage) {
    case 'proposed': return 'Nora may suggest. Only you can approve this action.'
    case 'approved': return 'You approved the invitation. Sending remains a separate choice.'
    case 'active': return 'You approved and initiated this bounded handoff.'
    case 'completed': return 'The device chain confirmed the prepared completion boundary.'
    case 'failed': return 'Consent existed, but the device chain did not confirm completion.'
    case 'declined': return 'You declined. No reason is required and Nora does not execute.'
    case 'stopped': return 'Cancellation or expiry ended authority for this action.'
    case 'noticed': return 'Observation only. Nora has not prepared or sent an action.'
  }
}

function currentConsent(stage: ActionDeskStage): ActionDeskConsentState {
  if (stage === 'proposed') return 'awaiting-user'
  if (stage === 'declined') return 'declined'
  return 'approved'
}

function currentActionRecord(profile: DemoProfile, state: WorkbenchState): ActionDeskRecord {
  const stage = currentActionStage(state)
  const prepared = !['proposed', 'declined'].includes(stage)
  return {
    id: `current-${state.invitation.id}`,
    title: state.invitation.title,
    stage,
    occurredAt: state.delivery.updatedAt ?? profile.metadata.asOfDate,
    summary: currentSummary(state, stage),
    sourceLabel: 'Current Workbench session',
    provenance: 'current-session',
    actor: stage === 'proposed' ? 'nora' : stage === 'declined' || stage === 'approved' ? 'user' : 'device',
    actionType: 'three-beautiful-things',
    consentState: currentConsent(stage),
    authoritySummary: currentAuthority(stage),
    route: prepared ? state.delivery.route ?? 'watch-via-iphone' : undefined,
    progress: prepared
      ? {
          completed: state.delivery.progressCount,
          target: state.delivery.progressTarget,
          unit: state.delivery.progressUnit,
        }
      : undefined,
    evidenceIds: state.invitation.evidenceIds,
    privacySummary: 'Only action and status metadata may cross devices. Photos, health data, and memory evidence remain outside the relay.',
    memorySummary: stage === 'completed'
      ? 'Awaiting your separate memory choice.'
      : 'No durable memory write.',
    current: true,
  }
}

const seededHistory: ActionDeskRecord[] = [
  {
    id: 'history-breathing-reset',
    title: 'Breathing Reset',
    stage: 'completed',
    occurredAt: '2026-08-25T21:14:00.000Z',
    summary: 'A two minute reset reached its prepared duration. No private reflection was attached.',
    sourceLabel: 'Seeded activity history',
    provenance: 'seeded-history',
    actor: 'device',
    actionType: 'breathing-reset',
    consentState: 'approved',
    authoritySummary: 'Jules approved and started this bounded reset.',
    route: 'watch-via-iphone',
    progress: { completed: 120, target: 120, unit: 'seconds' },
    evidenceIds: [],
    privacySummary: 'Only completion status and duration are represented in this seeded record.',
    memorySummary: 'Not saved to durable memory.',
    current: false,
  },
  {
    id: 'history-tiny-detour-failed',
    title: 'Tiny Detour',
    stage: 'failed',
    occurredAt: '2026-08-24T18:06:00.000Z',
    summary: 'The seeded iPhone relay did not confirm the handoff. Nothing was marked delivered.',
    sourceLabel: 'Seeded activity history',
    provenance: 'seeded-history',
    actor: 'device',
    actionType: 'tiny-detour',
    consentState: 'approved',
    authoritySummary: 'Jules approved the attempt, but the device chain did not confirm execution.',
    route: 'iphone',
    progress: { completed: 0, target: 1, unit: 'detour' },
    evidenceIds: [],
    privacySummary: 'No location, route, or journal content is present in this seeded failure record.',
    memorySummary: 'Failure is not eligible for memory.',
    current: false,
  },
  {
    id: 'history-six-line-story-declined',
    title: 'Six Line Story',
    stage: 'declined',
    occurredAt: '2026-08-22T20:30:00.000Z',
    summary: 'Jules chose not now. No explanation was requested and no writing surface opened.',
    sourceLabel: 'Seeded invitation history',
    provenance: 'seeded-history',
    actor: 'user',
    actionType: 'six-line-story',
    consentState: 'declined',
    authoritySummary: 'Jules declined. Nora did not prepare or execute the activity.',
    evidenceIds: [],
    privacySummary: 'There is no exercise text because the activity never began.',
    memorySummary: 'The decline is a preference boundary, not a negative score.',
    current: false,
  },
]

export function buildActionDeskRecords(
  profile: DemoProfile,
  state: WorkbenchState,
): ActionDeskRecord[] {
  const consent = evaluateHeroConsent(state.consentPolicies)
  const notice: ActionDeskRecord = {
    id: 'notice-eureka-gap',
    title: 'Four quiet Eureka days',
    stage: 'noticed',
    occurredAt: profile.metadata.asOfDate,
    summary: 'Nora observed a recent creative lull and gathered bounded supporting context before suggesting anything.',
    sourceLabel: 'Nora observation engine',
    provenance: 'current-session',
    actor: 'nora',
    consentState: 'not-requested',
    authoritySummary: currentAuthority('noticed'),
    evidenceIds: state.invitation.evidenceIds,
    privacySummary: 'The observation remains inside the current private profile and is not a device action.',
    memorySummary: 'This observation does not create new durable memory.',
    current: true,
  }

  const currentRecords: ActionDeskRecord[] = []
  const existingDecision = state.invitationDisposition === 'accepted' || state.delivery.status !== 'idle'
  const maySurfaceProposal = state.autonomy !== 'quiet' && consent.canSuggest
  if (maySurfaceProposal || existingDecision) currentRecords.push(currentActionRecord(profile, state))
  if (consent.canObserve) currentRecords.push(notice)

  return [...currentRecords, ...seededHistory]
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))
}

export function actionDeskRouteSummary(record: ActionDeskRecord): string {
  if (!record.route) return 'No route prepared'
  const label = routeLabel(record.route)
  return record.stage === 'approved' ? `Planned, not sent: ${label}` : label
}
