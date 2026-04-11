import { useState } from "react";

import { ZoneSelector } from "@/features/zone";

import { CreateRouteGroupFormFooter } from "./components/CreateRouteGroupFormFooter";
import { useCreateRouteGroupForm } from "./CreateRouteGroupForm.context";
import { Field } from "@/shared/inputs/FieldContainer";
import { InputField } from "@/shared/inputs/InputField";
import { fieldContainer, fieldInput } from "@/constants/classes";

export const CreateRouteGroupFormLayout = () => {
  const { formErrors, formSetters, formState, shouldShowErrors } =
    useCreateRouteGroupForm();
  const [previewSelectedZoneIds, setPreviewSelectedZoneIds] = useState<
    Array<number | string>
  >([]);

  return (
    <>
      <form className="flex min-h-0 flex-1  flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-ligth-bg)] px-4 pb-[88px] pt-4">
        <div className=" flex flex-col gap-4 py-8 space-y-3 rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] p-4 shadow-sm">
          <Field
            label="Route group name:"
            required={true}
            warning={
              shouldShowErrors && formErrors.name
                ? { isVisible: true, message: formErrors.name }
                : undefined
            }
            warningPlacement="besidesLabel"
          >
            <InputField
              value={formState.name}
              onChange={(event) => formSetters.setName(event.target.value)}
              fieldClassName={fieldContainer}
              inputClassName={fieldInput}
              placeholder="No-zone route group name"
            />
          </Field>

          <Field label="Zone">
            <ZoneSelector
              selectedZoneIds={previewSelectedZoneIds}
              mode="single"
              onSelectionChange={setPreviewSelectedZoneIds}
            />
          </Field>
        </div>
      </form>
      <CreateRouteGroupFormFooter />
    </>
  );
};
