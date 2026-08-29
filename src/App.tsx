import { lazy, Suspense } from 'react'
import { HomeView } from './features/home/HomeView'
import { AppShell } from './shell/AppShell'
import { WorkbenchProvider } from './state/WorkbenchProvider'
import { useWorkbench } from './state/workbenchContext'

const ConversationsView = lazy(() =>
  import('./features/conversations/ConversationsView').then((module) => ({
    default: module.ConversationsView,
  })),
)
const ActionDeskView = lazy(() =>
  import('./features/actions/ActionDeskView').then((module) => ({
    default: module.ActionDeskView,
  })),
)
const ConsentConsoleView = lazy(() =>
  import('./features/consent/ConsentConsoleView').then((module) => ({
    default: module.ConsentConsoleView,
  })),
)
const AboutMeView = lazy(() =>
  import('./features/memory/AboutMeView').then((module) => ({
    default: module.AboutMeView,
  })),
)
const ThemesView = lazy(() =>
  import('./features/themes/ThemesView').then((module) => ({
    default: module.ThemesView,
  })),
)
const GrowthView = lazy(() =>
  import('./features/growth/GrowthView').then((module) => ({
    default: module.GrowthView,
  })),
)
const AnalyticsView = lazy(() =>
  import('./features/analytics/AnalyticsView').then((module) => ({
    default: module.AnalyticsView,
  })),
)
const ContextTimelineView = lazy(() =>
  import('./features/timeline/ContextTimelineView').then((module) => ({
    default: module.ContextTimelineView,
  })),
)

function DestinationLoading() {
  return (
    <div className="destination-loading glass-panel" role="status">
      <p className="eyebrow">Opening workspace</p>
      <p>Gathering this part of Jules&apos;s privacy-safe demo profile.</p>
    </div>
  )
}

function ActiveDestination() {
  const { state } = useWorkbench()

  switch (state.destination) {
    case 'home':
      return <HomeView />
    case 'action-desk':
      return <ActionDeskView />
    case 'consent':
      return <ConsentConsoleView />
    case 'about-me':
      return <AboutMeView />
    case 'conversations':
      return <ConversationsView />
    case 'timeline':
      return <ContextTimelineView />
    case 'themes':
      return <ThemesView />
    case 'growth':
      return <GrowthView />
    case 'analytics':
      return <AnalyticsView />
  }
}

export function App() {
  return (
    <WorkbenchProvider>
      <AppShell>
        <Suspense fallback={<DestinationLoading />}>
          <ActiveDestination />
        </Suspense>
      </AppShell>
    </WorkbenchProvider>
  )
}
