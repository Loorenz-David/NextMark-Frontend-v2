import { useState, type ReactNode } from "react";
import type { ClientFormMedia } from "../domain/clientFormConfig.types";
import { resolveClientFormMediaHref } from "../domain/clientFormMedia";

type LinkProps = {
  media: ClientFormMedia;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps content in the media's link when it has a usable one, and in a plain
 * element when it does not — so a caller never branches on `link_url` itself.
 *
 * `noopener noreferrer` is not optional here: these URLs are typed by a team in
 * the admin console and opened in the customer's browser.
 */
export const ClientFormMediaLink = ({ media, className, children }: LinkProps) => {
  const href = resolveClientFormMediaHref(media.link_url);

  if (!href) {
    return <div className={className}>{children}</div>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className ?? ""} cursor-pointer`.trim()}
    >
      {children}
    </a>
  );
};

type ImageProps = {
  media: ClientFormMedia;
  className?: string;
  /** Rendered in place of the image once the URL turns out to be dead. */
  fallback?: ReactNode;
};

/**
 * `alt_text` is screen-reader copy, never visible — an item without it is
 * decorative and is hidden from assistive tech rather than read as its URL.
 *
 * A dead URL must not leave a broken-image box in front of the customer, so the
 * image removes itself on error.
 */
export const ClientFormMediaImage = ({
  media,
  className,
  fallback = null,
}: ImageProps) => {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={media.url}
      alt={media.alt_text ?? ""}
      aria-hidden={media.alt_text ? undefined : "true"}
      loading="lazy"
      onError={() => setHasFailed(true)}
      className={className}
    />
  );
};
