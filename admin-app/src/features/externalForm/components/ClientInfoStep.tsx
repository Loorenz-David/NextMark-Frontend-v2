import { Field } from "@/shared/inputs/FieldContainer";
import { InputField } from "@/shared/inputs/InputField";

import { useExternalForm } from "../context";
import { StepButton } from "./StepButton";

export const ClientInfoStep = () => {
  const { form, setters, next, warnings } = useExternalForm();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Client Info</h2>
        <p className="mt-1 text-sm text-white/46">
          Enter the customer basic identity details.
        </p>
      </div>

      <Field
        label="First name:"
        required={true}
        warningController={warnings.firstNameWarning}
      >
        <InputField
          placeholder="First name"
          value={form.client_first_name}
          onChange={(event) => {
            setters.setClientFirstName(event.target.value);
          }}
          warningController={warnings.firstNameWarning}
        />
      </Field>

      <Field
        label="Last name:"
        required={true}
        warningController={warnings.lastNameWarning}
      >
        <InputField
          placeholder="Last name"
          value={form.client_last_name}
          onChange={(event) => {
            setters.setClientLastName(event.target.value);
          }}
          warningController={warnings.lastNameWarning}
        />
      </Field>

      <div className="pt-3 flex justify-end">
        <StepButton label="Next" onClick={next} />
      </div>
    </div>
  );
};
