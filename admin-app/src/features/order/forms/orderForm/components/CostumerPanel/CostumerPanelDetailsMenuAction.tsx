import { ThreeDotMenu, type ThreeDotMenuOption } from '@/shared/buttons/ThreeDotMenu'

type CostumerPanelDetailsMenuActionProps = {
  options: ThreeDotMenuOption[]
}

export const CostumerPanelDetailsMenuAction = ({
  options,
}: CostumerPanelDetailsMenuActionProps) => {
  return (
    <div>
      <ThreeDotMenu
        dotWidth={3}
        dotHeight={3}
        dotClassName="bg-[var(--color-muted)]"
        triggerClassName="flex h-5 w-5 cursor-pointer items-center justify-center"
        options={options}
        width={190}
      />
    </div>
  )
}
