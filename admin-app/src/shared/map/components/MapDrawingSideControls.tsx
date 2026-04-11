import { EraseIcon } from "@/assets/icons";
import { type DrawingSelectionMode } from "@/shared/map/domain/constants/drawingSelectionModes";

type MapDrawingSideControlsProps = {
  selectedShape: DrawingSelectionMode;
  onShapeSelect: (mode: DrawingSelectionMode) => void;
  onClear: () => void;
  shapeOrder?: readonly DrawingSelectionMode[];
  disabled?: boolean;
  clearDisabled?: boolean;
  wrapperClassName?: string;
};

const DEFAULT_SHAPE_ORDER: readonly DrawingSelectionMode[] = [
  "circle",
  "rectangle",
  "polygon",
];

export const MapDrawingSideControls = ({
  selectedShape,
  onShapeSelect,
  onClear,
  shapeOrder = DEFAULT_SHAPE_ORDER,
  disabled = false,
  clearDisabled = false,
  wrapperClassName = "absolute -right-36 top-0 flex w-32 flex-col gap-2",
}: MapDrawingSideControlsProps) => {
  return (
    <div className={wrapperClassName}>
      <div className="flex w-full justify-end">
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection shape"
          disabled={disabled || clearDisabled}
          className="flex cursor-pointer items-center justify-center rounded-md border border-[var(--color-muted)]/40 bg-[var(--color-page)] p-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <EraseIcon className="h-3 w-3 text-[var(--color-muted)]" />
        </button>
      </div>
      {shapeOrder.map((shape) => (
        <button
          key={shape}
          type="button"
          onClick={() => onShapeSelect(shape)}
          disabled={disabled}
          className={`rounded-md border px-3 py-2 text-left text-xs font-medium capitalize transition ${
            selectedShape === shape
              ? "border-[var(--color-light-blue)] bg-[var(--color-page)] text-[var(--color-dark-blue)]"
              : "border-[var(--color-muted)]/40 bg-[var(--color-page)] text-[var(--color-muted)]"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {shape}
        </button>
      ))}
    </div>
  );
};
