import { useNavigate } from "react-router-dom";

import type { StackComponentProps } from "@/shared/stack-manager/types";
import { useIsIntegrationActive } from "@/features/integrations/hooks/useIntegrationStatus";

import { SmsMessageRouter } from "./SmsMessageRouter";
import { SmsMessageProvider } from "../context/SmsMessageProvider";
import { BasicButton } from "@/shared/buttons/BasicButton";

export const SmsMessageMainPage = (_: StackComponentProps<undefined>) => {
  const hasTwilioIntegration = useIsIntegrationActive("twilio");
  const navigate = useNavigate();
  if (hasTwilioIntegration) {
    return (
      <div className="flex h-full w-full items-start px-6 py-6 text-sm text-[var(--color-muted)]">
        <div className="admin-glass-panel-strong max-h-100 flex max-w-2xl flex-col items-start gap-6 rounded-[28px] p-8 shadow-none">
          <div className="flex flex-col gap-6">
            <span className="text-lg font-semibold text-[var(--color-text)]">
              Set up SMS integration to manage SMS templates.
            </span>
            <span className="max-w-md text-sm text-[var(--color-muted)]">
              SMS integration allows you to create and manage SMS templates for
              various triggers, such as order confirmation, delivery updates,
              and more. You can customize the content and design of your SMS
              messages to provide a better experience for your customers.
            </span>
          </div>

          <BasicButton
            params={{
              variant: "primary",
              onClick: () => navigate("/settings/integrations/"),
              className: "px-4 py-2 text-md",
              ariaLabel: "Go to integrations settings",
            }}
          >
            Set up integration
          </BasicButton>
        </div>
      </div>
    );
  }

  return (
    <SmsMessageProvider>
      <SmsMessageRouter />
    </SmsMessageProvider>
  );
};
