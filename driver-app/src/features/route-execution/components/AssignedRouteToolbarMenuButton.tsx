import { MenuButton } from '@/app/shell/components/MenuButton'

type AssignedRouteToolbarMenuButtonProps = {
  isOpen: boolean
  onClick: () => void
}

export function AssignedRouteToolbarMenuButton({
  isOpen,
  onClick,
}: AssignedRouteToolbarMenuButtonProps) {
  return (
    <div className="shrink-0 pr-3 pl-3">
      <MenuButton isOpen={isOpen} onClick={onClick} mode='onPage' />
    </div>
  )
}
