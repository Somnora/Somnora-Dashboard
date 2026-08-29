import type {
  ConsentCapability,
  ConsentDomain,
  ConsentPolicies,
} from './types'

export interface ConsentDomainDefinition {
  id: ConsentDomain
  label: string
  shortLabel: string
  description: string
  sourceLabel: string
  sourceState: 'seeded' | 'future'
  dataBoundary: string
  preparationExample: string
  maximumCapability: ConsentCapability
}

export interface HeroConsentAccess {
  canObserve: boolean
  canSuggest: boolean
  canPrepare: boolean
  suggestionBoundary: string
  preparationBoundary: string
}

export const consentCapabilities: Array<{
  id: ConsentCapability
  label: string
  description: string
}> = [
  { id: 'off', label: 'Off', description: 'Nora cannot use this domain.' },
  { id: 'observe', label: 'Observe', description: 'Nora may use available context when you open Somnora.' },
  { id: 'suggest', label: 'Suggest', description: 'Nora may surface an optional idea using this context.' },
  { id: 'prepare', label: 'Prepare', description: 'Nora may build a reviewable draft action. Sending still waits for you.' },
]

export const consentDomains: ConsentDomainDefinition[] = [
  {
    id: 'dream',
    label: 'Dream journal',
    shortLabel: 'Dream',
    description: 'Dream entries and your own recorded associations.',
    sourceLabel: 'Seeded profile',
    sourceState: 'seeded',
    dataBoundary: 'No universal symbol meaning or clinical inference.',
    preparationExample: 'Prepare a private reflection prompt for review.',
    maximumCapability: 'prepare',
  },
  {
    id: 'daily',
    label: 'Daily journal',
    shortLabel: 'Daily',
    description: 'Daily entries, check-ins, and user-confirmed patterns.',
    sourceLabel: 'Seeded profile',
    sourceState: 'seeded',
    dataBoundary: 'Private journal text stays outside device action payloads.',
    preparationExample: 'Prepare a bounded reset or reflection for review.',
    maximumCapability: 'prepare',
  },
  {
    id: 'eureka',
    label: 'Eureka ideas',
    shortLabel: 'Eureka',
    description: 'Idea history, creative gaps, and confirmed creative patterns.',
    sourceLabel: 'Seeded profile',
    sourceState: 'seeded',
    dataBoundary: 'Only evidence identifiers support actions. Entry text does not cross devices.',
    preparationExample: 'Prepare Three Beautiful Things after a creative lull.',
    maximumCapability: 'prepare',
  },
  {
    id: 'sleep',
    label: 'Sleep and recovery',
    shortLabel: 'Sleep',
    description: 'Rest, energy, and readiness context available to Somnora.',
    sourceLabel: 'Seeded profile',
    sourceState: 'seeded',
    dataBoundary: 'No raw HealthKit data or health score leaves the device boundary.',
    preparationExample: 'Prepare a lower-energy alternative for review.',
    maximumCapability: 'prepare',
  },
  {
    id: 'activity',
    label: 'Activity and location',
    shortLabel: 'Activity',
    description: 'Movement context and location only when separately available.',
    sourceLabel: 'Seeded context',
    sourceState: 'seeded',
    dataBoundary: 'No exact location history is stored in this console or action record.',
    preparationExample: 'Prepare a location-neutral or permissioned nearby activity.',
    maximumCapability: 'prepare',
  },
  {
    id: 'fitness',
    label: 'Somnora Fitness',
    shortLabel: 'Fitness',
    description: 'Future capacity, movement, and training context.',
    sourceLabel: 'Future adapter',
    sourceState: 'future',
    dataBoundary: 'No Fitness connector or live Fitness data exists in this demo.',
    preparationExample: 'Controls become available only after a connector is added.',
    maximumCapability: 'off',
  },
  {
    id: 'nutrition',
    label: 'Somnora Nutrition',
    shortLabel: 'Nutrition',
    description: 'Future meal, hydration, and nutrition context.',
    sourceLabel: 'Future adapter',
    sourceState: 'future',
    dataBoundary: 'No Nutrition connector or live Nutrition data exists in this demo.',
    preparationExample: 'Controls become available only after a connector is added.',
    maximumCapability: 'off',
  },
]

const capabilityRank: Record<ConsentCapability, number> = {
  off: 0,
  observe: 1,
  suggest: 2,
  prepare: 3,
}

export function createDefaultConsentPolicies(): ConsentPolicies {
  return {
    dream: 'observe',
    daily: 'suggest',
    eureka: 'prepare',
    sleep: 'suggest',
    activity: 'prepare',
    fitness: 'off',
    nutrition: 'off',
  }
}

export function consentCapabilityAllows(
  current: ConsentCapability,
  required: ConsentCapability,
): boolean {
  return capabilityRank[current] >= capabilityRank[required]
}

export function isConsentCapabilityAvailable(
  definition: ConsentDomainDefinition,
  capability: ConsentCapability,
): boolean {
  return capabilityRank[capability] <= capabilityRank[definition.maximumCapability]
}

export function updateConsentPolicy(
  policies: ConsentPolicies,
  domain: ConsentDomain,
  capability: ConsentCapability,
): ConsentPolicies {
  const definition = consentDomains.find((item) => item.id === domain)
  if (!definition || !isConsentCapabilityAvailable(definition, capability)) {
    return policies
  }
  return { ...policies, [domain]: capability }
}

export function evaluateHeroConsent(
  policies: ConsentPolicies,
): HeroConsentAccess {
  const canObserve = consentCapabilityAllows(policies.eureka, 'observe')
  const canSuggest = consentCapabilityAllows(policies.eureka, 'suggest') &&
    consentCapabilityAllows(policies.activity, 'suggest')
  const canPrepare = canSuggest &&
    consentCapabilityAllows(policies.eureka, 'prepare') &&
    consentCapabilityAllows(policies.activity, 'prepare')

  let suggestionBoundary = 'Eureka and activity context may support optional suggestions.'
  if (!canObserve) {
    suggestionBoundary = 'Eureka access is off, so Nora cannot use the dry-spell signal.'
  } else if (!consentCapabilityAllows(policies.eureka, 'suggest')) {
    suggestionBoundary = 'Eureka allows observation, but not proactive suggestions.'
  } else if (!consentCapabilityAllows(policies.activity, 'suggest')) {
    suggestionBoundary = 'Activity context does not allow proactive suggestions.'
  }

  let preparationBoundary = 'Nora may prepare a reviewable action. Sending still requires explicit approval.'
  if (!canSuggest) {
    preparationBoundary = 'An action cannot be prepared while its suggestion boundary is closed.'
  } else if (!consentCapabilityAllows(policies.eureka, 'prepare')) {
    preparationBoundary = 'Eureka allows suggestions, but not preparation of an action.'
  } else if (!consentCapabilityAllows(policies.activity, 'prepare')) {
    preparationBoundary = 'Activity context allows suggestions, but not preparation of a device action.'
  }

  return {
    canObserve,
    canSuggest,
    canPrepare,
    suggestionBoundary,
    preparationBoundary,
  }
}
