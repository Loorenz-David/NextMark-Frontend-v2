import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useDefaultPhonePrefix } from "@shared-inputs";
import { ClientFormContext } from "./ClientForm.context";
import type {
  ClientFormData,
  ClientFormMeta,
  ClientFormStep,
} from "../domain/clientForm.types";
import type { ClientFormConfig } from "../domain/clientFormConfig.types";
import { isStepValid, validateStep } from "../domain/clientForm.validation";
import {
  CLIENT_FORM_STEPS,
  canNavigateToClientFormStep,
  getNextClientFormStep,
} from "../domain/clientForm.flow";
import type {
  ClientFormOptions,
  ClientFormPorts,
} from "../ports/clientFormPorts";

const getGeneralOrderNoteContent = (
  notes: ClientFormMeta["order_notes"],
): string => {
  if (!Array.isArray(notes)) return "";

  const general = notes.find(
    (note) => String(note?.type ?? "").toUpperCase() === "GENERAL",
  );
  return typeof general?.content === "string" ? general.content : "";
};

type Props = {
  meta: ClientFormMeta;
  /**
   * Read once, at mount. A host whose configuration can change mid-session
   * supplies `ports.refreshConfig`; one that swaps it wholesale remounts the
   * provider under a new `key`.
   */
  config: ClientFormConfig;
  ports: ClientFormPorts;
  options: ClientFormOptions;
  onSubmitted: () => void;
  children: ReactNode;
};

export const ClientFormProvider = ({
  meta,
  config: initialConfig,
  ports,
  options,
  onSubmitted,
  children,
}: Props) => {
  const defaultPrefix = useDefaultPhonePrefix(
    meta.team_timezone,
    options.storageNamespace,
  );

  const emptyData = useMemo<ClientFormData>(
    () => ({
      client_first_name: "",
      client_last_name: "",
      client_primary_phone: { prefix: defaultPrefix, number: "" },
      client_secondary_phone: { prefix: defaultPrefix, number: "" },
      client_email: "",
      client_address: null,
      order_notes: getGeneralOrderNoteContent(meta.order_notes),
      accepted_terms_version_id: null,
      marketing_messages: false,
    }),
    [defaultPrefix, meta.order_notes],
  );

  const [data, setData] = useState<ClientFormData>(emptyData);
  const [config, setConfig] = useState<ClientFormConfig>(initialConfig);
  const [currentStep, setCurrentStep] = useState<ClientFormStep>("client_info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [isRulesGateOpen, setIsRulesGateOpen] = useState(false);
  const [hasAcknowledgedRules, setHasAcknowledgedRules] = useState(false);

  const setField = <K extends keyof ClientFormData>(
    key: K,
    value: ClientFormData[K],
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // Acceptance records the exact version the customer saw, which is what the
  // backend validates against — a bare boolean could not survive a republish.
  const setTermsAccepted = useCallback(
    (accepted: boolean) => {
      setSubmitError(null);
      setTermsError(null);
      setData((prev) => ({
        ...prev,
        accepted_terms_version_id: accepted
          ? (config.terms?.version_id ?? null)
          : null,
      }));
    },
    [config.terms?.version_id],
  );

  const goToStep = useCallback(
    (step: ClientFormStep) => {
      if (!canNavigateToClientFormStep(step, data, config)) {
        return;
      }
      setCurrentStep(step);
    },
    [config, data],
  );

  const next = useCallback(() => {
    if (!isStepValid(currentStep, data, config)) {
      return;
    }

    const nextStep = getNextClientFormStep(currentStep);
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }, [config, currentStep, data]);

  /**
   * A team can publish new terms while the customer has the form open. The
   * rejection leaves the session usable, so the recovery is to re-read the
   * config, drop the old acceptance and let the customer accept again — all
   * without disturbing the answers they already typed.
   */
  const refreshConfig = useCallback(async () => {
    if (!ports.refreshConfig) return;

    try {
      const refreshed = await ports.refreshConfig();
      setConfig(refreshed);
      setData((prev) => ({ ...prev, accepted_terms_version_id: null }));
    } catch {
      // The submit-time message already explains what went wrong; a failed
      // refresh must not replace it with a less useful one.
    }
  }, [ports]);

  const submit = useCallback(
    async (payload: ClientFormData) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const result = await ports.submit(payload);

        if (result.status === "submitted") {
          onSubmitted();
          return;
        }

        // The host has already replaced the screen — an inline error here would
        // be written into something the customer never sees again.
        if (result.status === "terminated") {
          return;
        }

        setSubmitError(result.message);
        // Only terms can go stale mid-session, so a config with none has
        // nothing to re-read and the host is spared a pointless round trip.
        if (result.refreshConfig && config.terms) {
          await refreshConfig();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [config.terms, onSubmitted, ports, refreshConfig],
  );

  /**
   * `overrides` carries a value resolved in the same tick as the tap — the
   * delivery-address step geocodes a typed address and submits immediately, and
   * a `setField` call would not have landed in `data` yet.
   */
  const requestSubmit = useCallback(
    async (overrides?: Partial<ClientFormData>) => {
      const nextData = overrides ? { ...data, ...overrides } : data;
      if (overrides) {
        setData(nextData);
      }

      const lastStep = CLIENT_FORM_STEPS[CLIENT_FORM_STEPS.length - 1];
      const errors = validateStep(lastStep, nextData, config);
      if (errors.accepted_terms_version_id) {
        setTermsError(errors.accepted_terms_version_id);
        return;
      }
      // The address error is surfaced by the step itself.
      if (Object.keys(errors).length) return;

      setTermsError(null);

      // The rules are shown once, immediately before the order is committed.
      if (config.rules.length && !hasAcknowledgedRules) {
        setIsRulesGateOpen(true);
        return;
      }

      await submit(nextData);
    },
    [config, data, hasAcknowledgedRules, submit],
  );

  const acknowledgeRules = useCallback(async () => {
    setHasAcknowledgedRules(true);
    setIsRulesGateOpen(false);
    await submit(data);
  }, [data, submit]);

  const dismissRulesGate = useCallback(() => setIsRulesGateOpen(false), []);

  return (
    <ClientFormContext.Provider
      value={{
        meta,
        config,
        options,
        data,
        currentStep,
        isSubmitting,
        submitError,
        termsError,
        isRulesGateOpen,
        setField,
        setTermsAccepted,
        goToStep,
        next,
        requestSubmit,
        acknowledgeRules,
        dismissRulesGate,
      }}
    >
      {children}
    </ClientFormContext.Provider>
  );
};
