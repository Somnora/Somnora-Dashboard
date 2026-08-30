import type { Destination } from '../domain/types'
import { useWorkbench } from '../state/workbenchContext'

const destinations: Array<{ id: Destination; label: string; mark: string }> = [
  { id: 'home', label: 'Home', mark: 'H' },
  { id: 'action-desk', label: 'Action Desk', mark: 'D' },
  { id: 'consent', label: 'Consent', mark: 'P' },
  { id: 'conversations', label: 'Conversations', mark: 'C' },
  { id: 'timeline', label: 'Timeline', mark: 'L' },
  { id: 'about-me', label: 'About Me', mark: 'M' },
  { id: 'growth', label: 'Growth', mark: 'G' },
  { id: 'activities', label: 'Activity Studio', mark: 'S' },
  { id: 'connectors', label: 'Context Sources', mark: 'W' },
  { id: 'themes', label: 'Themes', mark: 'T' },
  { id: 'analytics', label: 'Analytics', mark: 'A' },
]

export function NavigationRail() {
  const { state, dispatch, connection } = useWorkbench()
  const relayProfile = connection.mode === 'relay'
  const relayPaired = connection.pairing?.status === 'paired'

  return (
    <nav className="navigation-rail" aria-label="Workbench destinations">
      <button
        aria-label="Go to Home"
        className="brand-button"
        onClick={() => dispatch({ type: 'navigate', destination: 'home' })}
        type="button"
      >
        <img alt="Somnora Logo" src="./assets/brand/somnora-logo.png" />
      </button>
      <div className="nav-destinations">
        {destinations.map((destination) => (
          <button
            aria-current={state.destination === destination.id ? 'page' : undefined}
            className="nav-button"
            key={destination.id}
            onClick={() =>
              dispatch({ type: 'navigate', destination: destination.id })
            }
            title={destination.label}
            type="button"
          >
            <span aria-hidden="true" className="nav-mark">
              {destination.mark}
            </span>
            <span className="nav-label">{destination.label}</span>
          </button>
        ))}
      </div>
      <div
        className="nav-profile"
        aria-label={relayProfile
          ? relayPaired ? 'Somnora account paired' : 'Somnora account not linked'
          : 'Demo profile Jules'}
      >
        {relayProfile ? 'S' : 'J'}
      </div>
    </nav>
  )
}
