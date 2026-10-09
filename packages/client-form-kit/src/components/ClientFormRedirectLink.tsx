import type { ClientFormRedirect } from "../domain/clientFormRedirect";

type Props = {
  redirect: ClientFormRedirect;
  label?: string;
  variant?: "primary" | "ghost";
  onFollow?: () => void;
};

/**
 * The tap-to-continue link to the team's page.
 *
 * A real same-tab anchor, not a scripted navigation or a new window: popup
 * blockers and in-app browsers (Instagram, Facebook, Gmail) can refuse those,
 * and on iOS a universal link only opens the team's app from a user gesture.
 * `no-referrer` keeps the form URL — and the token in its path — away from the
 * destination.
 */
export const ClientFormRedirectLink = ({
  redirect,
  label,
  variant = "primary",
  onFollow,
}: Props) => (
  <a
    href={redirect.href}
    rel="noopener noreferrer"
    referrerPolicy="no-referrer"
    onClick={onFollow}
    className={[
      "inline-flex min-h-[var(--cf-tap)] items-center justify-center rounded-[var(--radius)] border px-6 py-[var(--cf-action-py)] text-[length:var(--cf-action)] font-semibold uppercase tracking-[0.18em] transition-colors",
      variant === "primary"
        ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] hover:border-[var(--accent-soft)] hover:bg-[var(--accent-soft)]"
        : "border-[var(--rule-strong)] bg-transparent text-[var(--ink-soft)] hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)]",
    ].join(" ")}
  >
    {label ?? `Fortsätt till ${redirect.host}`}
  </a>
);
