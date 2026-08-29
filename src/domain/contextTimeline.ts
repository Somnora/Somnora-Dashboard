import type {
  ContextTimelineEvent,
  DemoProfile,
  MemoryNode,
  WorkbenchState,
} from './types'

function evidenceDate(profile: DemoProfile, node: MemoryNode): string {
  const dates = node.evidenceIds
    .map((id) => profile.evidence.find((item) => item.id === id)?.occurredAt)
    .filter((date): date is string => Boolean(date))
    .sort()

  return dates.at(-1) ?? profile.metadata.asOfDate
}

function memoryKind(node: MemoryNode): ContextTimelineEvent['kind'] {
  if (node.category === 'growth-marker') return 'growth'
  if (node.category === 'tentative-interpretation') return 'interpretation'
  return node.category === 'nora-observation' ? 'interpretation' : 'growth'
}

function memorySource(node: MemoryNode): string {
  if (node.category === 'growth-marker') return 'Growth marker'
  if (node.category === 'tentative-interpretation') return 'Nora interpretation'
  if (node.category === 'nora-observation') return 'Nora observation'
  return 'About Me memory'
}

function buildConversationEvents(profile: DemoProfile): ContextTimelineEvent[] {
  return profile.conversations.flatMap((thread) =>
    thread.entries.map((entry) => {
      const evidenceIds = profile.evidence
        .filter((evidence) => evidence.conversationId === entry.id)
        .map((evidence) => evidence.id)

      return {
        id: `conversation-${entry.id}`,
        occurredAt: entry.occurredAt,
        domain: entry.mode,
        kind: entry.speaker === 'user' ? 'capture' : 'response',
        actor: entry.speaker,
        confidence: entry.speaker === 'user' ? 'confirmed' : 'observed',
        title: entry.speaker === 'user'
          ? `${thread.label} reflection`
          : `Nora responded in ${thread.label}`,
        summary: entry.text,
        sourceLabel: `${thread.label} conversation`,
        evidenceIds,
        tags: entry.tags,
        privacy: 'private-profile',
        relatedDestination: 'conversations',
        relatedConversationMode: entry.mode,
      } satisfies ContextTimelineEvent
    }),
  )
}

function buildStandaloneEvidenceEvents(profile: DemoProfile): ContextTimelineEvent[] {
  return profile.evidence
    .filter((evidence) => !evidence.conversationId)
    .map((evidence) => {
      const isActivity = evidence.sourceType === 'activity-check-in'
      const isGrowth = evidence.id === 'evidence-broke-late-scroll'
      return {
        id: `evidence-${evidence.id}`,
        occurredAt: evidence.occurredAt,
        domain: 'activity',
        kind: isGrowth ? 'growth' : isActivity ? 'outcome' : 'capture',
        actor: 'user',
        confidence: 'confirmed',
        title: isGrowth
          ? 'A self-directed boundary held'
          : isActivity
            ? 'Activity check-in'
            : 'User confirmed a helpful pattern',
        summary: evidence.excerpt,
        sourceLabel: isActivity ? 'Private activity check-in' : 'User confirmation',
        evidenceIds: [evidence.id],
        tags: isGrowth ? ['boundary', 'growth'] : ['user-confirmed'],
        privacy: 'private-profile',
        relatedDestination: isGrowth ? 'themes' : 'about-me',
      } satisfies ContextTimelineEvent
    })
}

function buildMemoryEvents(profile: DemoProfile): ContextTimelineEvent[] {
  return profile.memoryNodes
    .filter((node) => node.category !== 'user-fact')
    .map((node) => ({
      id: `memory-${node.id}`,
      occurredAt: evidenceDate(profile, node),
      domain: 'nora',
      kind: memoryKind(node),
      actor: node.category === 'growth-marker' ? 'user' : 'nora',
      confidence: node.confidence,
      title: node.label,
      summary: node.detail,
      sourceLabel: memorySource(node),
      evidenceIds: node.evidenceIds,
      tags: [node.category],
      privacy: 'private-profile',
      relatedDestination: 'about-me',
    }))
}

function buildSleepEvent(profile: DemoProfile): ContextTimelineEvent[] {
  const latest = profile.metrics.at(-1)
  if (!latest) return []

  return [{
    id: `sleep-${latest.date}`,
    occurredAt: `${latest.date}T08:00:00.000Z`,
    domain: 'sleep',
    kind: 'signal',
    actor: 'device',
    confidence: 'observed',
    title: 'Morning body context',
    summary: `${latest.sleepHours} hours of sleep, ${latest.restfulPercent}% restful, and ${latest.energy} self-reported energy. This is context, not a health score.`,
    sourceLabel: 'Seeded iPhone and Watch context',
    evidenceIds: [],
    tags: ['sleep', 'energy'],
    privacy: 'device-context',
    relatedDestination: 'analytics',
  }]
}

function buildSessionEvents(
  profile: DemoProfile,
  state: WorkbenchState,
): ContextTimelineEvent[] {
  const events: ContextTimelineEvent[] = []
  const invitationTime = profile.metadata.asOfDate

  events.push({
    id: `invitation-${state.invitation.id}`,
    occurredAt: invitationTime,
    domain: 'nora',
    kind: 'invitation',
    actor: 'nora',
    confidence: 'tentative',
    title: state.invitation.title,
    summary: state.invitation.reason,
    sourceLabel: 'Nora invitation engine',
    evidenceIds: state.invitation.evidenceIds,
    tags: [state.invitation.family, ...state.invitation.appliedAdjustments],
    privacy: 'session-only',
    relatedDestination: 'home',
  })

  if (state.invitationDisposition !== 'offered') {
    const accepted = state.invitationDisposition === 'accepted'
    events.push({
      id: `invitation-disposition-${state.invitation.id}`,
      occurredAt: state.delivery.updatedAt ?? invitationTime,
      domain: 'activity',
      kind: accepted ? 'outcome' : 'correction',
      actor: 'user',
      confidence: 'confirmed',
      title: accepted ? 'Invitation accepted' : 'Invitation preference recorded',
      summary: accepted
        ? 'Jules chose to try this invitation. Device delivery still requires a separate action.'
        : 'Jules declined or adjusted this invitation. Nora can use that boundary without treating it as failure.',
      sourceLabel: 'Current Workbench session',
      evidenceIds: [],
      tags: [state.invitationDisposition],
      privacy: 'session-only',
      relatedDestination: 'home',
    })
  }

  if (state.delivery.status !== 'idle') {
    events.push({
      id: `delivery-${state.delivery.actionId ?? state.invitation.id}`,
      occurredAt: state.delivery.updatedAt ?? invitationTime,
      domain: 'activity',
      kind: state.delivery.status === 'completed' ? 'outcome' : 'signal',
      actor: 'device',
      confidence: 'observed',
      title: state.delivery.status === 'completed'
        ? 'Activity completed'
        : 'Device handoff updated',
      summary: `The consented activity is ${state.delivery.status}. ${state.delivery.progressCount} of 3 private field notes are recorded.`,
      sourceLabel: state.delivery.simulated ? 'Simulated device relay' : 'Paired device relay',
      evidenceIds: [],
      tags: [state.delivery.status],
      privacy: 'device-context',
      relatedDestination: 'home',
    })
  }

  Object.values(state.memoryOverlay.corrections).forEach((correction) => {
    const node = profile.memoryNodes.find((item) => item.id === correction.nodeId)
    events.push({
      id: `correction-${correction.nodeId}`,
      occurredAt: invitationTime,
      domain: 'nora',
      kind: 'correction',
      actor: 'user',
      confidence: 'confirmed',
      title: `Memory ${correction.kind}`,
      summary: correction.note || `${node?.label ?? 'This memory'} was ${correction.kind} by Jules.`,
      sourceLabel: 'User memory control',
      evidenceIds: node?.evidenceIds ?? [],
      tags: [correction.kind],
      privacy: 'session-only',
      relatedDestination: 'about-me',
    })
  })

  return events
}

export function buildContextTimeline(
  profile: DemoProfile,
  state: WorkbenchState,
): ContextTimelineEvent[] {
  return [
    ...buildConversationEvents(profile),
    ...buildStandaloneEvidenceEvents(profile),
    ...buildMemoryEvents(profile),
    ...buildSleepEvent(profile),
    ...buildSessionEvents(profile, state),
  ].sort((left, right) =>
    new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  )
}
