import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { mapsUrl } from '../../domain/connectors'
import type { ConnectorId } from '../../domain/connectors'
import { useExternalContext } from '../../connectors/externalContext'
import { GlassPanel } from '../common/GlassPanel'

const connectorOrder: ConnectorId[] = [
  'location',
  'weather',
  'calendar',
  'events',
  'fitness',
  'nutrition',
]

function permissionLabel(permission: string): string {
  return permission.replaceAll('-', ' ')
}

function sourceModeLabel(sourceMode: string): string {
  if (sourceMode === 'local-file') return 'Local only'
  return sourceMode
}

export function ConnectorHubView() {
  const {
    state,
    normalized,
    requestLiveWeather,
    importCalendar,
    loadDemoDay,
    clearCalendar,
    restoreDemoWeather,
  } = useExternalContext()
  const [selectedId, setSelectedId] = useState<ConnectorId>('weather')
  const fileInput = useRef<HTMLInputElement>(null)
  const selected = state.connectors[selectedId]
  const activeCount = Object.values(state.connectors).filter((connector) =>
    connector.status === 'ready').length

  const handleCalendar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) await importCalendar(file)
    event.target.value = ''
  }

  return (
    <div className="connector-layout">
      <section className="connector-browser" aria-label="External context sources">
        <GlassPanel className="connector-introduction">
          <div>
            <p className="eyebrow">Permission before context</p>
            <h2>External context should earn its way in.</h2>
            <p>
              Nora receives small, normalized signals instead of a copy of your world.
              The reliable demo remains seeded unless you deliberately connect something.
            </p>
          </div>
          <dl aria-label="Connector summary">
            <div><dt>Ready</dt><dd>{activeCount} of 6</dd></div>
            <div><dt>Live network</dt><dd>{state.weather.sourceMode === 'live' ? 'Weather only' : 'None'}</dd></div>
            <div><dt>Exact data stored</dt><dd>None</dd></div>
          </dl>
        </GlassPanel>

        <div className="connector-card-grid">
          {connectorOrder.map((id) => {
            const connector = state.connectors[id]
            return (
              <button
                aria-pressed={selectedId === id}
                className="connector-card glass-panel"
                key={id}
                onClick={() => setSelectedId(id)}
                type="button"
              >
                <span className={`connector-status status-${connector.status}`}>
                  {connector.status}
                </span>
                <strong>{connector.title}</strong>
                <p>{connector.summary}</p>
                <small>{sourceModeLabel(connector.sourceMode)} · {permissionLabel(connector.permission)}</small>
              </button>
            )
          })}
        </div>

        <GlassPanel className="connector-context-output">
          <div>
            <p className="eyebrow">What Nora can use now</p>
            <h3>Normalized context, not raw source data.</h3>
          </div>
          <dl>
            <div>
              <dt>Weather</dt>
              <dd>{normalized.weatherLabel}</dd>
              <small>{normalized.weatherSource}</small>
            </div>
            <div>
              <dt>Open time</dt>
              <dd>{normalized.availableMinutes} minutes</dd>
              <small>{normalized.calendarSource}</small>
            </div>
            <div>
              <dt>Event ideas</dt>
              <dd>{normalized.eventCount} demo options</dd>
              <small>Not live listings</small>
            </div>
          </dl>
        </GlassPanel>
      </section>

      <aside className="connector-inspector" aria-label="Selected connector details">
        <GlassPanel>
          <div className="connector-inspector-topline">
            <span className={`connector-status status-${selected.status}`}>{selected.status}</span>
            <span>{sourceModeLabel(selected.sourceMode)}</span>
          </div>
          <p className="eyebrow">{permissionLabel(selected.permission)}</p>
          <h2>{selected.title}</h2>
          <p className="connector-inspector-summary">{selected.summary}</p>

          <dl className="connector-facts">
            <div><dt>Source</dt><dd>{selected.sourceLabel}</dd></div>
            <div><dt>Freshness</dt><dd>{selected.freshnessLabel}</dd></div>
            <div><dt>Permission</dt><dd>{permissionLabel(selected.permission)}</dd></div>
            <div><dt>Failure</dt><dd>{selected.failureMessage ?? 'No active failure'}</dd></div>
          </dl>

          <section className="connector-reason">
            <p className="eyebrow">Why Nora would use it</p>
            <p>{selected.reasonForUse}</p>
            <strong>{selected.dataBoundary}</strong>
          </section>

          {(selectedId === 'location' || selectedId === 'weather') && (
            <div className="connector-actions">
              <button
                className="primary-button"
                disabled={selected.status === 'loading'}
                onClick={() => void requestLiveWeather()}
                type="button"
              >
                {selected.status === 'loading' ? 'Requesting once' : 'Use location once for weather'}
              </button>
              {state.weather.sourceMode === 'live' && (
                <button className="text-button" onClick={restoreDemoWeather} type="button">
                  Return to demo weather
                </button>
              )}
              <p>
                Your browser asks first. Coordinates go to Open-Meteo for current conditions,
                then Somnora discards them instead of storing or reverse geocoding them.
              </p>
            </div>
          )}

          {selectedId === 'calendar' && (
            <div className="connector-actions">
              <button className="primary-button" onClick={() => fileInput.current?.click()} type="button">
                Import ICS locally
              </button>
              <input
                accept=".ics,text/calendar"
                aria-label="Calendar ICS file"
                className="visually-hidden"
                onChange={(event) => void handleCalendar(event)}
                ref={fileInput}
                type="file"
              />
              <button className="secondary-button" onClick={loadDemoDay} type="button">
                Load privacy-safe demo day
              </button>
              {state.calendar.sourceMode !== 'disconnected' && (
                <button className="text-button" onClick={clearCalendar} type="button">
                  Disconnect calendar summary
                </button>
              )}
              {state.calendar.sourceMode !== 'disconnected' && (
                <dl className="calendar-summary" aria-label="Local calendar availability summary">
                  <div><dt>Busy blocks</dt><dd>{state.calendar.busyBlocks}</dd></div>
                  <div><dt>Busy time</dt><dd>{state.calendar.busyMinutes} min</dd></div>
                  <div><dt>Useful gap</dt><dd>{state.calendar.availableMinutes} min</dd></div>
                </dl>
              )}
              <p>
                Event titles, attendees, locations, descriptions, and file contents are not retained.
              </p>
            </div>
          )}

          {selectedId === 'events' && (
            <div className="connector-event-list" aria-label="Seeded local event opportunities">
              {state.events.map((event) => (
                <article key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.whenLabel}</span>
                  </div>
                  <p>{event.setting} · {event.energy} energy · {event.social.replaceAll('-', ' ')}</p>
                  <small>{event.sourceLabel} · {event.freshnessLabel}</small>
                  <a href={mapsUrl(event)} rel="noreferrer" target="_blank">Open in Apple Maps</a>
                </article>
              ))}
              <p className="connector-events-boundary">
                These are fictitious privacy-safe demo listings. No event service is queried in this build.
              </p>
            </div>
          )}

          {(selectedId === 'fitness' || selectedId === 'nutrition') && (
            <div className="connector-disconnected" role="status">
              <strong>This adapter cannot be enabled.</strong>
              <p>
                The Workbench has no account, data contract, permission screen, or freshness signal for this source.
              </p>
            </div>
          )}

          <p className="connector-global-boundary">
            Connecting context never grants Nora permission to start, send, schedule, purchase, or share an action.
          </p>
        </GlassPanel>
      </aside>
    </div>
  )
}
