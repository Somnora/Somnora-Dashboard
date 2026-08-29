import type { Destination } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from './GlassPanel'

const copy: Record<
  Exclude<Destination, 'home' | 'about-me' | 'action-desk' | 'consent'>,
  { label: string; title: string; body: string; detail: string }
> = {
  conversations: {
    label: 'Dream, Daily, Eureka',
    title: 'Your conversations will live here.',
    body: 'Switch among the three Somnora modes without losing your place or the larger story around each entry.',
    detail: 'Seeded thread workspace arrives in the next view milestone.',
  },
  timeline: {
    label: 'Across your ecosystem',
    title: 'Your context becomes one continuous story.',
    body: 'Conversations, body signals, activities, Nora observations, and user-confirmed growth share one private chronology.',
    detail: 'Each moment stays connected to its source and confidence boundary.',
  },
  growth: {
    label: 'Then and now',
    title: 'Change without a score.',
    body: 'Sustained boundaries, returned curiosity, and chosen experiments stay connected to their sources and your confirmation.',
    detail: 'Growth remains a user-owned story, never a rank or disclosure target.',
  },
  activities: {
    label: 'Discover, Connect, Create, Reflect, Reset',
    title: 'Actions shaped around actual capacity.',
    body: 'Time, energy, movement, social bandwidth, weather, and privacy determine which version Nora can offer.',
    detail: 'Browsing never starts an activity or grants Nora new authority.',
  },
  themes: {
    label: 'Recurring context',
    title: 'Patterns without turning you into a score.',
    body: 'People, emotions, concerns, subjects, and dream imagery stay connected to their source entries and your own associations.',
    detail: 'Seeded theme workspace arrives after the About Me graph.',
  },
  analytics: {
    label: 'Sleep and readiness context',
    title: 'Signals, organized around understanding.',
    body: 'Sleep, HRV, resting heart rate, and energy will share one calm view with dates, units, and non-clinical interpretation.',
    detail: 'Seeded charts arrive with the ecosystem views milestone.',
  },
}

export function DestinationPreview({ destination }: { destination: Exclude<Destination, 'home' | 'about-me' | 'action-desk' | 'consent'> }) {
  const item = copy[destination]

  return (
    <GlassPanel className="destination-preview">
      <p className="eyebrow">{item.label}</p>
      <h2>{item.title}</h2>
      <p>{item.body}</p>
      <span className="preview-status">{item.detail}</span>
    </GlassPanel>
  )
}

export function AboutMePreview() {
  const { state, profile, dispatch } = useWorkbench()
  const evidence = profile.evidence.filter((item) =>
    state.focusEvidenceIds.includes(item.id),
  )

  return (
    <div className="about-preview-layout">
      <GlassPanel className="destination-preview">
        <p className="eyebrow">Your context, inspectable</p>
        <h2>Nothing Nora remembers should feel mysterious.</h2>
        <p>
          The full spatial graph will distinguish what you said, what Nora
          observed, what remains tentative, and which older habits you changed.
        </p>
        {state.whyOpen ? (
          <button
            className="secondary-button"
            onClick={() => dispatch({ type: 'close-why' })}
            type="button"
          >
            Back to invitation
          </button>
        ) : null}
      </GlassPanel>
      {state.whyOpen ? (
        <GlassPanel className="why-evidence-preview">
          <p className="eyebrow">Why this invitation</p>
          <h2>Four grounded signals</h2>
          <ul>
            {evidence.map((item) => (
              <li key={item.id}>
                <time dateTime={item.occurredAt}>
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(item.occurredAt))}
                </time>
                <span>{item.excerpt}</span>
              </li>
            ))}
          </ul>
          <p className="preview-status">
            These sources explain the suggestion. They do not prove a diagnosis.
          </p>
        </GlassPanel>
      ) : null}
    </div>
  )
}
