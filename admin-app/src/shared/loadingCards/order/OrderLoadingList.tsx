import { OrderLoadingCard } from "./OrderLoadingCard";

type OrderLoadingCardVariant = "orderMain" | "routeGroup";

type OrderLoadingListProps = {
  variant?: OrderLoadingCardVariant;
  topReservedOffset?: number;
  count?: number;
};

const RouteGroupOrderLoadingList = ({
  topReservedOffset = 0,
  count,
}: Required<Pick<OrderLoadingListProps, "topReservedOffset" | "count">>) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin px-4">
        <div
          className="flex min-h-full flex-col gap-4"
          style={{
            paddingTop: topReservedOffset
              ? `${topReservedOffset}px`
              : undefined,
            transition: "padding-top 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {Array.from({ length: count }, (_, index) => (
            <OrderLoadingCard key={index} variant="routeGroup" />
          ))}
        </div>
      </div>
    </div>
  );
};

const OrderMainLoadingList = ({ count }: Required<Pick<OrderLoadingListProps, "count">>) => {
  return (
    <div className="flex flex-col gap-4 overflow-x-hidden px-2 pb-10 pt-4">
      {Array.from({ length: count }, (_, index) => (
        <OrderLoadingCard key={index} variant="orderMain" />
      ))}
    </div>
  );
};

export const OrderLoadingList = ({
  variant = "orderMain",
  topReservedOffset = 0,
  count = 3,
}: OrderLoadingListProps) => {
  return variant === "routeGroup" ? (
    <RouteGroupOrderLoadingList
      topReservedOffset={topReservedOffset}
      count={count}
    />
  ) : (
    <OrderMainLoadingList count={count} />
  );
};
