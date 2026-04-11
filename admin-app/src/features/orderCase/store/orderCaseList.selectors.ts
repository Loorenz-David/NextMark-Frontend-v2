import { useShallow } from "zustand/react/shallow";
import { selectOrderCaseListStats, useOrderCaseListStore } from "./orderCaseList.store";




export const useOrderCaseListStats = ()=> useOrderCaseListStore(useShallow(selectOrderCaseListStats))

