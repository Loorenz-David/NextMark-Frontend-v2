import type { Ref } from "react";
import type { ClientFormRule } from "../domain/clientFormConfig.types";
import { CheckMarkIcon } from "../icons/CheckMarkIcon";
import { ConsentSection } from "./ConsentSection";

type Props = {
  rules: ClientFormRule[];
  headingRef?: Ref<HTMLHeadingElement>;
};

/**
 * The stage after the last rule: the rules just read, each ticked off, then
 * consent. Consent lives here rather than on the address step so the customer
 * cannot give it without first passing through the rules.
 */
export const RulesConfirmStage = ({ rules, headingRef }: Props) => (
  <section aria-labelledby="client-form-rules-confirm-title" className="space-y-6">
    <div className="space-y-4">
      <h3
        ref={headingRef}
        id="client-form-rules-confirm-title"
        tabIndex={-1}
        className="text-[length:var(--cf-subheading)] font-semibold tracking-[-0.01em] text-[var(--ink)]"
      >
        Bekräfta och skicka
      </h3>

      <ul aria-label="Det här har du läst" className="space-y-3">
        {rules.map((rule) => (
          <li key={rule.id} className="flex items-start gap-3">
            <CheckMarkIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
            <span className="text-[length:var(--cf-body)] leading-relaxed text-[var(--ink)]">
              {rule.title}
            </span>
          </li>
        ))}
      </ul>
    </div>

    <ConsentSection />
  </section>
);
