import { buildActionDeskRecords } from './actionDesk'
import { remainingEvidenceIds } from './memoryOverlay'
import type {
  ConversationMode,
  DemoProfile,
  Destination,
  GrowthReflection,
  WorkbenchState,
} from './types'

export type GrowthStoryKind =
  | 'sustained-boundary'
  | 'returned-curiosity'
  | 'chosen-experiment'

export interface GrowthStoryMoment {
  label: string
  title: string
  body: string
  occurredAt?: string
  evidenceIds: string[]
  sourceLabel: string
}

export interface GrowthStory {
  id: string
  kind: GrowthStoryKind
  title: string
  summary: string
  confidence: 'confirmed' | 'observed'
  provenance: 'seeded-profile' | 'current-session'
  moments: [GrowthStoryMoment, GrowthStoryMoment]
  evidenceIds: string[]
  relatedDestination: Destination
  relatedConversationMode?: ConversationMode
  relatedMemoryNodeId?: string
  reflection?: GrowthReflection
}

function withReflection(
  story: Omit<GrowthStory, 'reflection'>,
  state: WorkbenchState,
): GrowthStory {
  return {
    ...story,
    reflection: state.growthReflections[story.id],
  }
}

export function buildGrowthStories(
  profile: DemoProfile,
  state: WorkbenchState,
): GrowthStory[] {
  const availableEvidence = new Set(remainingEvidenceIds(
    profile.evidence.map((evidence) => evidence.id),
    profile.memoryNodes,
    state.memoryOverlay,
  ))
  const stories: GrowthStory[] = []

  if (availableEvidence.has('evidence-broke-late-scroll')) {
    stories.push(withReflection({
      id: 'growth-boundary-held',
      kind: 'sustained-boundary',
      title: 'A boundary became a choice you could trust.',
      summary: 'The change matters because you named it and sustained it. Nora does not infer perfection from it.',
      confidence: 'confirmed',
      provenance: 'seeded-profile',
      moments: [
        {
          label: 'Before the change',
          title: 'Bedtime was a place where you wanted a clearer boundary.',
          body: 'The profile does not reconstruct every earlier night. It begins with the change you later chose to confirm.',
          sourceLabel: 'Seeded About Me context',
          evidenceIds: [],
        },
        {
          label: 'User-confirmed change',
          title: 'The phone stayed outside the bed routine.',
          body: 'You confirmed that the boundary had held for two weeks. A later quiet day would not erase that change.',
          occurredAt: '2026-08-06T08:10:00.000Z',
          sourceLabel: 'User confirmation',
          evidenceIds: ['evidence-broke-late-scroll'],
        },
      ],
      evidenceIds: ['evidence-broke-late-scroll'],
      relatedDestination: 'about-me',
      relatedMemoryNodeId: 'growth-bedtime-boundary',
    }, state))
  }

  const curiosityEvidence = ['evidence-park-colors', 'evidence-long-way-home']
    .filter((id) => availableEvidence.has(id))
  if (curiosityEvidence.length === 2) {
    stories.push(withReflection({
      id: 'growth-curiosity-returned',
      kind: 'returned-curiosity',
      title: 'Curiosity returned in more than one form.',
      summary: 'Two low-pressure changes of scene preceded a return of visual attention and then an idea. This is a pattern to inspect, not proof of cause.',
      confidence: 'observed',
      provenance: 'seeded-profile',
      moments: [
        {
          label: 'August 16',
          title: 'Color came back into view.',
          body: 'A short park walk helped you notice colors again.',
          occurredAt: '2026-08-16T20:04:00.000Z',
          sourceLabel: 'Private activity check-in',
          evidenceIds: ['evidence-park-colors'],
        },
        {
          label: 'August 23',
          title: 'An idea loosened on the long way home.',
          body: 'You recorded that the answer clicked while your surroundings changed.',
          occurredAt: '2026-08-23T18:12:00.000Z',
          sourceLabel: 'Eureka conversation',
          evidenceIds: ['evidence-long-way-home'],
        },
      ],
      evidenceIds: curiosityEvidence,
      relatedDestination: 'conversations',
      relatedConversationMode: 'eureka',
    }, state))
  }

  const actionRecords = buildActionDeskRecords(profile, state)
  const declined = actionRecords.find((record) => record.id === 'history-six-line-story-declined')
  const completed = actionRecords.find((record) => record.id === 'history-breathing-reset')
  if (declined && completed) {
    stories.push(withReflection({
      id: 'growth-choice-stayed-visible',
      kind: 'chosen-experiment',
      title: 'Choice stayed part of the progress.',
      summary: 'A declined writing exercise and a completed breathing reset can both show agency. Somnora does not reward disclosure or punish a no.',
      confidence: 'observed',
      provenance: 'seeded-profile',
      moments: [
        {
          label: 'August 22',
          title: 'You said not now to writing.',
          body: 'No explanation was required, and the exercise never opened.',
          occurredAt: declined.occurredAt,
          sourceLabel: declined.sourceLabel,
          evidenceIds: [],
        },
        {
          label: 'August 25',
          title: 'You chose a two minute reset.',
          body: 'The bounded breathing activity reached its prepared duration without attaching a private reflection.',
          occurredAt: completed.occurredAt,
          sourceLabel: completed.sourceLabel,
          evidenceIds: [],
        },
      ],
      evidenceIds: [],
      relatedDestination: 'action-desk',
    }, state))
  }

  return stories
}

export function growthReflectionCopy(reflection?: GrowthReflection): string {
  if (reflection === 'confirmed') {
    return 'You marked this as true for this session. Saving it as durable memory would still require a separate choice.'
  }
  if (reflection === 'not-yet') {
    return 'You marked this as not true yet. Nora will not present it as your growth.'
  }
  if (reflection === 'needs-nuance') {
    return 'You marked this as incomplete. It stays open to your correction instead of becoming a fixed conclusion.'
  }
  return 'Nora is offering a comparison. You decide whether it belongs in your story.'
}
