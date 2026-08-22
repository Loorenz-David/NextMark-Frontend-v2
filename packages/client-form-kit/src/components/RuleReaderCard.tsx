import { useState, type Ref } from "react";
import type { ClientFormRule } from "../domain/clientFormConfig.types";

type Props = {
  rule: ClientFormRule;
  headingRef?: Ref<HTMLHeadingElement>;
};

/**
 * One stage in the rules reader: title, description, then its illustration.
 * The heading is programmatically focusable so a stage change can announce the
 * new content without adding another stop to normal keyboard navigation.
 */
export const RuleReaderCard = ({ rule, headingRef }: Props) => {
  const [hasImageFailed, setHasImageFailed] = useState(false);
  const titleId = `client-form-rule-${rule.id}-title`;

  return (
    <article aria-labelledby={titleId} className="space-y-5">
      <div className="space-y-1.5">
        <h3
          ref={headingRef}
          id={titleId}
          tabIndex={-1}
          className="text-[length:var(--cf-subheading)] font-semibold tracking-[-0.01em] text-[var(--ink)]"
        >
          {rule.title}
        </h3>
        {rule.body ? (
          <p className="whitespace-pre-wrap text-[length:var(--cf-body)] leading-relaxed text-[var(--ink-soft)]">
            {rule.body}
          </p>
        ) : null}
      </div>

      {rule.image_url && !hasImageFailed ? (
        <img
          src={rule.image_url}
          alt=""
          loading="lazy"
          // A dead URL must not leave a broken-image box in front of the customer.
          onError={() => setHasImageFailed(true)}
          className="aspect-[16/10] w-full rounded-2xl object-cover"
        />
      ) : null}
    </article>
  );
};
