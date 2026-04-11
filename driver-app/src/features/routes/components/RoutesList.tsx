import { RoutesListProvider } from '../providers'
import { RoutesListContent } from './RoutesListContent'

type RoutesListProps = {
  onSelectRoute?: (routeClientId: string) => void
}

export function RoutesList({ onSelectRoute }: RoutesListProps) {
  return (
    <RoutesListProvider onSelectRoute={onSelectRoute}>
      <RoutesListContent />
    </RoutesListProvider>
  )
}
