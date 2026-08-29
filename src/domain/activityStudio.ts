import type {
  DemoProfile,
  EnergyLevel,
  InvitationFamily,
} from './types'

export type StudioAvailability =
  | 'interactive'
  | 'reviewable'
  | 'continuity'
  | 'preview'

export type StudioAction =
  | 'home-invitation'
  | 'burn-exercise'
  | 'six-line-story'

export type StudioMovement = 'stationary' | 'short-walk' | 'open'
export type StudioSocial = 'private' | 'optional-contact' | 'contact'
export type StudioSetting = 'indoors' | 'outdoors' | 'either'
export type StudioPrivacy = 'ephemeral' | 'private-capture' | 'user-shared'

export interface ActivityVariant {
  id: string
  label: string
  prompt: string
  minutes: number
  energy: EnergyLevel
  movement: Exclude<StudioMovement, 'open'>
  social: StudioSocial
  setting: StudioSetting
  privacy: StudioPrivacy
}

export interface StudioActivity {
  id: string
  title: string
  family: InvitationFamily
  summary: string
  availability: StudioAvailability
  provenance: 'new-workbench' | 'existing-somnora' | 'concept-only'
  action?: StudioAction
  variants: ActivityVariant[]
}

export interface StudioPreferences {
  maxMinutes: 5 | 10 | 20 | 30
  energy: EnergyLevel
  movement: StudioMovement
  socialBandwidth: 'low' | 'medium' | 'high'
  weather: DemoProfile['context']['weather']
  privacy: 'private-only' | 'sharing-optional'
}

export interface ActivityMatch {
  activity: StudioActivity
  fit: 'fits' | 'adjusted' | 'held'
  variant: ActivityVariant
  reasons: string[]
}

export const studioFamilies: Array<{
  id: InvitationFamily
  label: string
  description: string
}> = [
  { id: 'discover', label: 'Discover', description: 'Change what enters your attention.' },
  { id: 'connect', label: 'Connect', description: 'Make optional human contact intentional.' },
  { id: 'create', label: 'Create', description: 'Use a small constraint to begin.' },
  { id: 'reflect', label: 'Reflect', description: 'Work privately with what is already present.' },
  { id: 'reset', label: 'Reset', description: 'Lower demand and return to the moment.' },
]

export const activityCatalog: StudioActivity[] = [
  {
    id: 'three-beautiful-things',
    title: 'Three Beautiful Things',
    family: 'discover',
    summary: 'Collect three details that interrupt the ordinary without asking Nora to judge them.',
    availability: 'reviewable',
    provenance: 'new-workbench',
    action: 'home-invitation',
    variants: [
      {
        id: 'short-walk',
        label: 'Short walk',
        prompt: 'Take a short walk and capture three things that feel beautiful before deciding why.',
        minutes: 20,
        energy: 'medium',
        movement: 'short-walk',
        social: 'private',
        setting: 'outdoors',
        privacy: 'private-capture',
      },
      {
        id: 'inside',
        label: 'Stay inside',
        prompt: 'Notice three small details indoors that you would normally pass without seeing.',
        minutes: 10,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'indoors',
        privacy: 'private-capture',
      },
      {
        id: 'text-only',
        label: 'Text only',
        prompt: 'Write three visual details from where you are. No camera or walking is required.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'tiny-detour',
    title: 'Tiny Detour',
    family: 'discover',
    summary: 'Change one safe part of a familiar route and notice what becomes visible.',
    availability: 'preview',
    provenance: 'concept-only',
    variants: [
      {
        id: 'location-neutral',
        label: 'Location neutral',
        prompt: 'Choose one safe turn yourself. No location access or route history is used.',
        minutes: 10,
        energy: 'medium',
        movement: 'short-walk',
        social: 'private',
        setting: 'outdoors',
        privacy: 'ephemeral',
      },
      {
        id: 'window-detour',
        label: 'Window detour',
        prompt: 'Stay seated and study a view you normally ignore for five minutes.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'indoors',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'color-hunt',
    title: 'Color Hunt',
    family: 'discover',
    summary: 'Follow one color through a place and collect its different moods.',
    availability: 'preview',
    provenance: 'concept-only',
    variants: [
      {
        id: 'around-town',
        label: 'Around town',
        prompt: 'Choose one color and privately photograph five versions of it nearby.',
        minutes: 20,
        energy: 'medium',
        movement: 'short-walk',
        social: 'private',
        setting: 'outdoors',
        privacy: 'private-capture',
      },
      {
        id: 'one-room',
        label: 'One room',
        prompt: 'Find three variations of one color without leaving the room.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'indoors',
        privacy: 'private-capture',
      },
    ],
  },
  {
    id: 'six-line-story',
    title: 'Six Line Story',
    family: 'create',
    summary: 'Use six private lines to move an idea before your inner editor catches up.',
    availability: 'interactive',
    provenance: 'new-workbench',
    action: 'six-line-story',
    variants: [
      {
        id: 'image-first',
        label: 'Image first',
        prompt: 'Begin with a visual detail. Let each line change what the image means.',
        minutes: 10,
        energy: 'medium',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
      {
        id: 'dialogue-only',
        label: 'Dialogue only',
        prompt: 'Write six lines of dialogue. Do not explain who is speaking.',
        minutes: 10,
        energy: 'medium',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
      {
        id: 'one-breath-lines',
        label: 'One breath lines',
        prompt: 'Write six very short lines. Stop each line before it feels finished.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'sound-map',
    title: 'Sound Map',
    family: 'create',
    summary: 'Turn nearby sounds into a small spatial composition.',
    availability: 'preview',
    provenance: 'concept-only',
    variants: [
      {
        id: 'outside',
        label: 'Outside map',
        prompt: 'Sit outside and place each sound around a point that represents you.',
        minutes: 10,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'outdoors',
        privacy: 'ephemeral',
      },
      {
        id: 'inside',
        label: 'Inside map',
        prompt: 'Map the room by sound without recording audio.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'indoors',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'one-honest-question',
    title: 'One Honest Question',
    family: 'connect',
    summary: 'Prepare one open question for someone you trust, without sending it for you.',
    availability: 'preview',
    provenance: 'concept-only',
    variants: [
      {
        id: 'ask-someone',
        label: 'Ask someone',
        prompt: 'Choose a trusted person and ask one question that cannot be answered with yes or no.',
        minutes: 10,
        energy: 'medium',
        movement: 'stationary',
        social: 'contact',
        setting: 'either',
        privacy: 'user-shared',
      },
      {
        id: 'private-rehearsal',
        label: 'Private rehearsal',
        prompt: 'Write the question privately. Decide later whether you want to ask it.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'wonder-exchange',
    title: 'Wonder Exchange',
    family: 'connect',
    summary: 'Invite another person to trade one detail each that caught your attention.',
    availability: 'preview',
    provenance: 'concept-only',
    variants: [
      {
        id: 'together',
        label: 'Together',
        prompt: 'Ask a trusted person to share one ordinary thing they found unexpectedly beautiful.',
        minutes: 10,
        energy: 'medium',
        movement: 'stationary',
        social: 'contact',
        setting: 'either',
        privacy: 'user-shared',
      },
      {
        id: 'for-later',
        label: 'Collect for later',
        prompt: 'Privately note one detail you might choose to share another time.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'private-release',
    title: 'Private Release',
    family: 'reflect',
    summary: 'Write something temporary and choose whether to release it through the burn exercise.',
    availability: 'interactive',
    provenance: 'new-workbench',
    action: 'burn-exercise',
    variants: [
      {
        id: 'one-sentence',
        label: 'One sentence',
        prompt: 'Write one sentence you are ready to stop carrying for this moment.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
      {
        id: 'three-things',
        label: 'Three things',
        prompt: 'Write three insecurities, fears, or pressures you want to place outside yourself briefly.',
        minutes: 10,
        energy: 'medium',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'unsent-postcard',
    title: 'Unsent Postcard',
    family: 'reflect',
    summary: 'Address a few private lines to a past or future version of yourself.',
    availability: 'preview',
    provenance: 'concept-only',
    variants: [
      {
        id: 'past-self',
        label: 'Past self',
        prompt: 'Write a postcard to a version of you who could not see what came next.',
        minutes: 10,
        energy: 'medium',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
      {
        id: 'future-self',
        label: 'Future self',
        prompt: 'Write three lines to the version of you who has already crossed this week.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'breathing-reset',
    title: 'Breathing Reset',
    family: 'reset',
    summary: 'Continue Somnora breathing on the device you already use.',
    availability: 'continuity',
    provenance: 'existing-somnora',
    variants: [
      {
        id: 'one-minute',
        label: 'One minute',
        prompt: 'Follow the established one-minute breathing guide on iPhone or Apple Watch.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
      {
        id: 'two-minute',
        label: 'Two minutes',
        prompt: 'Follow the established two-minute breathing guide on iPhone or Apple Watch.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
    ],
  },
  {
    id: 'quiet-horizon',
    title: 'Quiet Horizon',
    family: 'reset',
    summary: 'Let your eyes rest at a distance while the interface asks nothing else from you.',
    availability: 'preview',
    provenance: 'concept-only',
    variants: [
      {
        id: 'window',
        label: 'Window view',
        prompt: 'Look toward the farthest visible point for one quiet minute.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'indoors',
        privacy: 'ephemeral',
      },
      {
        id: 'eyes-closed',
        label: 'Eyes closed',
        prompt: 'Close your eyes and let the next minute pass without an input goal.',
        minutes: 5,
        energy: 'low',
        movement: 'stationary',
        social: 'private',
        setting: 'either',
        privacy: 'ephemeral',
      },
    ],
  },
]

const energyRank: Record<EnergyLevel, number> = { low: 0, medium: 1, high: 2 }
const movementRank: Record<StudioMovement, number> = {
  stationary: 0,
  'short-walk': 1,
  open: 2,
}
const socialRank: Record<StudioSocial | StudioPreferences['socialBandwidth'], number> = {
  private: 0,
  low: 0,
  'optional-contact': 1,
  medium: 1,
  contact: 2,
  high: 2,
}

export function createStudioPreferences(
  profile: DemoProfile,
  external?: Pick<StudioPreferences, 'maxMinutes' | 'weather'>,
): StudioPreferences {
  const profileMinutes = profile.context.availableMinutes <= 5
    ? 5
    : profile.context.availableMinutes <= 10
      ? 10
      : profile.context.availableMinutes <= 20
        ? 20
        : 30
  return {
    maxMinutes: external?.maxMinutes ?? profileMinutes,
    energy: profile.context.energy,
    movement: profile.context.mobility === 'limited' ? 'stationary' : 'open',
    socialBandwidth: profile.context.socialBandwidth,
    weather: external?.weather ?? profile.context.weather,
    privacy: 'private-only',
  }
}

export function activityVariantFits(
  variant: ActivityVariant,
  preferences: StudioPreferences,
): boolean {
  if (variant.minutes > preferences.maxMinutes) return false
  if (energyRank[variant.energy] > energyRank[preferences.energy]) return false
  if (movementRank[variant.movement] > movementRank[preferences.movement]) return false
  if (socialRank[variant.social] > socialRank[preferences.socialBandwidth]) return false
  if (preferences.privacy === 'private-only' && variant.privacy === 'user-shared') return false
  if (preferences.weather !== 'clear' && variant.setting === 'outdoors') return false
  return true
}

function friction(variant: ActivityVariant, preferences: StudioPreferences): number {
  let score = 0
  if (variant.minutes > preferences.maxMinutes) score += variant.minutes - preferences.maxMinutes
  if (energyRank[variant.energy] > energyRank[preferences.energy]) score += 8
  if (movementRank[variant.movement] > movementRank[preferences.movement]) score += 8
  if (socialRank[variant.social] > socialRank[preferences.socialBandwidth]) score += 8
  if (preferences.privacy === 'private-only' && variant.privacy === 'user-shared') score += 12
  if (preferences.weather !== 'clear' && variant.setting === 'outdoors') score += 12
  return score
}

function fitReasons(variant: ActivityVariant): string[] {
  return [
    `${variant.minutes} min`,
    `${variant.energy} energy`,
    variant.movement === 'stationary' ? 'stationary' : 'short walk',
    variant.social === 'private' ? 'private' : variant.social.replaceAll('-', ' '),
    variant.setting,
  ]
}

export function matchStudioActivity(
  activity: StudioActivity,
  preferences: StudioPreferences,
): ActivityMatch {
  const firstFit = activity.variants.find((variant) =>
    activityVariantFits(variant, preferences))
  if (firstFit) {
    return {
      activity,
      fit: firstFit.id === activity.variants[0].id ? 'fits' : 'adjusted',
      variant: firstFit,
      reasons: fitReasons(firstFit),
    }
  }

  const closest = [...activity.variants].sort(
    (left, right) => friction(left, preferences) - friction(right, preferences),
  )[0]
  return {
    activity,
    fit: 'held',
    variant: closest,
    reasons: ['No version fits every current boundary. Adjust the fit controls to review it.'],
  }
}

export function matchActivityCatalog(
  preferences: StudioPreferences,
): ActivityMatch[] {
  const availabilityRank: Record<StudioAvailability, number> = {
    interactive: 0,
    reviewable: 1,
    continuity: 2,
    preview: 3,
  }
  const fitRank: Record<ActivityMatch['fit'], number> = {
    fits: 0,
    adjusted: 1,
    held: 2,
  }
  return activityCatalog
    .map((activity) => matchStudioActivity(activity, preferences))
    .sort((left, right) =>
      fitRank[left.fit] - fitRank[right.fit] ||
      availabilityRank[left.activity.availability] - availabilityRank[right.activity.availability])
}

export function studioAvailabilityLabel(activity: StudioActivity): string {
  if (activity.availability === 'interactive') return 'Interactive here'
  if (activity.availability === 'reviewable') return 'Review on Home'
  if (activity.availability === 'continuity') return 'Existing Somnora continuity'
  return 'Preview only'
}
