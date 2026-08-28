import type { ThemeSignal } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'

export function ThemeDetail({ theme }: { theme: ThemeSignal }) {
  const { profile } = useWorkbench()
  const evidence = profile.evidence.filter((item) =>
    theme.evidenceIds.includes(item.id),
  )

  return (
    <GlassPanel className="theme-detail">
      <p className="eyebrow">{theme.kind}</p>
      <h2>{theme.label}</h2>
      <div className="theme-statline">
        <strong>{theme.count} appearances</strong>
        <span>{theme.trend}</span>
      </div>
      <p>{theme.note}</p>
      <div className="theme-evidence">
        {evidence.map((item) => (
          <blockquote key={item.id}>{item.excerpt}</blockquote>
        ))}
      </div>
      {theme.kind === 'imagery' ? (
        <p className="interpretation-boundary">
          This is a recurring image, not a universal dream symbol. Nora asks what it means to you.
        </p>
      ) : null}
    </GlassPanel>
  )
}
