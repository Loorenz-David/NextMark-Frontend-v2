import { cn } from "@/lib/utils/cn";

import "./loadingCards.css";

type LoadingCardBaseProps = {
  className?: string;
};

export const LoadingCardBase = ({ className }: LoadingCardBaseProps) => {
  return (
    <div
      className={cn(
        "shared-loading-card rounded-full border border-border-subtle bg-surface-raised",
        className,
      )}
      aria-hidden="true"
    />
  );
};
