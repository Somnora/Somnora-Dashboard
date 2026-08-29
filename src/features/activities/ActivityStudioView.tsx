import { useMemo, useState } from 'react'
import {
  activityVariantFits,
  createStudioPreferences,
  matchActivityCatalog,
  studioAvailabilityLabel,
  studioFamilies,
} from '../../domain/activityStudio'
import type {
  ActivityVariant,
  StudioActivity,
  StudioPreferences,
} from '../../domain/activityStudio'
import type { EnergyLevel, InvitationFamily } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { BurnExercise } from '../reflect/BurnExercise'
import { SixLineStory } from './SixLineStory'

type FamilyFilter = 'all' | InvitationFamily
type FitFilter = 'fits-now' | 'all'

function privacyLabel(privacy: ActivityVariant['privacy']): string {
  if (privacy === 'ephemeral') return 'Clears when closed'
  if (privacy === 'private-capture') return 'Private capture'
  return 'Shared only by you'
}

function provenanceCopy(activity: StudioActivity): string {
  if (activity.provenance === 'new-workbench') return 'New Workbench activity'
  if (activity.provenance === 'existing-somnora') return 'Pre-existing Somnora continuity'
  return 'Concept preview'
}

export function ActivityStudioView() {
  const { profile, dispatch } = useWorkbench()
  const initialPreferences = useMemo(() => createStudioPreferences(profile), [profile])
  const [preferences, setPreferences] = useState<StudioPreferences>(initialPreferences)
  const [family, setFamily] = useState<FamilyFilter>('all')
  const [fitFilter, setFitFilter] = useState<FitFilter>('fits-now')
  const [selectedId, setSelectedId] = useState('six-line-story')
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [burnOpen, setBurnOpen] = useState(false)
  const [storyOpen, setStoryOpen] = useState(false)

  const matches = useMemo(
    () => matchActivityCatalog(preferences),
    [preferences],
  )
  const visibleMatches = matches.filter((match) =>
    (family === 'all' || match.activity.family === family) &&
    (fitFilter === 'all' || match.fit !== 'held'))
  const selectedMatch = visibleMatches.find((match) => match.activity.id === selectedId)
    ?? visibleMatches[0]
    ?? matches[0]
  const requestedVariant = selectedMatch.activity.variants.find((variant) =>
    variant.id === selectedVariants[selectedMatch.activity.id])
  const selectedVariant = requestedVariant && activityVariantFits(requestedVariant, preferences)
    ? requestedVariant
    : selectedMatch.variant

  const updatePreferences = <Key extends keyof StudioPreferences>(
    key: Key,
    value: StudioPreferences[Key],
  ) => setPreferences((current) => ({ ...current, [key]: value }))

  const startSelected = () => {
    if (selectedMatch.activity.action === 'home-invitation') {
      dispatch({ type: 'navigate', destination: 'home' })
    } else if (selectedMatch.activity.action === 'burn-exercise') {
      setBurnOpen(true)
    } else if (selectedMatch.activity.action === 'six-line-story') {
      setStoryOpen(true)
    }
  }

  const actionable = selectedMatch.fit !== 'held' &&
    ['interactive', 'reviewable'].includes(selectedMatch.activity.availability)

  return (
    <div className="studio-layout">
      <section className="studio-browser" aria-label="Activity Studio catalog">
        <GlassPanel className="studio-introduction">
          <div>
            <p className="eyebrow">Invitation design, still your call</p>
            <h2>Find an action that fits the person you are today.</h2>
            <p>
              Nora can adapt time, energy, movement, social contact, weather,
              and privacy before asking you to begin. Browsing never starts an activity.
            </p>
          </div>
          <dl aria-label="Current seeded context">
            <div><dt>Weather</dt><dd>{preferences.weather}</dd></div>
            <div><dt>Available</dt><dd>{preferences.maxMinutes} min</dd></div>
            <div><dt>Privacy</dt><dd>{preferences.privacy.replaceAll('-', ' ')}</dd></div>
          </dl>
        </GlassPanel>

        <GlassPanel className="studio-fit-controls">
          <div className="studio-control-heading">
            <div>
              <p className="eyebrow">Shape what fits</p>
              <strong>These controls filter ideas. They do not change consent.</strong>
            </div>
            <button
              className="text-button"
              onClick={() => setPreferences(initialPreferences)}
              type="button"
            >
              Use current context
            </button>
          </div>
          <div className="studio-control-grid">
            <label>
              Time
              <select
                onChange={(event) => updatePreferences('maxMinutes', Number(event.target.value) as StudioPreferences['maxMinutes'])}
                value={preferences.maxMinutes}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </label>
            <label>
              Energy
              <select
                onChange={(event) => updatePreferences('energy', event.target.value as EnergyLevel)}
                value={preferences.energy}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Movement
              <select
                onChange={(event) => updatePreferences('movement', event.target.value as StudioPreferences['movement'])}
                value={preferences.movement}
              >
                <option value="stationary">Stay in place</option>
                <option value="short-walk">Short walk</option>
                <option value="open">Open</option>
              </select>
            </label>
            <label>
              Social
              <select
                onChange={(event) => updatePreferences('socialBandwidth', event.target.value as StudioPreferences['socialBandwidth'])}
                value={preferences.socialBandwidth}
              >
                <option value="low">Private</option>
                <option value="medium">Optional contact</option>
                <option value="high">Open to contact</option>
              </select>
            </label>
            <label>
              Privacy
              <select
                onChange={(event) => updatePreferences('privacy', event.target.value as StudioPreferences['privacy'])}
                value={preferences.privacy}
              >
                <option value="private-only">Private only</option>
                <option value="sharing-optional">Sharing optional</option>
              </select>
            </label>
          </div>
        </GlassPanel>

        <div className="studio-catalog-controls">
          <div aria-label="Filter activities by family">
            <button aria-pressed={family === 'all'} onClick={() => setFamily('all')} type="button">All</button>
            {studioFamilies.map((item) => (
              <button
                aria-pressed={family === item.id}
                key={item.id}
                onClick={() => setFamily(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div aria-label="Filter activities by fit">
            <button aria-pressed={fitFilter === 'fits-now'} onClick={() => setFitFilter('fits-now')} type="button">Fits now</button>
            <button aria-pressed={fitFilter === 'all'} onClick={() => setFitFilter('all')} type="button">Show held</button>
          </div>
        </div>

        <div className="studio-card-grid" aria-live="polite">
          {visibleMatches.length === 0 ? (
            <div className="studio-empty-state">
              <strong>Nothing in this family fits every boundary yet.</strong>
              <p>Show held ideas to inspect them, or change one of the fit controls.</p>
              <button className="text-button" onClick={() => setFitFilter('all')} type="button">
                Show held ideas
              </button>
            </div>
          ) : visibleMatches.map((match) => (
            <button
              aria-pressed={selectedMatch.activity.id === match.activity.id}
              className="studio-activity-card glass-panel"
              key={match.activity.id}
              onClick={() => setSelectedId(match.activity.id)}
              type="button"
            >
              <span>{match.activity.family}</span>
              <strong>{match.activity.title}</strong>
              <p>{match.variant.label} · {match.variant.minutes} min</p>
              <small className={`studio-fit fit-${match.fit}`}>
                {match.fit === 'fits' ? 'Fits current context' : match.fit === 'adjusted' ? 'Alternative fits' : 'Held for now'}
              </small>
            </button>
          ))}
        </div>
      </section>

      <aside className="studio-inspector" aria-label="Selected activity">
        <GlassPanel>
          <div className="studio-inspector-meta">
            <span>{studioAvailabilityLabel(selectedMatch.activity)}</span>
            <span>{provenanceCopy(selectedMatch.activity)}</span>
          </div>
          <p className="eyebrow">{selectedMatch.activity.family}</p>
          <h2>{selectedMatch.activity.title}</h2>
          <p className="studio-summary">{selectedMatch.activity.summary}</p>

          <div className="studio-selected-version">
            <span>{selectedMatch.fit === 'held' ? 'Closest version' : 'Selected version'}</span>
            <h3>{selectedVariant.label}</h3>
            <p>{selectedVariant.prompt}</p>
            <dl>
              <div><dt>Time</dt><dd>{selectedVariant.minutes} min</dd></div>
              <div><dt>Energy</dt><dd>{selectedVariant.energy}</dd></div>
              <div><dt>Movement</dt><dd>{selectedVariant.movement.replaceAll('-', ' ')}</dd></div>
              <div><dt>Social</dt><dd>{selectedVariant.social.replaceAll('-', ' ')}</dd></div>
              <div><dt>Setting</dt><dd>{selectedVariant.setting}</dd></div>
              <div><dt>Privacy</dt><dd>{privacyLabel(selectedVariant.privacy)}</dd></div>
            </dl>
          </div>

          <fieldset className="studio-versions">
            <legend>Alternate versions</legend>
            {selectedMatch.activity.variants.map((variant) => {
              const fits = activityVariantFits(variant, preferences)
              return (
                <button
                  aria-pressed={selectedVariant.id === variant.id}
                  disabled={!fits}
                  key={variant.id}
                  onClick={() => setSelectedVariants((current) => ({
                    ...current,
                    [selectedMatch.activity.id]: variant.id,
                  }))}
                  type="button"
                >
                  <strong>{variant.label}</strong>
                  <span>{variant.minutes} min · {fits ? 'fits' : 'outside current fit'}</span>
                </button>
              )
            })}
          </fieldset>

          {actionable ? (
            <button className="primary-button studio-start" onClick={startSelected} type="button">
              {selectedMatch.activity.availability === 'reviewable'
                ? 'Review invitation on Home'
                : selectedMatch.activity.action === 'burn-exercise'
                  ? 'Begin private release'
                  : 'Begin Six Line Story'}
            </button>
          ) : (
            <div className="studio-unavailable" role="status">
              <strong>
                {selectedMatch.fit === 'held'
                  ? 'No version fits every current boundary.'
                  : selectedMatch.activity.availability === 'continuity'
                    ? 'Continue in the existing Somnora app.'
                    : 'This concept is not interactive yet.'}
              </strong>
              <p>
                {selectedMatch.fit === 'held'
                  ? 'Adjust the fit controls to find a version Nora could safely offer.'
                  : selectedMatch.activity.availability === 'continuity'
                    ? 'The Workbench demo does not claim a live launch bridge for this pre-existing exercise.'
                    : 'There is no start control, action dispatch, or false availability claim.'}
              </p>
            </div>
          )}
          <p className="studio-consent-boundary">
            Every start remains a separate user action. Nora cannot message, schedule, share, or contact someone from this Studio.
          </p>
        </GlassPanel>
      </aside>

      <BurnExercise onClose={() => setBurnOpen(false)} open={burnOpen} />
      <SixLineStory
        onClose={() => setStoryOpen(false)}
        open={storyOpen}
        prompt={selectedVariant.prompt}
        variantLabel={selectedVariant.label}
      />
    </div>
  )
}
