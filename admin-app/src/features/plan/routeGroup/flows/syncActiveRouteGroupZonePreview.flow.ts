import { useEffect } from "react";

import { useZoneVisibilityStore } from "@/features/zone";
import type { RouteGroupZonePreviewMode } from "../store/routeGroupZonePreview.store";

type UseSyncActiveRouteGroupZonePreviewFlowProps = {
  planId: number | null;
  previewMode: RouteGroupZonePreviewMode;
  hasActiveZonePreview: boolean;
  hasAnyZonePreview: boolean;
};

export const useSyncActiveRouteGroupZonePreviewFlow = ({
  planId,
  previewMode,
  hasActiveZonePreview,
  hasAnyZonePreview,
}: UseSyncActiveRouteGroupZonePreviewFlowProps) => {
  useEffect(() => {
    useZoneVisibilityStore
      .getState()
      .setVisible(previewMode === "all" ? hasAnyZonePreview : hasActiveZonePreview);
  }, [hasActiveZonePreview, hasAnyZonePreview, planId, previewMode]);
};
