import {
  ClientFormFrame,
  ClientFormItemsList,
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
          <header className="space-y-3 pb-2 text-center">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-[var(--ink-faint)]">
              Delivery Details
            </p>
            <h1 className="text-[2rem] font-normal leading-tight tracking-[0.01em] text-[var(--ink)]">
              {getClientFormOrderTitle(meta) ?? "Delivery details"}
            </h1>
            {/* Double rule — the printed-form convention for a masthead. */}
            <div aria-hidden="true" className="mx-auto w-24 space-y-[3px] pt-1">
              <div className="h-px bg-[var(--rule-strong)]" />
              <div className="h-px bg-[var(--rule)]" />
            </div>
            <p className="text-sm italic leading-6 text-[var(--ink-soft)]">
              Complete all three steps to confirm your delivery details.
            </p>
          </header>

          <ClientFormSteps />

          <ClientFormItemsList items={meta.items ?? []} />
        </ClientFormFrame>
      </main>
    </PublicPageShell>
  );
};
