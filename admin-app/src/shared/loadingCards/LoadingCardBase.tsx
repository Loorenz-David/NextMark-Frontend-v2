import { cn } from "@/lib/utils/cn";

import "./loadingCards.css";

type LoadingCardBaseProps = {
  className?: string;
};

export const LoadingCardBase = ({ className }: LoadingCardBaseProps) => {
  return (
    <div
      className={cn(
        "shared-loading-card rounded-full border border-white/8 bg-white/[0.05]",
        className,
      )}
      aria-hidden="true"
    />
  );
};
