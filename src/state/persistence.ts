import type {
  AutonomyLevel,
  DeliveryState,
  StretchLevel,
} from '../domain/types'

const PREFERENCE_KEY = 'somnora-workbench-preferences-v1'
const DEMO_PROGRESS_KEY = 'somnora-workbench-demo-progress-v1'

interface SafePreferences {
  autonomy: AutonomyLevel
  stretch: StretchLevel
}

interface SafeDemoProgress {
  invitationAccepted: boolean
  delivery: Pick<
    DeliveryState,
    'status' | 'progressCount' | 'simulated' | 'actionId'
  >
}

const autonomyValues: AutonomyLevel[] = ['quiet', 'balanced', 'active']
const stretchValues: StretchLevel[] = ['gentle', 'open', 'bold']

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
    return {
      autonomy: record.autonomy as AutonomyLevel,
      stretch: record.stretch as StretchLevel,
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
    if (
      typeof record.status !== 'string' ||
      typeof record.progressCount !== 'number' ||
      record.simulated !== true
    ) {
      return null
    }
    return {
      invitationAccepted: (value as Record<string, unknown>).invitationAccepted === true,
      delivery: {
        status: record.status as DeliveryState['status'],
        progressCount: record.progressCount as DeliveryState['progressCount'],
        simulated: true,
        actionId:
          typeof record.actionId === 'string' ? record.actionId : undefined,
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
