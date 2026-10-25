import { OrderCard, useOrderActions, type Order } from "@/features/order";

type RouteGroupOrderCardProps = {
  order: Order;
  planStartDate?: string | null;
  routeGroupId?: number | null;
};

export const RouteGroupOrderCard = ({
  order,
  planStartDate,
  routeGroupId,
}: RouteGroupOrderCardProps) => {
  const { openOrderDetail } = useOrderActions();

  return (
    <OrderCard
      order={order}
      onOpen={() => {
        openOrderDetail(
          {
            mode: "edit",
            clientId: order.client_id,
            openSource: "card",
            routeGroupId: routeGroupId ?? order.route_group_id ?? null,
            planStartDate: planStartDate ?? null,
            headerBehavior: "order-main-context",
          },
          { borderLeft: "rgb(var(--color-light-blue-r),0.7)" },
        );
      }}
    />
  );
};
