import {
  usePlanCalendarStore,
  type PlanContainerView,
} from "../store/planCalendar.store";

const VIEWS: { view: PlanContainerView; label: string }[] = [
  { view: "calendar", label: "Calendar" },
  { view: "list", label: "List" },
];

/**
 * Segmented control switching the center plan container between the
 * calendar and the classic plan list. Rendered in both views' headers.
 */
export const PlanContainerViewToggle = () => {
  const containerView = usePlanCalendarStore((state) => state.containerView);
  const setContainerView = usePlanCalendarStore(
    (state) => state.setContainerView,
  );

  return (
    <div className="flex items-center rounded-full bg-surface-raised p-[3px]">
      {VIEWS.map(({ view, label }) => (
        <button
          key={view}
          type="button"
          onClick={() => setContainerView(view)}
          className={`rounded-full px-3 py-1 text-[12.5px] transition-all ${
            containerView === view
              ? "bg-[var(--surface-card-muted)] font-semibold text-[var(--color-text)] shadow-sm"
              : "font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
