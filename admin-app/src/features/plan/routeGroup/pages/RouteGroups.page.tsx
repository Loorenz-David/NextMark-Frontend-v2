import { BasicButton } from "@/shared/buttons/BasicButton";
import {
  RouteGroupRail,
  RouteGroupsPageHeader,
  type RouteGroupRailItem,
} from "../components";
import type { RouteGroupHeaderSummary } from "../domain/buildRouteGroupHeaderSummary";
import { useRouteGroupsPageShellController } from "../controllers/useRouteGroupsPageShell.controller";
import { RouteGroupPageProvider } from "../providers/RouteGroupPageProvider";
import { RouteGroupsPageContent } from "./RouteGroupsPageContent.page";

type PlanOrdersPagePayload = {
  planId?: number;
  freshAfter?: string | null;
};

type RouteGroupsPageProps = {
  payload: PlanOrdersPagePayload;
  onRequestClose?: () => void;
};

type RouteGroupsPageLayoutProps = {
  headerSummary: RouteGroupHeaderSummary;
  onRequestClose?: () => void;
  routeGroups: RouteGroupRailItem[];
  onRouteGroupClick: (item: RouteGroupRailItem) => void;
  onCreateRouteGroup: () => void;
  showOptimizeRow: boolean;
  hasActiveRouteGroup: boolean;
};

export const RouteGroupsPageLayout = ({
  headerSummary,
  onRequestClose,
  routeGroups,
  onRouteGroupClick,
  onCreateRouteGroup,
  showOptimizeRow,
  hasActiveRouteGroup,
}: RouteGroupsPageLayoutProps) => {
  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-[var(--color-primary)]/5 md:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <RouteGroupsPageHeader
          summary={headerSummary}
          onRequestClose={onRequestClose}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
          <div className="min-h-0 min-w-0 border-b border-white/8 md:h-full md:border-b-0 md:border-r md:border-white/8">
            <RouteGroupRail
              items={routeGroups}
              onClick={onRouteGroupClick}
              onCreate={onCreateRouteGroup}
            />
          </div>
          <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden">
            <RouteGroupsPageContent
              showOptimizeRow={showOptimizeRow}
              hasActiveRouteGroup={hasActiveRouteGroup}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const RouteGroupsPage = ({
  payload,
  onRequestClose,
}: RouteGroupsPageProps) => {
  const planId = payload?.planId ?? null;

  if (planId == null) return null;

  return (
    <RouteGroupPageProvider
      planId={planId}
      freshAfter={payload?.freshAfter ?? null}
    >
      <RouteGroupsPageScreen planId={planId} onRequestClose={onRequestClose} />
    </RouteGroupPageProvider>
  );
};

type RouteGroupsPageScreenProps = {
  planId: number;
  onRequestClose?: () => void;
};

const RouteGroupsPageScreen = ({
  planId,
  onRequestClose,
}: RouteGroupsPageScreenProps) => {
  const {
    railItems,
    handleRouteGroupClick,
    handleCreateRouteGroup,
    headerSummary,
    hasRouteGroups,
    hasActiveRouteGroup,
    showOptimizeRow,
  } = useRouteGroupsPageShellController(planId);

  if (!hasRouteGroups) {
    return (
      <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-[var(--color-primary)]/5">
        <RouteGroupsPageHeader
          summary={headerSummary}
          onRequestClose={onRequestClose}
        />
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="max-w-lg rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-white">
              No Route Groups Yet
            </h3>
            <p className="mt-2 text-sm text-white/70">
              This plan has no route groups yet. Create one now by selecting a
              zone or leaving it as a no-zone group.
            </p>
            <div className="mt-4 flex justify-center">
              <BasicButton
                params={{
                  variant: "primary",
                  className: "px-4 py-2",
                  onClick: handleCreateRouteGroup,
                }}
              >
                Create Route Group
              </BasicButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RouteGroupsPageLayout
      headerSummary={headerSummary}
      onRequestClose={onRequestClose}
      routeGroups={railItems}
      onRouteGroupClick={handleRouteGroupClick}
      onCreateRouteGroup={handleCreateRouteGroup}
      showOptimizeRow={showOptimizeRow}
      hasActiveRouteGroup={hasActiveRouteGroup}
    />
  );
};
