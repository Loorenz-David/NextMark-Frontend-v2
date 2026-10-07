import { createContext } from "react";
import type {
  ClientFormData,
  ClientFormMeta,
  ClientFormStep,
} from "../domain/clientForm.types";
import type { ClientFormConfig } from "../domain/clientFormConfig.types";
import type { ClientFormOptions } from "../ports/clientFormPorts";

export type ClientFormContextValue = {
  meta: ClientFormMeta;
  /** Held separately from `meta` so a config refresh never resets typed answers. */
  config: ClientFormConfig;
  /** What this surface supports, as opposed to what the team published. */
  options: ClientFormOptions;
  data: ClientFormData;
  currentStep: ClientFormStep;
  isSubmitting: boolean;
  /** Set once the host accepted the answers; the submission screen stays up. */
  isSubmitted: boolean;
  /** The host's own message from a rejected submission. */
  submitError: string | null;
  /** Set when a submit attempt was blocked locally for missing terms acceptance. */
  termsError: string | null;
  isRulesGateOpen: boolean;
  setField: <K extends keyof ClientFormData>(
    key: K,
    value: ClientFormData[K],
  ) => void;
  setTermsAccepted: (accepted: boolean) => void;
  goToStep: (step: ClientFormStep) => void;
  next: () => void;
  /**
   * Entry point for the last step's primary button: validates, then either
   * opens the rules gate (when there are rules) or checks consent and submits.
   * `overrides` covers values resolved in the same tick as the tap.
   */
  requestSubmit: (overrides?: Partial<ClientFormData>) => Promise<void>;
  /** The rules gate's confirm stage: checks consent, then submits. */
  confirmAndSubmit: () => Promise<void>;
  dismissRulesGate: () => void;
};

export const ClientFormContext = createContext<ClientFormContextValue | null>(
  null,
);
