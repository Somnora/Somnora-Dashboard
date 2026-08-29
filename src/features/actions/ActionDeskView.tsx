import { useMemo, useState } from 'react'
import {
  actionDeskRouteSummary,
  buildActionDeskRecords,
} from '../../domain/actionDesk'
import type {
  ActionDeskConsentState,
  ActionDeskRecord,
  ActionDeskStage,
} from '../../domain/actionDesk'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'

type ActionDeskFilter = 'all' | 'needs-you' | 'active' | 'closed' | 'signals'

const filters: Array<{ id: ActionDeskFilter; label: string }> = [
  { id: 'all', label: 'All records' },
  { id: 'needs-you', label: 'Needs you' },
  { id: 'active', label: 'Active' },
  { id: 'closed', label: 'Closed' },
  { id: 'signals', label: 'Noticed' },
]

const stageLabels: Record<ActionDeskStage, string> = {
  noticed: 'Noticed',
  proposed: 'Proposed',
  approved: 'Approved',
  active: 'Active',
  completed: 'Completed',
  failed: 'Failed',
  declined: 'Declined',
  stopped: 'Stopped',
}

const consentLabels: Record<ActionDeskConsentState, string> = {
  'not-requested': 'Not requested',
  'awaiting-user': 'Waiting for you',
  approved: 'Explicitly approved',
  declined: 'Declined',
}

function formatActionDate(occurredAt: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(occurredAt))
}

function matchesFilter(record: ActionDeskRecord, filter: ActionDeskFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'needs-you') return record.stage === 'proposed' || record.stage === 'approved'
  if (filter === 'active') return record.stage === 'active'
  if (filter === 'signals') return record.stage === 'noticed'
  return ['completed', 'failed', 'declined', 'stopped'].includes(record.stage)
}

function progressLabel(record: ActionDeskRecord): string {
  if (!record.progress) return 'No progress contract prepared'
  return `${record.progress.completed} of ${record.progress.target} ${record.progress.unit}`
}

export function ActionDeskView() {
  const { profile, state, dispatch } = useWorkbench()
  const records = useMemo(
    () => buildActionDeskRecords(profile, state),
    [profile, state],
  )
  const [filter, setFilter] = useState<ActionDeskFilter>('all')
  const filteredRecords = records.filter((record) => matchesFilter(record, filter))
  const [selectedId, setSelectedId] = useState(records[0]?.id ?? '')
  const visibleSelectedId = filteredRecords.some((record) => record.id === selectedId)
    ? selectedId
    : filteredRecords[0]?.id ?? ''
  const selected = records.find((record) => record.id === visibleSelectedId)
  const needsYou = records.filter((record) => matchesFilter(record, 'needs-you')).length
  const active = records.filter((record) => record.stage === 'active').length
  const closed = records.filter((record) => matchesFilter(record, 'closed')).length

  const inspectEvidence = () => {
    if (!selected?.current || selected.evidenceIds.length === 0) return
    dispatch({ type: 'open-why' })
  }

  return (
    <div className="action-desk-layout">
      <section className="action-desk-browser" aria-label="Nora Action Desk">
        <GlassPanel className="action-desk-introduction">
          <div>
            <p className="eyebrow">Agency stays visible</p>
            <h2>Every action has a boundary.</h2>
            <p>
              Nora can notice and suggest. You decide what is approved. Devices only
              report what they can confirm.
            </p>
          </div>
          <dl aria-label="Action Desk summary">
            <div><dt>Needs you</dt><dd>{needsYou}</dd></div>
            <div><dt>Active</dt><dd>{active}</dd></div>
            <div><dt>Closed</dt><dd>{closed}</dd></div>
          </dl>
        </GlassPanel>

        <div className="action-authority-path" aria-label="Action authority path">
          <article>
            <span>1</span>
            <div><strong>Notice</strong><small>Nora observes bounded context.</small></div>
          </article>
          <article>
            <span>2</span>
            <div><strong>Suggest</strong><small>Nora explains one optional action.</small></div>
          </article>
          <article>
            <span>3</span>
            <div><strong>Authorize</strong><small>Only you approve or decline.</small></div>
          </article>
        </div>

        <div className="action-desk-filters" aria-label="Filter Action Desk records">
          {filters.map((item) => (
            <button
              aria-pressed={filter === item.id}
              className="action-desk-filter"
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="action-record-list" aria-live="polite">
          {filteredRecords.length > 0 ? filteredRecords.map((record) => (
            <button
              aria-pressed={visibleSelectedId === record.id}
              className={`action-record stage-${record.stage}`}
              key={record.id}
              onClick={() => setSelectedId(record.id)}
              type="button"
            >
              <span className="action-record-status">
                <span>{stageLabels[record.stage]}</span>
                <time dateTime={record.occurredAt}>{formatActionDate(record.occurredAt)}</time>
              </span>
              <strong>{record.title}</strong>
              <span>{record.summary}</span>
              <small>
                {record.provenance === 'current-session' ? 'Current session' : 'Seeded history'}
                {' · '}{consentLabels[record.consentState]}
              </small>
            </button>
          )) : (
            <GlassPanel className="action-desk-empty">
              <p className="eyebrow">Nothing here</p>
              <h3>No action currently matches this view.</h3>
              <p>An empty state is allowed. Nora does not manufacture urgency.</p>
            </GlassPanel>
          )}
        </div>
      </section>

      <aside className="action-desk-inspector" aria-label="Selected action record">
        {selected ? (
          <GlassPanel>
            <p className="eyebrow">Inspect action boundary</p>
            <div className="action-inspector-badges">
              <span className={`stage-badge stage-${selected.stage}`}>
                {stageLabels[selected.stage]}
              </span>
              <span>{selected.provenance === 'current-session' ? 'Current' : 'Seeded'}</span>
            </div>
            <h2>{selected.title}</h2>
            <p className="action-inspector-summary">{selected.summary}</p>

            <dl className="action-boundary-details">
              <div><dt>Authority</dt><dd>{selected.authoritySummary}</dd></div>
              <div><dt>Consent</dt><dd>{consentLabels[selected.consentState]}</dd></div>
              <div><dt>Route</dt><dd>{actionDeskRouteSummary(selected)}</dd></div>
              <div><dt>Progress</dt><dd>{progressLabel(selected)}</dd></div>
              <div><dt>Source</dt><dd>{selected.sourceLabel}</dd></div>
              <div><dt>Memory</dt><dd>{selected.memorySummary}</dd></div>
            </dl>

            <div className="action-privacy-boundary">
              <p className="eyebrow">Privacy boundary</p>
              <p>{selected.privacySummary}</p>
            </div>

            {selected.current && selected.evidenceIds.length > 0 ? (
              <button className="secondary-button" onClick={inspectEvidence} type="button">
                Inspect supporting context
              </button>
            ) : null}
            {selected.current && selected.actionType ? (
              <button
                className="text-button action-home-link"
                onClick={() => dispatch({ type: 'navigate', destination: 'home' })}
                type="button"
              >
                Review on Home
              </button>
            ) : null}
          </GlassPanel>
        ) : (
          <GlassPanel className="action-desk-empty-inspector">
            <p className="eyebrow">No selected record</p>
            <p>Choose another filter or return to all records.</p>
          </GlassPanel>
        )}

        <GlassPanel className="action-desk-principle">
          <p className="eyebrow">What this desk cannot do</p>
          <h3>History is not hidden authority.</h3>
          <p>
            This workspace can inspect and route you back to a decision. It does not
            start, send, schedule, message, or save an outcome to memory.
          </p>
        </GlassPanel>
      </aside>
    </div>
  )
}
