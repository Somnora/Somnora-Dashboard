import type {
  AutonomyLevel,
  ConsentCapability,
  ConsentPolicies,
  DeliveryState,
  StretchLevel,
} from '../domain/types'
import {
  consentDomains,
  createDefaultConsentPolicies,
  updateConsentPolicy,
} from '../domain/consentPolicy'

const PREFERENCE_KEY = 'somnora-workbench-preferences-v1'
const DEMO_PROGRESS_KEY = 'somnora-workbench-demo-progress-v1'

interface SafePreferences {
  autonomy: AutonomyLevel
  stretch: StretchLevel
  consentPolicies: ConsentPolicies
}

interface SafeDemoProgress {
  invitationAccepted: boolean
  delivery: Pick<
    DeliveryState,
    | 'status'
    | 'progressCount'
    | 'progressTarget'
    | 'progressUnit'
    | 'simulated'
    | 'actionId'
    | 'actionType'
    | 'route'
    | 'expiresAt'
    | 'updatedAt'
  >
}

const autonomyValues: AutonomyLevel[] = ['quiet', 'balanced', 'active']
const stretchValues: StretchLevel[] = ['gentle', 'open', 'bold']
const consentCapabilityValues: ConsentCapability[] = ['off', 'observe', 'suggest', 'prepare']
const deliveryStatuses: DeliveryState['status'][] = [
  'idle', 'pending', 'delivered-phone', 'delivered-watch', 'acknowledged',
  'in-progress', 'completed', 'failed', 'cancelled', 'expired',
]
const actionTypes: NonNullable<DeliveryState['actionType']>[] = [
  'three-beautiful-things', 'breathing-reset', 'six-line-story', 'tiny-detour',
]
const actionRoutes: NonNullable<DeliveryState['route']>[] = [
  'workbench-only', 'iphone', 'watch-via-iphone',
]

function safeOptionalIdentifier(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z0-9-]{1,160}$/i.test(value)
    ? value
    : undefined
}

function safeOptionalISODate(value: unknown): string | undefined {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value))
      ? value
      : undefined
}

export function loadPreferences(storage: Storage): SafePreferences | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(PREFERENCE_KEY) ?? 'null')
    if (!value || typeof value !== 'object') return null
    const record = value as Record<string, unknown>
    if (
      !autonomyValues.includes(record.autonomy as AutonomyLevel) ||
      !stretchValues.includes(record.stretch as StretchLevel)
    ) {
      return null
    }
    const storedPolicies = record.consentPolicies
    let consentPolicies = createDefaultConsentPolicies()
    if (storedPolicies && typeof storedPolicies === 'object') {
      for (const definition of consentDomains) {
        const value = (storedPolicies as Record<string, unknown>)[definition.id]
        if (!consentCapabilityValues.includes(value as ConsentCapability)) return null
        const updated = updateConsentPolicy(
          consentPolicies,
          definition.id,
          value as ConsentCapability,
        )
        if (updated === consentPolicies && value !== consentPolicies[definition.id]) return null
        consentPolicies = updated
      }
    }
    return {
      autonomy: record.autonomy as AutonomyLevel,
      stretch: record.stretch as StretchLevel,
      consentPolicies,
    }
  } catch {
    return null
  }
}

export function savePreferences(
  storage: Storage,
  preferences: SafePreferences,
): void {
  storage.setItem(PREFERENCE_KEY, JSON.stringify(preferences))
}

export function loadDemoProgress(storage: Storage): SafeDemoProgress | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(DEMO_PROGRESS_KEY) ?? 'null')
    if (!value || typeof value !== 'object') return null
    const delivery = (value as Record<string, unknown>).delivery
    if (!delivery || typeof delivery !== 'object') return null
    const record = delivery as Record<string, unknown>
    const progressTarget =
      Number.isInteger(record.progressTarget) &&
      (record.progressTarget as number) > 0 &&
      (record.progressTarget as number) <= 3_600
        ? record.progressTarget as number
        : 3
    if (
      !deliveryStatuses.includes(record.status as DeliveryState['status']) ||
      !Number.isInteger(record.progressCount) ||
      (record.progressCount as number) < 0 ||
      (record.progressCount as number) > progressTarget ||
      record.simulated !== true
    ) {
      return null
    }
    const status = record.status as DeliveryState['status']
    const progressCount = record.progressCount as number
    if (
      (['idle', 'pending', 'delivered-phone', 'delivered-watch', 'acknowledged'].includes(status) &&
        progressCount !== 0) ||
      (status === 'completed' && progressCount !== progressTarget)
    ) return null
    return {
      invitationAccepted: (value as Record<string, unknown>).invitationAccepted === true,
      delivery: {
        status,
        progressCount,
        progressTarget,
        progressUnit:
          typeof record.progressUnit === 'string' &&
          /^[a-z ]{1,32}$/i.test(record.progressUnit)
            ? record.progressUnit
            : 'discoveries',
        simulated: true,
        actionId: safeOptionalIdentifier(record.actionId),
        actionType: actionTypes.includes(record.actionType as NonNullable<DeliveryState['actionType']>)
          ? record.actionType as DeliveryState['actionType']
          : undefined,
        route: actionRoutes.includes(record.route as NonNullable<DeliveryState['route']>)
          ? record.route as DeliveryState['route']
          : undefined,
        expiresAt: safeOptionalISODate(record.expiresAt),
        updatedAt: safeOptionalISODate(record.updatedAt),
      },
    }
  } catch {
    return null
  }
}

export function saveDemoProgress(
  storage: Storage,
  progress: SafeDemoProgress,
): void {
  storage.setItem(DEMO_PROGRESS_KEY, JSON.stringify(progress))
}

export const persistenceKeys = {
  preferences: PREFERENCE_KEY,
  demoProgress: DEMO_PROGRESS_KEY,
} as const
