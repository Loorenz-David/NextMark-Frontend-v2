import { useState } from "react";
import { useClientForm } from "../context/useClientForm";
import { ClientFormSheet } from "./ClientFormSheet";
import { ConsentCheckbox } from "./ConsentCheckbox";
import { TermsDocumentView } from "./TermsDocumentView";

export const ConsentSection = () => {
  const {
    config,
    data,
    options,
    setField,
    setTermsAccepted,
    submitError,
    termsError,
  } = useClientForm();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const { terms, require_terms_acceptance: requiresAcceptance } = config;
  const isAccepted =
    terms !== null && data.accepted_terms_version_id === terms.version_id;
  const showTermsError = Boolean(termsError) && !isAccepted;

  const handleTermsChange = (accepted: boolean) => {
    setTermsAccepted(accepted);
  };

  // A team with no published terms, on a surface that does not ask for
  // marketing consent, has nothing to consent to — the panel would otherwise be
  // an empty box. A submit error still has to reach the customer, though.
  const hasConsentToGive = Boolean(terms) || options.collectMarketingConsent;
  if (!hasConsentToGive) {
    return submitError ? (
      <p className="text-[length:var(--cf-body)] text-[var(--danger)]">{submitError}</p>
    ) : null;
  }

  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper-sunken)]/60 p-4">
      {terms ? (
        <ConsentCheckbox
          id="client-form-terms"
          checked={isAccepted}
          onChange={handleTermsChange}
          invalid={showTermsError}
          label={
            <>
              I accept the{" "}
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="cursor-pointer font-semibold text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-4 hover:decoration-[var(--accent)]"
              >
                terms and conditions
              </button>
              {requiresAcceptance ? (
                <span className="ml-1 text-[var(--danger)]">*</span>
              ) : null}
            </>
          }
        />
      ) : null}

      {options.collectMarketingConsent ? (
        <ConsentCheckbox
          id="client-form-marketing"
          checked={data.marketing_messages}
          onChange={(checked) => setField("marketing_messages", checked)}
          label="Send me offers and delivery updates by email"
        />
      ) : null}

      {showTermsError ? (
        <p className="text-[length:var(--cf-body)] text-[var(--danger)]">{termsError}</p>
      ) : null}

      {submitError ? <p className="text-[length:var(--cf-body)] text-[var(--danger)]">{submitError}</p> : null}

      {terms ? (
        <ClientFormSheet
          open={isTermsOpen}
          onOpenChange={setIsTermsOpen}
          title="Terms and conditions"
          variant="fullscreen"
          // Leaving by the arrow reads the terms without accepting them; only
          // "Done" at the end of the text ticks the box.
          onBack={() => setIsTermsOpen(false)}
          backLabel="Back to the form"
          footerPlacement="inline"
          footer={
            <button
              type="button"
              onClick={() => {
                handleTermsChange(true);
                setIsTermsOpen(false);
              }}
              className="w-full min-h-[var(--cf-tap)] cursor-pointer rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-[length:var(--cf-action)] font-semibold uppercase tracking-[0.18em] text-[var(--accent-ink)] transition-colors hover:border-[var(--accent-soft)] hover:bg-[var(--accent-soft)]"
            >
              Done
            </button>
          }
        >
          <TermsDocumentView document={terms.content} />
        </ClientFormSheet>
      ) : null}
    </div>
  );
};
