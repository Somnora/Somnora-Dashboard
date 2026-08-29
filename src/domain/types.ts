export type Destination =
  | 'home'
  | 'action-desk'
  | 'consent'
  | 'conversations'
  | 'timeline'
  | 'about-me'
  | 'growth'
  | 'activities'
  | 'connectors'
  | 'themes'
  | 'analytics'

export type ConversationMode = 'dream' | 'daily' | 'eureka'
export type AutonomyLevel = 'quiet' | 'balanced' | 'active'
export type StretchLevel = 'gentle' | 'open' | 'bold'
export type EnergyLevel = 'low' | 'medium' | 'high'

export type GrowthReflection = 'confirmed' | 'not-yet' | 'needs-nuance'

export type ConsentDomain =
  | 'dream'
  | 'daily'
  | 'eureka'
  | 'sleep'
  | 'activity'
  | 'fitness'
  | 'nutrition'

export type ConsentCapability = 'off' | 'observe' | 'suggest' | 'prepare'
export type ConsentPolicies = Record<ConsentDomain, ConsentCapability>

export type ContextDomain =
  | 'dream'
  | 'daily'
  | 'eureka'
  | 'sleep'
  | 'fitness'
  | 'nutrition'
  | 'activity'
  | 'nora'

export type ContextEventKind =
  | 'capture'
  | 'response'
  | 'signal'
  | 'interpretation'
  | 'invitation'
  | 'outcome'
  | 'growth'
  | 'correction'

export interface ContextTimelineEvent {
  id: string
  occurredAt: string
  domain: ContextDomain
  kind: ContextEventKind
  actor: 'user' | 'nora' | 'device' | 'system'
  confidence: 'confirmed' | 'observed' | 'tentative'
  title: string
  summary: string
  sourceLabel: string
  evidenceIds: string[]
  tags: string[]
  privacy: 'private-profile' | 'device-context' | 'session-only'
  relatedDestination?: Destination
  relatedConversationMode?: ConversationMode
}

export type MemoryCategory =
  | 'user-fact'
  | 'nora-observation'
  | 'tentative-interpretation'
  | 'growth-marker'

export type InvitationFamily =
  | 'discover'
  | 'connect'
  | 'create'
  | 'reflect'
  | 'reset'

export type InvitationAdjustment =
  | 'indoor'
  | 'shorter'
  | 'lower-energy'
  | 'no-social'
  | 'alternate-activity'

export type DeliveryStatus =
  | 'idle'
  | 'pending'
  | 'delivered-phone'
  | 'delivered-watch'
  | 'acknowledged'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'

export type NoraActionStatus = Exclude<DeliveryStatus, 'idle'>

export type NoraActionType =
  | 'three-beautiful-things'
  | 'breathing-reset'
  | 'six-line-story'
  | 'tiny-detour'

export type NoraActionRoute =
  | 'workbench-only'
  | 'iphone'
  | 'watch-via-iphone'

export type NoraActionInput =
  | {
      type: 'three-beautiful-things'
      targetCount: 3
      captureMode: 'photo-or-text'
      setting: 'outdoor-or-indoor'
    }
  | {
      type: 'breathing-reset'
      durationSeconds: 60 | 120 | 180
      guidanceSurface: 'workbench' | 'iphone' | 'watch'
    }
  | {
      type: 'six-line-story'
      lineCount: 6
      promptStyle: 'constraint'
    }
  | {
      type: 'tiny-detour'
      maximumMinutes: 5 | 10 | 15
      locationMode: 'location-neutral' | 'nearby-with-permission'
    }

export interface NoraActionConsentReceipt {
  id: string
  actionType: NoraActionType
  invitationId: string
  decision: 'approved'
  scope: 'single-action'
  approvedAt: string
  surface: 'workbench'
}

export interface NoraActionProgressContract {
  kind: 'count' | 'duration' | 'completion'
  target: number
  unit: string
}

export interface NoraActionDispatch {
  runtimeVersion: 1
  actionType: NoraActionType
  invitationId: string
  title: string
  prompt: string
  input: NoraActionInput
  route: NoraActionRoute
  progress: NoraActionProgressContract
  consent: NoraActionConsentReceipt
  idempotencyKey: string
  createdAt: string
  expiresAt: string
}

export interface NoraActionOutcome {
  kind: 'completed' | 'failed' | 'cancelled' | 'expired'
  recordedAt: string
  summary: string
  memoryDisposition: 'awaiting-user-choice' | 'not-eligible'
}

export interface NoraActionSnapshot {
  id: string
  invitationId: string
  actionType: NoraActionType
  status: NoraActionStatus
  progress: NoraActionProgressContract & { completed: number }
  route: NoraActionRoute
  simulated: boolean
  expiresAt: string
  updatedAt: string
  outcome?: NoraActionOutcome
}

export interface DemoMetadata {
  isDemo: true
  asOfDate: string
  windowStart: string
  windowEnd: string
  disclosure: string
}

export interface ConversationEntry {
  id: string
  mode: ConversationMode
  occurredAt: string
  speaker: 'user' | 'nora'
  text: string
  tags: string[]
}

export interface ConversationThread {
  mode: ConversationMode
  label: string
  entries: ConversationEntry[]
}

export interface MemoryEvidence {
  id: string
  sourceType: 'journal-entry' | 'activity-check-in' | 'user-confirmation'
  occurredAt: string
  excerpt: string
  conversationId?: string
}

export interface MemoryNode {
  id: string
  label: string
  detail: string
  category: MemoryCategory
  confidence: 'confirmed' | 'observed' | 'tentative'
  evidenceIds: string[]
  position: { x: number; y: number }
}

export interface MemoryEdge {
  id: string
  source: string
  target: string
  label: string
  evidenceIds: string[]
}

export interface MetricPoint {
  date: string
  sleepHours: number
  restfulPercent: number
  restingHeartRate: number
  hrvMilliseconds: number
  energy: EnergyLevel
}

export interface ThemeSignal {
  id: string
  kind: 'person' | 'emotion' | 'subject' | 'concern' | 'imagery'
  label: string
  count: number
  trend: 'rising' | 'steady' | 'softening'
  note: string
  evidenceIds: string[]
}

export interface DemoContext {
  weather: 'clear' | 'rain' | 'hot'
  availableMinutes: number
  socialBandwidth: 'low' | 'medium' | 'high'
  mobility: 'standard' | 'limited'
  energy: EnergyLevel
}

export interface InvitationAlternative {
  adjustment: InvitationAdjustment
  label: string
  description: string
}

export interface Invitation {
  id: string
  family: InvitationFamily
  title: string
  observation: string
  prompt: string
  reason: string
  estimatedMinutes: number
  energy: EnergyLevel
  privacy: string
  evidenceIds: string[]
  alternatives: InvitationAlternative[]
  appliedAdjustments: InvitationAdjustment[]
  requiresAcceptance: true
}

export interface PairingSession {
  id: string
  status: 'waiting' | 'paired'
  simulated: boolean
  expiresAt: string
  code?: string
}

export interface PairingStatus {
  id: string
  status: 'waiting' | 'paired' | 'expired' | 'revoked'
  simulated: boolean
}

export interface DeliveryState {
  status: DeliveryStatus
  actionId?: string
  actionType?: NoraActionType
  route?: NoraActionRoute
  progressCount: number
  progressTarget: number
  progressUnit: string
  expiresAt?: string
  outcome?: NoraActionOutcome
  errorMessage?: string
  updatedAt?: string
  simulated: boolean
}

export interface MemoryCorrection {
  nodeId: string
  kind: 'confirmed' | 'corrected' | 'forgotten'
  note?: string
}

export interface MemoryOverlay {
  corrections: Record<string, MemoryCorrection>
}

export interface DemoProfile {
  id: string
  displayName: string
  summary: string
  metadata: DemoMetadata
  context: DemoContext
  conversations: ConversationThread[]
  memoryNodes: MemoryNode[]
  memoryEdges: MemoryEdge[]
  evidence: MemoryEvidence[]
  metrics: MetricPoint[]
  themes: ThemeSignal[]
  fieldNoteImages: string[]
}

export interface WorkbenchState {
  destination: Destination
  conversationMode: ConversationMode
  autonomy: AutonomyLevel
  stretch: StretchLevel
  consentPolicies: ConsentPolicies
  invitation: Invitation
  invitationDisposition: 'offered' | 'adjusting' | 'accepted' | 'declined'
  invitationFeedback: 'less-like-this' | null
  selectedMemoryNodeId: string | null
  focusEvidenceIds: string[]
  memoryOverlay: MemoryOverlay
  growthReflections: Record<string, GrowthReflection>
  delivery: DeliveryState
  whyOpen: boolean
  adjustmentOpen: boolean
  reducedMotionOverride: boolean | null
}
