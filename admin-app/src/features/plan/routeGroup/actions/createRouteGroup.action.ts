import {
  routeGroupApi,
  type CreateRouteGroupResponse,
  type CreateRouteGroupPayload,
} from "@/features/plan/routeGroup/api/routeGroup.api";

export const createRouteGroupAction = async (
  planId: number,
  payload: CreateRouteGroupPayload,
): Promise<CreateRouteGroupResponse | null> => {
  const response = await routeGroupApi.createRouteGroup(planId, payload);
  return response.data ?? null;
};
