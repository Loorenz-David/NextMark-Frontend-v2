import {
  formatRouteTemplateOrderIdentity,
} from "../serializeRouteSolutionForTemplate";
import {
  formatRoutePlanDate,
  getRoutePlanIsoWeekNumber,
} from "../routePlanDate";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runSerializeRouteSolutionForTemplateTests = () => {
  assert(
    formatRoutePlanDate("2026-02-18", "2026-02-18") === "18-02-2026",
    "single-day route plan dates should use dd-mm-yyyy",
  );

  assert(
    formatRoutePlanDate("2026-02-18", "2026-02-20") ===
      "18-02-2026  --  20-02-2026",
    "multi-day route plan dates should format both boundaries as dd-mm-yyyy",
  );

  assert(
    getRoutePlanIsoWeekNumber("2026-02-18") === 8,
    "route plan dates should expose their ISO week number",
  );

  assert(
    getRoutePlanIsoWeekNumber("2021-01-01") === 53,
    "ISO week numbers should remain correct at year boundaries",
  );

  assert(
    formatRouteTemplateOrderIdentity({
      order_scalar_id: 10234,
      reference_number: "EXT-10234",
      external_source: "shopify",
    }) === "#EXT-10234",
    "external route orders should use reference number as identity",
  );

  assert(
    formatRouteTemplateOrderIdentity({
      order_scalar_id: 10234,
      reference_number: "EXT-10234",
      external_source: "",
    }) === "#10234",
    "non-external route orders should use scalar identity",
  );

  assert(
    formatRouteTemplateOrderIdentity({
      order_scalar_id: 10234,
      reference_number: "#EXT-10234",
      external_source: "shopify",
    }) === "#EXT-10234",
    "prefixed route reference identity should be preserved",
  );
};
