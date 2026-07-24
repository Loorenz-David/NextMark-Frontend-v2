import type { ReactNode } from "react";
import type { ClientFormConfig } from "../domain/clientFormConfig.types";
import { getClientFormMedia } from "../domain/clientFormMedia";
import { ClientFormMediaCarousel } from "./ClientFormMediaCarousel";
import { ClientFormMediaRail } from "./ClientFormMediaRail";

type Props = {
  /**
   * Passed in rather than read from the form context, because the media outlives
   * the form: an in-store device shows what is on offer while it waits for a
   * request, long before anyone starts filling anything in.
   */
  config: ClientFormConfig;
  children: ReactNode;
};

/**
 * The form column and the media around it.
 *
 * The carousel sits after the rail row rather than inside the column, which is
 * what keeps it clear of the rails: the row is as tall as its tallest member, so
 * with rails configured the carousel lands beneath them at the foot of the page,
 * and without them it lands directly under the form. One arrangement, and the
 * layout resolves which of the two it is.
 *
 * Rails are desktop-only and each piece renders nothing when its placement is
 * unconfigured, so a team with no media gets exactly the centred column the form
 * has always been — this is not a layout the host opts into.
 *
 * `items-start` is what lets the rails stick while the column scrolls past them.
 */
export const ClientFormFrame = ({ config, children }: Props) => {
  const leftRail = getClientFormMedia(config, "sidebar_left");
  const rightRail = getClientFormMedia(config, "sidebar_right");
  const carousel = getClientFormMedia(config, "carousel");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div className="flex items-start justify-center gap-6 lg:gap-14 xl:gap-20">
        <ClientFormMediaRail items={leftRail} />

        <div className="flex w-full max-w-lg flex-col gap-6 py-10">
          {children}
        </div>

        <ClientFormMediaRail items={rightRail} />
      </div>

      {carousel.length ? (
        // Held to the column's width so it stays visually anchored to the form
        // even when it has been pushed to the foot of a much wider page.
        <div className="mx-auto w-full max-w-lg pb-14">
          <ClientFormMediaCarousel items={carousel} />
        </div>
      ) : null}
    </div>
  );
};
