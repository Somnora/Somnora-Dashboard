import { useMemo, useState } from 'react'
import {
  buildGrowthStories,
  growthReflectionCopy,
} from '../../domain/growthStory'
import type { GrowthReflection } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'

const reflectionChoices: Array<{
  value: GrowthReflection
  label: string
}> = [
  { value: 'confirmed', label: 'This feels true' },
  { value: 'not-yet', label: 'Not yet' },
  { value: 'needs-nuance', label: 'Needs nuance' },
]

function formatDate(occurredAt?: string): string | null {
  if (!occurredAt) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(occurredAt))
}

export function GrowthView() {
  const { profile, state, dispatch } = useWorkbench()
  const stories = useMemo(
    () => buildGrowthStories(profile, state),
    [profile, state],
  )
  const [selectedId, setSelectedId] = useState(stories[0]?.id ?? '')
  const selected = stories.find((story) => story.id === selectedId) ?? stories[0]
  const evidence = selected?.evidenceIds
    .map((id) => profile.evidence.find((item) => item.id === id))
    .filter((item) => item !== undefined) ?? []

  if (!selected) return null

  const openSource = () => {
    if (selected.relatedConversationMode) {
      dispatch({
        type: 'set-conversation-mode',
        value: selected.relatedConversationMode,
      })
    }
    if (selected.relatedMemoryNodeId) {
      dispatch({
        type: 'select-memory-node',
        nodeId: selected.relatedMemoryNodeId,
      })
    }
    dispatch({ type: 'navigate', destination: selected.relatedDestination })
  }

  return (
    <div className="growth-layout">
      <section className="growth-browser" aria-label="Growth stories">
        <GlassPanel className="growth-introduction">
          <div>
            <p className="eyebrow">Growth is a story, not a score</p>
            <h2>See what changed without turning life into a contest.</h2>
            <p>
              Nora can place two moments beside each other, show her sources,
              and ask whether the comparison feels true. Quiet periods do not
              erase earlier change.
            </p>
          </div>
          <div className="growth-principles" aria-label="Growth view boundaries">
            <span>No points</span>
            <span>No streak pressure</span>
            <span>No disclosure rewards</span>
          </div>
        </GlassPanel>

        <div className="growth-story-list">
          {stories.map((story) => (
            <button
              aria-pressed={selected.id === story.id}
              className="growth-story-card glass-panel"
              key={story.id}
              onClick={() => setSelectedId(story.id)}
              type="button"
            >
              <span>{story.kind.replaceAll('-', ' ')}</span>
              <strong>{story.title}</strong>
              <small>
                {story.reflection === 'confirmed'
                  ? 'Confirmed in this session'
                  : story.reflection === 'not-yet'
                    ? 'Marked not yet'
                    : story.reflection === 'needs-nuance'
                      ? 'Open to nuance'
                      : story.confidence === 'confirmed'
                        ? 'Based on your confirmation'
                        : 'Nora observation'}
              </small>
            </button>
          ))}
        </div>

        <GlassPanel className="growth-boundary-card">
          <p className="eyebrow">A no belongs here too</p>
          <h3>Agency is not always visible as completion.</h3>
          <p>
            Declining an exercise, asking for a smaller version, or deciding
            that Nora&apos;s interpretation does not fit can all be meaningful
            choices. None creates a penalty.
          </p>
        </GlassPanel>
      </section>

      <aside className="growth-inspector" aria-label="Selected growth story">
        <GlassPanel>
          <div className="growth-inspector-meta">
            <span>{selected.provenance.replaceAll('-', ' ')}</span>
            <span>{selected.confidence}</span>
          </div>
          <h2>{selected.title}</h2>
          <p className="growth-inspector-summary">{selected.summary}</p>

          <div className="growth-moments" aria-label="Then and now comparison">
            {selected.moments.map((moment) => (
              <article key={`${selected.id}-${moment.label}`}>
                <header>
                  <span>{moment.label}</span>
                  {formatDate(moment.occurredAt) ? (
                    <time dateTime={moment.occurredAt}>
                      {formatDate(moment.occurredAt)}
                    </time>
                  ) : null}
                </header>
                <h3>{moment.title}</h3>
                <p>{moment.body}</p>
                <small>{moment.sourceLabel}</small>
              </article>
            ))}
          </div>

          {evidence.length > 0 ? (
            <div className="growth-evidence">
              <p className="eyebrow">Source words</p>
              {evidence.map((item) => (
                <blockquote key={item.id}>{item.excerpt}</blockquote>
              ))}
            </div>
          ) : (
            <p className="growth-no-evidence">
              This comparison comes from the clearly labeled seeded Action Desk history.
              It does not imply hidden journal evidence.
            </p>
          )}

          <fieldset className="growth-reflection">
            <legend>Does this belong in your story?</legend>
            <div>
              {reflectionChoices.map((choice) => (
                <button
                  aria-pressed={selected.reflection === choice.value}
                  key={choice.value}
                  onClick={() => dispatch({
                    type: 'set-growth-reflection',
                    storyId: selected.id,
                    value: choice.value,
                  })}
                  type="button"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="growth-reflection-status" aria-live="polite">
            {growthReflectionCopy(selected.reflection)}
          </p>

          <button className="secondary-button" onClick={openSource} type="button">
            Open source view
          </button>
        </GlassPanel>
      </aside>
    </div>
  )
}
