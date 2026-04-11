import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatMetric } from "@shared-utils";
import { StateCard } from "@/shared/layout/StateCard";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";
import type { DeliveryPlan } from "../../types/plan";
import {
  DimensionsIcon,
  ItemIcon,
  LayersIcon,
  OrderIcon,
  WeightIcon,
} from "@/assets/icons";
import { useRoutePlanStateByServerId } from "../../store/useRoutePlanState.selector";
import { planIconTypeMap } from "../../utils/planIconTypeMap";
import { PlusIcon } from "@/assets/icons/index";
import { coerceUtcFromOffset } from "@/shared/data-validation/timeValidation";
import { usePlanHeaderAction } from "../../actions/usePlanActions";
import type { PlanDropFeedback } from "@/shared/resource-manager/ResourceManagerContext";

type PropsPlanCard = {
  plan: DeliveryPlan;
  isOver?: boolean;
  dropFeedback?: PlanDropFeedback | null;
};

export const PlanCard = ({ plan, isOver, dropFeedback }: PropsPlanCard) => {
  const { openPlanSection } = usePlanHeaderAction();

  const PlanTypeIcon = planIconTypeMap.local_delivery;
  const startDate = formatPlanDate(plan.start_date);
  const endDate = formatPlanDate(plan.end_date);
  const orderCount = plan.total_orders ?? 0;
  const itemCount = plan.total_items ?? 0;
  const totalVolume = plan.total_volume ?? 0;
  const totalWeight = plan.total_weight ?? 0;
  const routeGroupCount = plan.route_groups_count ?? 0;
  const itemTypeCountEntries = useMemo(
    () =>
      Object.entries(plan.item_type_counts ?? {})
        .filter(([itemType, count]) => itemType.trim().length > 0 && count > 0)
        .sort((leftEntry, rightEntry) => {
          const [leftType, leftCount] = leftEntry;
          const [rightType, rightCount] = rightEntry;
          if (rightCount !== leftCount) return rightCount - leftCount;
          return leftType.localeCompare(rightType);
        }),
    [plan.item_type_counts],
  );
  const hasItemTypeCounts = itemTypeCountEntries.length > 0;
  const [itemTypePopoverOpen, setItemTypePopoverOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const itemTypePopoverDelayTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const clearItemTypePopoverDelay = () => {
    if (itemTypePopoverDelayTimeoutRef.current == null) return;
    clearTimeout(itemTypePopoverDelayTimeoutRef.current);
    itemTypePopoverDelayTimeoutRef.current = null;
  };

  const handleItemCountMouseEnter = () => {
    if (isTouchDevice) return;
    if (!hasItemTypeCounts) return;
    clearItemTypePopoverDelay();
    itemTypePopoverDelayTimeoutRef.current = setTimeout(() => {
      setItemTypePopoverOpen(true);
      itemTypePopoverDelayTimeoutRef.current = null;
    }, 200);
  };

  const handleItemCountMouseLeave = () => {
    if (isTouchDevice) return;
    clearItemTypePopoverDelay();
    setItemTypePopoverOpen(false);
  };

  const handleItemCountClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!hasItemTypeCounts) return;
    if (!isTouchDevice) return;
    setItemTypePopoverOpen((current) => !current);
  };

  useEffect(
    () => () => {
      if (itemTypePopoverDelayTimeoutRef.current == null) return;
      clearTimeout(itemTypePopoverDelayTimeoutRef.current);
      itemTypePopoverDelayTimeoutRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const syncDeviceType = () => {
      setIsTouchDevice(mediaQuery.matches);
    };

    syncDeviceType();
    mediaQuery.addEventListener("change", syncDeviceType);

    return () => {
      mediaQuery.removeEventListener("change", syncDeviceType);
    };
  }, []);

  const DeliveryPlanState = useRoutePlanStateByServerId(plan.state_id ?? 1);

  return (
    <motion.div
      className="flex flex-col gap-6 rounded-2xl border border-[var(--color-border)] p-4 shadow-sm cursor-pointer"
      onClick={(e) => {
        if (e.defaultPrevented) return;
        openPlanSection(plan);
      }}
    >
      <div className="flex items-start justify-between gap-3 ">
        <div className="flex items-start gap-3">
          <AnimatePresence>
            {isOver ? (
              <RoundAvatar
                Icon={
                  <PlusIcon className="h-5 w-5" style={{ color: "#008321" }} />
                }
                bgColor={"#00c531"}
                isOver={isOver}
              />
            ) : (
              <RoundAvatar
                Icon={
                  <PlanTypeIcon
                    className={`h-5 w-5 `}
                    style={{ color: "rgb(94, 94, 94)" }}
                  />
                }
                bgColor={"#7a7a7a"}
                isOver={isOver}
              />
            )}
          </AnimatePresence>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[var(--color-text)]">
                {plan.label}
              </span>
              <AnimatePresence mode="popLayout">
                {dropFeedback ? (
                  <motion.span
                    key={dropFeedback.token}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 6, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium  ${
                      dropFeedback.status === "error"
                        ? "border-[#B42318]/35 bg-[#B42318]/10 text-[#B42318]"
                        : "border-[#0B8A3D]/35 bg-[#0B8A3D]/10 text-[#0B8A3D]"
                    }`}
                  >
                    <span className="text-nowrap">
                      {dropFeedback.status === "error"
                        ? "Move failed"
                        : `${dropFeedback.movedCount} moved`}
                    </span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
            <span className="text-xs text-[var(--color-muted)]">
              {startDate} - {endDate}
            </span>
          </div>
        </div>
        {DeliveryPlanState && (
          <StateCard
            label={DeliveryPlanState.name}
            color={
              DeliveryPlanState.color ? DeliveryPlanState.color : "#2f2f2fff"
            }
          />
        )}
      </div>
      <div className="flex  flex-col gap-2 text-xs text-[var(--color-muted)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px]">
            <LayersIcon className="h-3 w-3 app-icon" />
            <span>
              {routeGroupCount} {routeGroupCount === 1 ? "zone" : "zones"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <OrderIcon className="h-3 w-3 app-icon" />
            <span>{orderCount} Orders</span>
          </div>
          <div
            className="text-[12px]"
            onMouseEnter={handleItemCountMouseEnter}
            onMouseLeave={handleItemCountMouseLeave}
            onClick={handleItemCountClick}
          >
            <FloatingPopover
              open={itemTypePopoverOpen}
              onOpenChange={setItemTypePopoverOpen}
              classes="relative"
              offSetNum={8}
              renderInPortal={true}
              matchReferenceWidth={false}
              floatingClassName="z-[120]"
              reference={
                <div
                  className={`flex items-center gap-2 rounded-full  px-2 py-1 ${
                    hasItemTypeCounts
                      ? "cursor-pointer transition-all duration-200 hover:border-[rgb(var(--color-light-blue-r),0.45)] hover:shadow-[0_0_0_1px_rgba(113,205,233,0.2),0_0_16px_rgba(72,180,194,0.18)]"
                      : ""
                  }`}
                >
                  <ItemIcon className="h-3 w-3 app-icon" />
                  <span>{itemCount}</span>
                </div>
              }
            >
              <div className="admin-glass-popover min-w-[11rem] rounded-lg border border-white/14 bg-[rgba(9,16,26,0.92)] px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.36)] backdrop-blur-md">
                <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]/90">
                  Item Types
                </div>
                <div className="space-y-1">
                  {itemTypeCountEntries.map(([itemType, count]) => (
                    <div
                      key={itemType}
                      className="grid grid-cols-[1fr_auto] items-center gap-4 text-xs"
                    >
                      <span className="truncate text-[var(--color-text)]/92">
                        {itemType}
                      </span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FloatingPopover>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <WeightIcon className="h-2 w-2 app-icon" />
            <span>{formatMetric(totalWeight, "kg")} </span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <DimensionsIcon className="h-3 w-3 app-icon" />
            <span>{formatMetric(totalVolume, "㎥")} </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

type PropsRoundAvatar = {
  Icon: ReactNode;
  bgColor?: string | null;
  isOver?: boolean;
};

const avatarVariants = {
  idle: {
    scale: 1,
    boxShadow: "0px 0px 0px rgba(0,0,0,0)",
  },
  over: {
    scale: 1.12,
    boxShadow: "0px 0px 0px 6px rgba(0,197,49,0.20)",
  },
};

export const RoundAvatar = ({ Icon, bgColor, isOver }: PropsRoundAvatar) => {
  let variant = isOver ? "over" : "idle";

  return (
    <motion.div
      variants={avatarVariants}
      animate={variant}
      transition={{
        type: "tween",
        duration: 0.3,
        ease: "easeOut",
      }}
      className="flex h-10 w-10 items-center justify-center rounded-full border-[0.5px]"
      style={
        bgColor
          ? {
              backgroundColor: `${bgColor}1A`,
              borderColor: `${bgColor}E6`,
            }
          : {
              backgroundColor: "rgba(116, 116, 116, 0.1)",
              borderColor: "#747474ff",
            }
      }
    >
      <motion.div
        animate={{ scale: isOver ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {Icon}
      </motion.div>
    </motion.div>
  );
};

const formatPlanDate = (value?: string | null) => {
  if (!value) return "TBD";
  const date = coerceUtcFromOffset(value);
  if (!date || Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
