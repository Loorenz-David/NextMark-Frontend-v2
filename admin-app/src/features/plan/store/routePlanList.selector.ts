import { useShallow } from "zustand/react/shallow";
import { selectRoutePlanListStats, useRoutePlanListStore } from "./routePlanList.store";



export const useRoutePlanListStats = () => useRoutePlanListStore(useShallow(selectRoutePlanListStats))
