import type {
  AutonomyLevel,
  DemoProfile,
  Invitation,
  InvitationAdjustment,
  StretchLevel,
} from './types'

const DAY_MS = 86_400_000

export function daysSinceLastEureka(profile: DemoProfile): number {
  const entries = profile.conversations
    .find((thread) => thread.mode === 'eureka')
    ?.entries.filter((entry) => entry.speaker === 'user')

  const latest = entries?.at(-1)
  if (!latest) return Number.POSITIVE_INFINITY

  const asOf = new Date(profile.metadata.asOfDate).getTime()
  const occurredAt = new Date(latest.occurredAt).getTime()
  return Math.floor((asOf - occurredAt) / DAY_MS)
}

export function shouldSurfaceDrySpellInvitation(
  profile: DemoProfile,
  autonomy: AutonomyLevel,
): boolean {
  if (autonomy === 'quiet') return false
  return daysSinceLastEureka(profile) >= 4
}

export function createHeroInvitation(
  profile: DemoProfile,
  stretch: StretchLevel,
): Invitation {
  const requestedMinutes = stretch === 'gentle' ? 12 : stretch === 'bold' ? 28 : 20
  const minutes = Math.min(requestedMinutes, profile.context.availableMinutes)
  const energy =
    profile.context.energy === 'low' || stretch !== 'bold' ? 'low' : 'medium'

  return {
    id: 'three-beautiful-things-v1',
    family: 'discover',
    title: 'Three Beautiful Things',
    observation: 'Your Eureka thread has been quiet for four days.',
    prompt:
      'Take a short walk somewhere slightly unfamiliar. Photograph three things that feel beautiful before you decide why.',
    reason:
      'Your own entries connect low-pressure walks and changes of scene with returning curiosity.',
    estimatedMinutes: minutes,
    energy,
    privacy:
      'Photos stay on the iPhone. The Workbench receives only progress and completion in the live design.',
    evidenceIds: [
      'evidence-long-way-home',
      'evidence-park-colors',
      'evidence-user-confirmed-novelty',
      'evidence-current-flatness',
    ],
    alternatives: [
      { adjustment: 'indoor', label: 'Keep it indoors', description: 'Find three details inside a public space or at home.' },
      { adjustment: 'shorter', label: 'Make it shorter', description: 'Use a twelve-minute loop with no destination.' },
      { adjustment: 'lower-energy', label: 'Lower the energy', description: 'Photograph from one calm place instead of walking.' },
      { adjustment: 'no-social', label: 'No social contact', description: 'Keep the activity fully solitary.' },
      { adjustment: 'alternate-activity', label: 'Try another activity', description: 'Collect three colors in a written field note.' },
    ],
    appliedAdjustments: [],
    requiresAcceptance: true,
  }
}

export function applyInvitationAdjustment(
  invitation: Invitation,
  adjustment: InvitationAdjustment,
): Invitation {
  const appliedAdjustments = Array.from(
    new Set([...invitation.appliedAdjustments, adjustment]),
  )
  const next = { ...invitation, appliedAdjustments }

  switch (adjustment) {
    case 'indoor':
      return {
        ...next,
        title: 'Three Beautiful Things, Inside',
        prompt:
          'Stay indoors and photograph three small details you would normally pass without noticing.',
      }
    case 'shorter':
      return {
        ...next,
        title: 'Three Beautiful Things, Twelve Minutes',
        estimatedMinutes: 12,
        prompt:
          'Take a twelve-minute loop and photograph three things that interrupt your usual visual rhythm.',
      }
    case 'lower-energy':
      return {
        ...next,
        title: 'Three Beautiful Things, From Here',
        estimatedMinutes: 8,
        energy: 'low',
        prompt:
          'Choose one calm place. Photograph three details from where you are, with no walking target.',
      }
    case 'no-social':
      return {
        ...next,
        title: 'Three Beautiful Things, Solo',
        prompt:
          'Take a quiet route and photograph three beautiful details. No conversation or sharing is part of the activity.',
      }
    case 'alternate-activity':
      return {
        ...next,
        title: 'Three Colors I Nearly Missed',
        family: 'create',
        estimatedMinutes: 10,
        energy: 'low',
        prompt:
          'Write down three colors you can see and one sentence about what each changes in the room.',
        privacy: 'The field note stays in this demo session unless you choose to save it.',
      }
  }
}
