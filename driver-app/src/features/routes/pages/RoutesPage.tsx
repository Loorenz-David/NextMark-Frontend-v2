import { RoutesList } from '../components'

export function RoutesPage() {
  return (
    <section className="driver-page space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Routes</p>
        <h1 className="text-xl font-semibold text-slate-900">Assigned routes</h1>
      </header>

      <RoutesList />
    </section>
  )
}
