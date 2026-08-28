import { useState } from 'react'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { ThemeDetail } from './ThemeDetail'

export function ThemesView() {
  const { profile } = useWorkbench()
  const [selectedId, setSelectedId] = useState(profile.themes[0]?.id)
  const selected = profile.themes.find((theme) => theme.id === selectedId)

  if (!selected) return null

  return (
    <div className="themes-layout">
      <section className="theme-browser" aria-label="Recurring themes">
        <div className="theme-grid">
          {profile.themes.map((theme) => (
            <button
              aria-pressed={selected.id === theme.id}
              className="theme-card glass-panel"
              key={theme.id}
              onClick={() => setSelectedId(theme.id)}
              type="button"
            >
              <span>{theme.kind}</span>
              <strong>{theme.label}</strong>
              <small>{theme.count} signals · {theme.trend}</small>
            </button>
          ))}
        </div>
        <GlassPanel className="growth-story">
          <div>
            <p className="eyebrow">A change worth seeing</p>
            <h2>From trying a boundary to trusting it.</h2>
          </div>
          <div className="growth-comparison" aria-label="Growth comparison">
            <article>
              <span>Then · Aug 6</span>
              <strong>A bedtime boundary was an experiment.</strong>
            </article>
            <article>
              <span>Now · Two weeks later</span>
              <strong>The choice has held without becoming a perfection score.</strong>
            </article>
          </div>
        </GlassPanel>
      </section>
      <aside>
        <ThemeDetail theme={selected} />
      </aside>
    </div>
  )
}
