import type { ReactNode } from "react";

import type { Item } from "../../types";

export type ItemsOrderPreviewLayoutProps = {
  header?: ReactNode;
  resolvedLoading: boolean;
  resolvedItems: Item[];
  showPrintAction: boolean;
  disablePrintAction: boolean;
  isPrintActionLoading: boolean;
  printProgress: number;
  onPrintLabels: () => void;
  controlled: boolean;
  expandedItemClientId: string | null;
  onToggleExpand: (clientId: string) => void;
  onEditItem?: (item: Item) => void;
  orderId?: number;
  onOpenEditItem: (orderId: number, clientId: string) => void;
  onAddItem: () => void;
  totalItems: number;
  totalWeight: number;
  totalVolume: number;
  testNodes: ReactNode[];
};
