import { routeGroupApi } from "../api/routeGroup.api";

export const loadPlanRouteGroupVehicleIds = async (
  planId: number,
  signal?: AbortSignal,
): Promise<Array<number | null>> => {
  const response = await routeGroupApi.listRouteGroups(planId, signal);

  return (response.data?.route_groups ?? []).map((routeGroup) => {
    const vehicleId = routeGroup.active_route_solution?.vehicle_id;
    return typeof vehicleId === "number" && Number.isFinite(vehicleId)
      ? vehicleId
      : null;
  });
};
