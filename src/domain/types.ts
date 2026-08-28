export type Destination =
  | 'home'
  | 'conversations'
  | 'about-me'
  | 'themes'
  | 'analytics'

export type ConversationMode = 'dream' | 'daily' | 'eureka'
export type AutonomyLevel = 'quiet' | 'balanced' | 'active'
export type StretchLevel = 'gentle' | 'open' | 'bold'
export type EnergyLevel = 'low' | 'medium' | 'high'

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

export interface InvitationDispatch {
  invitationId: string
  title: string
  prompt: string
  estimatedMinutes: number
  idempotencyKey: string
  version: 1
}

export interface InvitationAction {
  id: string
  invitationId: string
  status: DeliveryStatus
  progressCount: 0 | 1 | 2 | 3
  simulated: boolean
  expiresAt: string
}

export interface PairingSession {
  id: string
  status: 'paired'
  simulated: boolean
  expiresAt: string
}

export interface PairingStatus {
  id: string
  status: 'waiting' | 'paired' | 'expired' | 'revoked'
  simulated: boolean
}

export interface DeliveryState {
  status: DeliveryStatus
  actionId?: string
  progressCount: 0 | 1 | 2 | 3
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
  invitation: Invitation
  invitationDisposition: 'offered' | 'adjusting' | 'accepted' | 'declined'
  invitationFeedback: 'less-like-this' | null
  selectedMemoryNodeId: string | null
  focusEvidenceIds: string[]
  memoryOverlay: MemoryOverlay
  delivery: DeliveryState
  whyOpen: boolean
  adjustmentOpen: boolean
  reducedMotionOverride: boolean | null
}
