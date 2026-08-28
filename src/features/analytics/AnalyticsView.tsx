import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { ReadinessChart } from './ReadinessChart'
import { SleepChart } from './SleepChart'

export function AnalyticsView() {
  const { profile } = useWorkbench()
  const latest = profile.metrics.at(-1)

  if (!latest) return null

  return (
    <div className="analytics-layout">
      <section className="analytics-main" aria-label="Seeded biometric charts">
        <div className="readiness-summary">
          <div>
            <p className="eyebrow">Today, in context</p>
            <h2>Enough room for a gentle stretch.</h2>
            <p>
              Medium energy, seven hours of sleep, and an open twenty-minute window support a modest invitation. This is context, not a health score.
            </p>
          </div>
          <dl>
            <div><dt>Sleep</dt><dd>{latest.sleepHours} h</dd></div>
            <div><dt>Restful</dt><dd>{latest.restfulPercent}%</dd></div>
            <div><dt>Resting HR</dt><dd>{latest.restingHeartRate} bpm</dd></div>
            <div><dt>HRV</dt><dd>{latest.hrvMilliseconds} ms</dd></div>
          </dl>
        </div>
        <div className="chart-grid">
          <GlassPanel className="chart-card">
            <header><div><p className="eyebrow">Seven days</p><h3>Sleep duration</h3></div><span>hours</span></header>
            <SleepChart data={profile.metrics} />
          </GlassPanel>
          <GlassPanel className="chart-card">
            <header><div><p className="eyebrow">Seven days</p><h3>HRV context</h3></div><span>milliseconds</span></header>
            <ReadinessChart data={profile.metrics} />
          </GlassPanel>
        </div>
      </section>
      <aside className="analytics-aside">
        <GlassPanel>
          <p className="eyebrow">Nora's read</p>
          <blockquote>
            Your body context does not ask for a push. It leaves room for curiosity if the invitation stays small.
          </blockquote>
        </GlassPanel>
        <GlassPanel>
          <p className="eyebrow">Data boundary</p>
          <p>
            Seeded biometric values demonstrate organization only. No HealthKit or live account data is loaded in the Workbench.
          </p>
        </GlassPanel>
      </aside>
    </div>
  )
}
