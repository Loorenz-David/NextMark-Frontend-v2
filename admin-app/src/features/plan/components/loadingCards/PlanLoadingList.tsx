import { PlanLoadingCard } from "./PlanLoadingCard";

type PlanLoadingListProps = {
  count?: number;
};

export const PlanLoadingList = ({
  count = 4,
}: PlanLoadingListProps) => {
  return (
    <div className="flex flex-col gap-4 px-5 pb-10">
      {Array.from({ length: count }, (_, index) => (
        <PlanLoadingCard key={index} />
      ))}
    </div>
  );
};
