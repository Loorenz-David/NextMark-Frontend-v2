import {
  ClientFormFrame,
  ClientFormItemsList,
  ClientFormScheduledDate,
  ClientFormSteps,
  getClientFormOrderTitle,
  useClientForm,
} from "@client-form-kit";
import { PublicPageShell } from "../../../app/layout/PublicPageShell";

export const ClientFormContent = () => {
  const { meta, config } = useClientForm();

  return (
    <PublicPageShell>
      {/* Width and the media around the column belong to the frame — the page
          only says where the form sits on the page. */}
      <main className="relative z-10">
        <ClientFormFrame config={config}>
          {/* On a phone the masthead is only the delivery date — the rest
              costs a screen of scrolling before the first field. A gap rather
              than space-y, so the hidden lines leave no margin behind. */}
          <header className="flex flex-col gap-3 pb-2 text-center">
            <p className="hidden text-[length:var(--cf-eyebrow)] font-semibold uppercase tracking-[0.34em] text-[var(--ink-faint)] sm:block">
              Leveransuppgifter
            </p>
            <h1 className="hidden text-[length:var(--cf-title)] font-normal leading-tight tracking-[0.01em] text-[var(--ink)] sm:block">
              {getClientFormOrderTitle(meta) ?? "Leveransuppgifter"}
            </h1>
            {/* Double rule — the printed-form convention for a masthead. */}
            <div aria-hidden="true" className="mx-auto hidden w-24 space-y-[3px] pt-1 sm:block">
              <div className="h-px bg-[var(--rule-strong)]" />
              <div className="h-px bg-[var(--rule)]" />
            </div>
            <ClientFormScheduledDate meta={meta} />
            <p className="hidden text-[length:var(--cf-body)] italic leading-relaxed text-[var(--ink-soft)] sm:block">
              Fyll i de tre stegen för att bekräfta dina leveransuppgifter.
            </p>
          </header>

          <ClientFormSteps />

          <ClientFormItemsList items={meta.items ?? []} />
        </ClientFormFrame>
      </main>
    </PublicPageShell>
  );
};
