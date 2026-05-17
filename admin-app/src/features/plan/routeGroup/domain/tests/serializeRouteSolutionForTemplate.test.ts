import { formatRouteTemplateOrderIdentity } from "../serializeRouteSolutionForTemplate";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runSerializeRouteSolutionForTemplateTests = () => {
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
