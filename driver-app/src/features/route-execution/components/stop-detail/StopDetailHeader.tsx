import { CloseIcon } from "@/assets/icons";
import type {
  StopDetailHeaderDisplay,
  StopDetailPrimaryActionDisplay,
  StopDetailTerminalStatusDisplay,
} from "../../domain/stopDetailDisplay.types";
import { StopDetailHeaderTitle } from "./StopDetailHeaderTitle";
import { StopDetailPrimaryActions } from "./StopDetailPrimaryActions";
import { StopDetailTerminalStatus } from "./StopDetailTerminalStatus";

type StopDetailHeaderProps = {
  header: StopDetailHeaderDisplay;
  headerMode: "primary-actions" | "terminal-status";
  primaryActions: StopDetailPrimaryActionDisplay[];
  terminalStatus: StopDetailTerminalStatusDisplay | null;
  onClose: () => void;
};

export function StopDetailHeader({
  header,
  headerMode,
  primaryActions,
  terminalStatus,
  onClose,
}: StopDetailHeaderProps) {
  return (
    <header className="space-y-4 px-5 pb-4 pt-2">
      <div className="flex items-start justify-between gap-3">
        <StopDetailHeaderTitle
          orderScalarLabel={header.orderScalarLabel}
          stopMeta={header.stopMeta}
          streetAddress={header.streetAddress}
        />

        <button
          aria-label="Close stop detail"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {headerMode === "terminal-status" && terminalStatus ? (
        <StopDetailTerminalStatus status={terminalStatus} />
      ) : (
        <StopDetailPrimaryActions actions={primaryActions} />
      )}
    </header>
  );
}
