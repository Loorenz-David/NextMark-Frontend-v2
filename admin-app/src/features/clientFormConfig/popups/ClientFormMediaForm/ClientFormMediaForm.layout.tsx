import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { OptionPopoverSelect } from '@/shared/inputs/OptionPopoverSelect'
import { Switch } from '@/shared/inputs/Switch'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import {
  MEDIA_PLACEMENTS,
  MEDIA_PLACEMENT_DESCRIPTIONS,
  MEDIA_PLACEMENT_LABELS,
  type MediaPlacement,
} from '../../domain/mediaPlacement'
import { useClientFormMediaForm } from './ClientFormMediaForm.context'
import { useClientFormMediaFormConfig } from './useClientFormMediaFormConfig'
import { useClientFormMediaFormSetters } from './useClientFormMediaFormSetters'

const PLACEMENT_OPTIONS = MEDIA_PLACEMENTS.map((placement) => ({
  label: MEDIA_PLACEMENT_LABELS[placement],
  value: placement,
}))

export const ClientFormMediaFormLayout = () => {
  const { payload, formState, warnings, setFormState, handleSave, handleDelete, initialFormRef } =
    useClientFormMediaForm()

  const setters = useClientFormMediaFormSetters({ setFormState, warnings })

  useClientFormMediaFormConfig({ formState, initialFormRef, payload })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: payload.mode === 'create' ? 'Add' : 'Save', action: handleSave },
      ...(payload.mode === 'edit' ? { deleteButton: { label: 'Delete', action: handleDelete } } : {}),
    }),
    [handleSave, handleDelete, payload.mode],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-2 pb-[40px] scroll-thin">
        <Field
          label="Placement:"
          required={true}
          info={MEDIA_PLACEMENT_DESCRIPTIONS[formState.placement]}
        >
          <OptionPopoverSelect<MediaPlacement>
            options={PLACEMENT_OPTIONS}
            value={formState.placement}
            allowEmpty={false}
            onChange={(value) => {
              if (value) {
                setters.handlePlacement(value)
              }
            }}
          />
        </Field>

        <Field label="Image URL:" required={true}>
          <InputField
            value={formState.url}
            onChange={(event) => setters.handleUrl(event.target.value)}
            warningController={warnings.urlWarning}
          />
        </Field>
        {warnings.urlWarning.warning.isVisible && <InputWarning {...warnings.urlWarning.warning} />}

        {formState.url.trim() ? (
          <img
            src={formState.url.trim()}
            alt={formState.alt_text}
            className="h-32 w-full rounded-[18px] border border-white/[0.08] object-cover"
          />
        ) : null}

        <Field
          label="Alt text:"
          info="Read out by screen readers and shown if the image fails to load. Not visible copy."
        >
          <InputField
            value={formState.alt_text}
            onChange={(event) => setters.handleAltText(event.target.value)}
          />
        </Field>

        <Field label="Heading:" info="Visible text rendered with the image.">
          <InputField
            value={formState.title}
            onChange={(event) => setters.handleTitle(event.target.value)}
          />
        </Field>

        <Field label="Body copy:">
          <InputField
            value={formState.description}
            onChange={(event) => setters.handleDescription(event.target.value)}
          />
        </Field>

        <Field label="Link URL:" info="Wraps the image in a link when set.">
          <InputField
            value={formState.link_url}
            onChange={(event) => setters.handleLinkUrl(event.target.value)}
          />
        </Field>

        <Field
          label="Show on the form:"
          info="Disabled images stay saved here but never reach the customer."
        >
          <Switch value={formState.enabled} onChange={setters.handleEnabled} />
        </Field>
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
