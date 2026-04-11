import type { DriverStopRowNoteDisplay } from "./mapStopRowOrderNote";

export type StopDetailHeaderDisplay = {
  streetAddress: string;
  stopMeta: string;
  orderScalarLabel: string | null;
};

export type StopDetailTerminalStatusDisplay = {
  label: "Marked as completed" | "Marked as failed";
  onUndo: () => void;
};

export type StopDetailPrimaryActionDisplay = {
  id: "navigate" | "failed" | "completed";
  label: string;
  tone: "navigate" | "failed" | "completed";
  onPress?: () => void;
};

export type StopDetailInfoRowDisplay = {
  id: "service-time" | "order-phone" | "items" | "customer" | "cases";
  label: string;
  value: string;
  onPress?: () => void;
};

export type StopDetailPageDisplay = {
  header: StopDetailHeaderDisplay;
  headerMode: "primary-actions" | "terminal-status";
  primaryActions: StopDetailPrimaryActionDisplay[];
  terminalStatus: StopDetailTerminalStatusDisplay | null;
  orderNotes: DriverStopRowNoteDisplay[];
  infoRows: StopDetailInfoRowDisplay[];
};
