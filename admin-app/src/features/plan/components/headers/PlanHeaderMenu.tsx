import { CalendarIcon, ListIcon, PlusIcon } from "@/assets/icons";
import { ThreeDotMenu, type ThreeDotMenuOption } from "@/shared/buttons/ThreeDotMenu";

import { usePlanCalendarStore } from "../../calendar/store/planCalendar.store";

type PlanHeaderMenuProps = {
  onCreatePlan: () => void;
  /** Offer the calendar/list container switch (desktop/iPad plan column only). */
  showViewSwitch?: boolean;
};

/** Three-dot menu for the plan list and calendar headers. */
export const PlanHeaderMenu = ({
  onCreatePlan,
  showViewSwitch = false,
}: PlanHeaderMenuProps) => {
  const containerView = usePlanCalendarStore((state) => state.containerView);
  const setContainerView = usePlanCalendarStore(
    (state) => state.setContainerView,
  );

  const options: ThreeDotMenuOption[] = [
    {
      label: "Create plan",
      action: onCreatePlan,
      icon: <PlusIcon className="h-4 w-4 stroke-[var(--color-muted)]" />,
    },
  ];

  if (showViewSwitch) {
    options.push(
      containerView === "calendar"
        ? {
            label: "Show as list",
            action: () => setContainerView("list"),
            icon: <ListIcon className="h-4 w-4 text-[var(--color-muted)]" />,
          }
        : {
            label: "Show as calendar",
            action: () => setContainerView("calendar"),
            icon: <CalendarIcon className="h-4 w-4 text-[var(--color-muted)]" />,
          },
    );
  }

  return (
    <ThreeDotMenu
      dotWidth={3}
      dotHeight={3}
      dotClassName="bg-[var(--color-muted)]"
      triggerClassName="touch-hit-area h-11 w-11 shrink-0 cursor-pointer rounded-full transition-colors hover:bg-surface-hover"
      options={options}
    />
  );
};
