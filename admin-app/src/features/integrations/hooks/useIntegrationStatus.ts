import { useMemo } from "react";

import type {
  IntegrationDefinitionWithStatus,
  IntegrationKey,
} from "../types/integration";
import { useIntegrationsFlow } from "./useIntegrationsFlow";

export const useIsIntegrationActive = (key: IntegrationKey): boolean => {
  const { integrations } = useIntegrationsFlow();

  return useMemo(() => {
    const integration = integrations.find((item) => item.key === key);
    return Boolean(integration?.id);
  }, [integrations, key]);
};

export const useIntegrationByKey = (
  key: IntegrationKey,
): IntegrationDefinitionWithStatus | null => {
  const { integrations } = useIntegrationsFlow();

  return useMemo(
    () => integrations.find((item) => item.key === key) ?? null,
    [integrations, key],
  );
};
