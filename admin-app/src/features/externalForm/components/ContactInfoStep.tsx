import { useMemo } from "react";

import { useDefaultPhonePrefix } from "@shared-inputs";
import { Field } from "@/shared/inputs/FieldContainer";
import { InputField } from "@/shared/inputs/InputField";
import { PhoneField } from "@/shared/inputs/PhoneField/PhoneField";
import type { Phone } from "@/types/phone";

import { useExternalForm } from "../context";
import { StepButton } from "./StepButton";

const EXTERNAL_FORM_PHONE_STORAGE_NAMESPACE = "external-form-phone";

const phoneFieldContainerClassName =
  "rounded-[1.45rem] border border-white/10  bg-white/[0.04] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

export const ContactInfoStep = () => {
  const { form, setters, next, warnings } = useExternalForm();
  const defaultPrefix = useDefaultPhonePrefix(
    null,
    EXTERNAL_FORM_PHONE_STORAGE_NAMESPACE,
  );

  const emptyPhone = useMemo<Phone>(
    () => ({
      prefix: defaultPrefix,
      number: "",
    }),
    [defaultPrefix],
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Contact Information
        </h2>
        <p className="mt-1 text-sm text-white/46">
          Add reachable phone numbers and an email.
        </p>
      </div>

      <Field
        label="Primary phone:"
        required={true}
        warning={warnings.contactWarning.warning}
      >
        <PhoneField
          phoneNumber={form.client_primary_phone ?? emptyPhone}
          containerClassName={phoneFieldContainerClassName}
          storageNamespace={EXTERNAL_FORM_PHONE_STORAGE_NAMESPACE}
          onChange={(value) => {
            setters.setPrimaryPhone(value);
          }}
        />
      </Field>

      <Field label="Secondary phone:">
        <PhoneField
          phoneNumber={form.client_secondary_phone ?? emptyPhone}
          containerClassName={phoneFieldContainerClassName}
          storageNamespace={EXTERNAL_FORM_PHONE_STORAGE_NAMESPACE}
          onChange={(value) => {
            setters.setSecondaryPhone(value);
          }}
        />
      </Field>

      <Field
        label="Email:"
        required={true}
        warningController={warnings.contactWarning}
      >
        <InputField
          type="email"
          placeholder="customer@email.com"
          value={form.client_email}
          onChange={(event) => {
            setters.setEmail(event.target.value);
          }}
          warningController={warnings.contactWarning}
        />
      </Field>

      <div className="pt-3 flex justify-end">
        <StepButton label="Next" onClick={next} />
      </div>
    </div>
  );
};
