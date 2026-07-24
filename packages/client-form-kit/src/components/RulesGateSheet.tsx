import { useClientForm } from "../context/useClientForm";
import { ClientFormSheet } from "./ClientFormSheet";
import { RuleReaderCard } from "./RuleReaderCard";

/**
 * Held between "Submit" and the actual POST: the customer reads how deliveries
 * work, then confirms. Not dismissible by backdrop or Escape — acknowledging is
 * the point, and "Back" is the way out.
 */
export const RulesGateSheet = () => {
  const {
    config,
    isRulesGateOpen,
    isSubmitting,
    acknowledgeRules,
    dismissRulesGate,
  } = useClientForm();

  return (
    <ClientFormSheet
      open={isRulesGateOpen}
      onOpenChange={(open) => {
        if (!open) dismissRulesGate();
      }}
      dismissible={false}
      variant="fullscreen"
      title="Before you confirm"
      description="How your delivery will work."
      // The only way out — the gate is not dismissible by backdrop or Escape.
      onBack={dismissRulesGate}
      backLabel="Back to the form"
      // Title travels up with the rules rather than holding a fixed bar.
      headerPlacement="inline"
      // Sits at the end of the list, so the customer reaches it by reading through.
      footerPlacement="inline"
      footer={
        <button
          type="button"
          onClick={() => void acknowledgeRules()}
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-ink)] transition-colors hover:border-[var(--accent-soft)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "Submitting…" : "Got it"}
        </button>
      }
    >
      <div className="divide-y divide-[var(--rule)]">
        {config.rules.map((rule) => (
          <RuleReaderCard key={rule.id} rule={rule} />
        ))}
      </div>
    </ClientFormSheet>
  );
};
