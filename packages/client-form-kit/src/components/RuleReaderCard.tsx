import { useState } from "react";
import type { ClientFormRule } from "../domain/clientFormConfig.types";

type Props = {
  rule: ClientFormRule;
};

/**
 * Reads top to bottom: title, description, then the image that illustrates it.
 *
 * The title is the only heading — no step number is added, so whoever writes the
 * rules owns how they are labelled. Order comes from the list itself.
 * Separation between rules comes from the list's hairline dividers rather than
 * from a card border, so the sequence reads as one flow.
 */
export const RuleReaderCard = ({ rule }: Props) => {
  const [hasImageFailed, setHasImageFailed] = useState(false);

  return (
    <article className="space-y-4 py-6 first:pt-0 last:pb-0">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold tracking-[-0.01em] text-[var(--ink)]">
          {rule.title}
        </h3>
        {rule.body ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--ink-soft)]">
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
