import { useState, useMemo, type ReactNode } from "react";
import { useDefaultPhonePrefix } from "@shared-inputs";
import { ClientFormContext } from "./ClientForm.context";
import type {
  ClientFormData,
  ClientFormMeta,
  ClientFormStep,
} from "../domain/clientForm.types";
import { isStepValid } from "../domain/clientForm.validation";
import { submitClientForm } from "../../../api/clientForm.api";
import { CLIENT_FORM_STORAGE_NAMESPACE } from "../constants/storage";

const getGeneralOrderNoteContent = (
  notes: ClientFormMeta["order_notes"],
): string => {
  if (!Array.isArray(notes)) return "";

  const general = notes.find(
    (note) => String(note?.type ?? "").toUpperCase() === "GENERAL",
  );
  return typeof general?.content === "string" ? general.content : "";
};

const STEPS: ClientFormStep[] = [
  "client_info",
  "contact_info",
  "delivery_address",
];

type Props = {
  token: string;
  meta: ClientFormMeta;
  onSubmitted: () => void;
  children: ReactNode;
};

export const ClientFormProvider = ({
  token,
  meta,
  onSubmitted,
  children,
}: Props) => {
  const defaultPrefix = useDefaultPhonePrefix(
    meta.team_timezone,
    CLIENT_FORM_STORAGE_NAMESPACE,
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
    }),
    [defaultPrefix, meta.order_notes],
  );

  const [data, setData] = useState<ClientFormData>(emptyData);
  const [currentStep, setCurrentStep] = useState<ClientFormStep>("client_info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof ClientFormData>(
    key: K,
    value: ClientFormData[K],
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const goToStep = (step: ClientFormStep) => setCurrentStep(step);

  const next = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1 && isStepValid(currentStep, data)) {
      setCurrentStep(STEPS[idx + 1]);
    }
  };

  const submit = async () => {
    if (!isStepValid("delivery_address", data)) return;
    setIsSubmitting(true);
    try {
      await submitClientForm(token, data);
      onSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClientFormContext.Provider
      value={{
        meta,
        data,
        currentStep,
        isSubmitting,
        setField,
        goToStep,
        next,
        submit,
      }}
    >
      {children}
    </ClientFormContext.Provider>
  );
};
