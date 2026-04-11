import { DeliveryReadyIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons";

type RouteGroupReadyFooterProps = {
  onReadyForDelivery: () => void;
};

export const RouteGroupReadyFooter = ({
  onReadyForDelivery,
}: RouteGroupReadyFooterProps) => {
  return (
    <div className="flex mt-auto pb-25 flex-col justify-end items-end shrink-0    ">
      <BasicButton
        params={{
          variant: "primary",
          className:
            "w-full py-3.5 rounded-[1.85rem] border border-[rgba(112,222,208,0.22)] shadow-[0_16px_34px_rgba(0,0,0,0.18)]",
          style: {
            background:
              "linear-gradient(135deg, rgba(31, 175, 193, 0.96), rgba(59, 211, 205, 0.88))",
            color: "rgb(13, 31, 34)",
          },
          onClick: onReadyForDelivery,
        }}
      >
        <div className="flex items-center justify-center gap-4">
          <DeliveryReadyIcon className="h-5 w-5 text-[rgb(13,31,34)]" />
          <span className="font-medium tracking-tight">Ready for Delivery</span>
        </div>
      </BasicButton>
    </div>
  );
};
