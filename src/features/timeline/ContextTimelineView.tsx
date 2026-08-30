import { useMemo, useState } from 'react'
import { buildContextTimeline, contextTimelineDayKey } from '../../domain/contextTimeline'
import type { ContextDomain, ContextTimelineEvent } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'

type TimelineFilter = 'all' | ContextDomain

const filters: Array<{ id: TimelineFilter; label: string }> = [
  { id: 'all', label: 'All context' },
  { id: 'dream', label: 'Dream' },
  { id: 'daily', label: 'Daily' },
  { id: 'eureka', label: 'Eureka' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'activity', label: 'Activities' },
  { id: 'nora', label: 'Nora' },
]

const domainLabels: Record<ContextDomain, string> = {
  dream: 'Dream',
  daily: 'Daily',
  eureka: 'Eureka',
  sleep: 'Sleep',
  fitness: 'Fitness',
  nutrition: 'Nutrition',
  activity: 'Activity',
  nora: 'Nora',
}

function formatDay(occurredAt: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(new Date(occurredAt))
}

function formatTime(occurredAt: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(occurredAt))
}

function groupEvents(events: ContextTimelineEvent[], timeZone?: string) {
  return events.reduce<Array<{ date: string; events: ContextTimelineEvent[] }>>(
    (groups, event) => {
      const date = contextTimelineDayKey(event.occurredAt, timeZone)
      const current = groups.at(-1)
      if (current?.date === date) current.events.push(event)
      else groups.push({ date, events: [event] })
      return groups
    },
    [],
  )
}

function confidenceCopy(event: ContextTimelineEvent): string {
  if (event.confidence === 'confirmed') return 'Confirmed by you or directly recorded'
  if (event.confidence === 'tentative') return 'Tentative and open to correction'
  return 'Observed from available context'
}

export function ContextTimelineView() {
  const { profile, state, dispatch, connection, live } = useWorkbench()
  const relayMode = connection.mode === 'relay'
  const paired = connection.pairing?.status === 'paired'
  const events = useMemo(
    () => relayMode ? live.timelineEvents : buildContextTimeline(profile, state),
    [live.timelineEvents, profile, relayMode, state],
  )
  const [filter, setFilter] = useState<TimelineFilter>('all')
  const filteredEvents = useMemo(
    () => filter === 'all'
      ? events
      : events.filter((event) => event.domain === filter),
    [events, filter],
  )
  const [selectedId, setSelectedId] = useState(events[0]?.id ?? '')
  const visibleSelectedId = filteredEvents.some((event) => event.id === selectedId)
    ? selectedId
    : filteredEvents[0]?.id ?? ''
  const selected = events.find((event) => event.id === visibleSelectedId)
  const displayTimeZone = relayMode ? undefined : 'UTC'
  const grouped = groupEvents(filteredEvents, displayTimeZone)
  const selectedEvidence = relayMode ? [] : selected?.evidenceIds
    .map((id) => profile.evidence.find((evidence) => evidence.id === id))
    .filter((evidence) => evidence !== undefined) ?? []
  const sourceCount = new Set(events.map((event) => event.domain)).size

  const openSource = () => {
    if (!selected?.relatedDestination) return
    if (selected.relatedConversationMode) {
      dispatch({
        type: 'set-conversation-mode',
        value: selected.relatedConversationMode,
      })
    }
    if (selected.relatedThreadId) {
      void live.openThread(selected.relatedThreadId)
    }
    dispatch({ type: 'navigate', destination: selected.relatedDestination })
  }

  if (relayMode && !paired) {
    return (
      <div className="timeline-layout">
        <section className="timeline-browser" aria-label="Universal context timeline">
          <GlassPanel className="timeline-introduction">
            <div>
              <p className="eyebrow">Private account chronology</p>
              <h2>Connect your iPhone to bring your story together.</h2>
              <p>
                The Timeline stays empty until you explicitly pair this Workbench.
                It never substitutes preview entries for your account history.
              </p>
              <button
                className="primary-button"
                onClick={() => dispatch({ type: 'navigate', destination: 'conversations' })}
                type="button"
              >
                Open phone connection
              </button>
            </div>
          </GlassPanel>
        </section>
        <aside className="timeline-inspector" aria-label="Timeline privacy boundary">
          <GlassPanel>
            <p className="eyebrow">Boundary</p>
            <h2>No hidden preview data</h2>
            <p className="timeline-inspector-summary">
              Only account-owned events returned through the scoped relay appear here.
            </p>
          </GlassPanel>
        </aside>
      </div>
    )
  }

  return (
    <div className="timeline-layout">
      <section className="timeline-browser" aria-label="Universal context timeline">
        <GlassPanel className="timeline-introduction">
          <div>
            <p className="eyebrow">{relayMode ? 'Live account chronology' : 'One story, every surface'}</p>
            <h2>Your days make more sense together.</h2>
            <p>
              {relayMode
                ? 'Dream, Daily, and Eureka moments now arrive from your paired account as one inspectable chronology.'
                : "Dream, Daily, Eureka, body context, activities, and Nora's reasoning share one inspectable chronology. Nothing here is a score."}
            </p>
          </div>
          <dl aria-label="Timeline coverage">
            <div><dt>Window</dt><dd>30 days</dd></div>
            <div><dt>Sources</dt><dd>{relayMode ? `${sourceCount} live` : '6 active'}</dd></div>
            <div><dt>Boundary</dt><dd>Private</dd></div>
          </dl>
        </GlassPanel>

        <div className="timeline-filters" aria-label="Filter timeline by source">
          {filters.map((item) => (
            <button
              aria-pressed={filter === item.id}
              className="timeline-filter"
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="timeline-scroll" aria-live="polite">
          {relayMode && live.loading && events.length === 0 ? (
            <p className="live-status-copy" role="status">Loading your account timeline...</p>
          ) : null}
          {relayMode && !live.loading && events.length === 0 ? (
            <GlassPanel>
              <p className="eyebrow">No events yet</p>
              <h3>Your next synced conversation will appear here.</h3>
              <p>The Workbench checks for account changes without replacing this space with demo history.</p>
            </GlassPanel>
          ) : null}
          {grouped.map((group) => (
            <section className="timeline-day" key={group.date}>
              <header>
                <time dateTime={group.date}>{formatDay(group.events[0].occurredAt, displayTimeZone)}</time>
                <span>{group.events.length} {group.events.length === 1 ? 'moment' : 'moments'}</span>
              </header>
              <div className="timeline-day-events">
                {group.events.map((event) => (
                  <button
                    aria-pressed={visibleSelectedId === event.id}
                    className={`timeline-event domain-${event.domain}`}
                    key={event.id}
                    onClick={() => setSelectedId(event.id)}
                    type="button"
                  >
                    <span className="timeline-node" aria-hidden="true" />
                    <span className="timeline-event-copy">
                      <span className="timeline-event-meta">
                        <strong>{domainLabels[event.domain]}</strong>
                        <time dateTime={event.occurredAt}>{formatTime(event.occurredAt, displayTimeZone)}</time>
                        <span>{event.kind}</span>
                      </span>
                      <b>{event.title}</b>
                      <span>{event.summary}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <aside className="timeline-inspector" aria-label="Selected timeline context">
        {selected ? (
          <GlassPanel>
            <p className="eyebrow">Why this is here</p>
            <div className="timeline-inspector-heading">
              <span>{domainLabels[selected.domain]}</span>
              <span>{selected.actor}</span>
            </div>
            <h2>{selected.title}</h2>
            <p className="timeline-inspector-summary">{selected.summary}</p>

            <dl className="timeline-provenance">
              <div><dt>Source</dt><dd>{selected.sourceLabel}</dd></div>
              <div><dt>Confidence</dt><dd>{confidenceCopy(selected)}</dd></div>
              <div><dt>Privacy</dt><dd>{selected.privacy.replaceAll('-', ' ')}</dd></div>
            </dl>

            {selectedEvidence.length > 0 ? (
              <div className="timeline-evidence">
                <p className="eyebrow">Supporting context</p>
                {selectedEvidence.map((evidence) => (
                  <blockquote key={evidence.id}>{evidence.excerpt}</blockquote>
                ))}
              </div>
            ) : (
              <p className="timeline-no-evidence">
                This moment comes directly from its named source and does not add a hidden interpretation.
              </p>
            )}

            {selected.relatedDestination ? (
              <button className="secondary-button" onClick={openSource} type="button">
                Open source view
              </button>
            ) : null}
          </GlassPanel>
        ) : null}

        <GlassPanel className="timeline-adapters">
          {relayMode ? (
            <>
              <p className="eyebrow">Continuity</p>
              <h3>One source, every screen.</h3>
              <p>
                New iPhone, Watch, and Workbench conversation moments merge by stable ID.
                Reloading updates the chronology without duplicating them.
              </p>
              {live.timelineTruncated ? <small>Showing the newest 250 account events.</small> : null}
            </>
          ) : (
            <>
              <p className="eyebrow">Ecosystem path</p>
              <h3>One Nora, specialized inputs.</h3>
              <p>
                Fitness and Nutrition can join this same chronology later through
                permissioned adapters. They are roadmap integrations, not active demo data.
              </p>
              <div aria-label="Future context adapters">
                <span>Fitness <small>roadmap</small></span>
                <span>Nutrition <small>roadmap</small></span>
              </div>
            </>
          )}
        </GlassPanel>
      </aside>
    </div>
  )
}
