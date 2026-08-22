import { useState } from "react";
import { PhoneField } from "@shared-inputs";
import type { Phone } from "@shared-domain/core/phone";
import { useClientForm } from "../context/useClientForm";
import { StepButton } from "./StepButton";

export const ContactInfoStep = () => {
  const { data, setField, next, goToStep, options } = useClientForm();
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  // Always keep the phone object (never null while editing) so the prefix is preserved.
  const primaryPhone: Phone = data.client_primary_phone ?? {
    prefix: "+1",
    number: "",
  };
  const secondaryPhone: Phone = data.client_secondary_phone ?? {
    prefix: "+1",
    number: "",
  };

  const handleNext = () => {
    const newErrors: typeof errors = {};
    if (!data.client_email.trim()) newErrors.email = "Email is required";
    if (!primaryPhone.number.trim())
      newErrors.phone = "Primary phone number is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) next();
  };

  return (
    <div className="space-y-10 mt-5">
      <div className="space-y-4">
        {/* Email */}
        <label className="flex w-full flex-col gap-1.5">
          <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
            Email <span className="text-[var(--danger)]">*</span>
          </span>
          <div
            className={`custom-field-container${errors.email ? " is-invalid" : ""}`}
          >
            <input
              type="email"
              className="custom-input"
              value={data.client_email}
              onChange={(e) => {
                setField("client_email", e.target.value);
                if (errors.email)
                  setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="email@example.com"
            />
          </div>
          {errors.email && (
            <span className="text-[length:var(--cf-body)] text-[var(--danger)]">
              {errors.email}
            </span>
          )}
        </label>

        {/* Primary phone */}
        <label className="flex w-full flex-col gap-1.5">
          <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
            Primary Phone <span className="text-[var(--danger)]">*</span>
          </span>
          <div
            className={`custom-field-container${errors.phone ? " is-invalid" : ""}`}
          >
            <PhoneField
              phoneNumber={primaryPhone}
              onChange={(value) => {
                setField("client_primary_phone", value);
                if (errors.phone)
                  setErrors((p) => ({ ...p, phone: undefined }));
              }}
              prefixPopoverClassName="client-form-portal address-ac-dropdown border-[var(--color-border-accent)] shadow-lg"
              storageNamespace={options.storageNamespace}
            />
          </div>
          {errors.phone && (
            <span className="text-[length:var(--cf-body)] text-[var(--danger)]">
              {errors.phone}
            </span>
          )}
        </label>

        {/* Secondary phone */}
        <label className="flex w-full flex-col gap-1.5">
          <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
            Secondary Phone <span className="text-[var(--ink-faint)]">(optional)</span>
          </span>
          <div className="custom-field-container">
            <PhoneField
              phoneNumber={secondaryPhone}
              onChange={(value) => setField("client_secondary_phone", value)}
              prefixPopoverClassName="client-form-portal address-ac-dropdown border-[var(--color-border-accent)] shadow-lg"
              storageNamespace={options.storageNamespace}
            />
          </div>
        </label>
      </div>

      <div className="flex justify-between">
        <StepButton
          label="Back"
          variant="ghost"
          onClick={() => goToStep("client_info")}
        />
        <StepButton label="Next" onClick={handleNext} />
      </div>
    </div>
  );
};
