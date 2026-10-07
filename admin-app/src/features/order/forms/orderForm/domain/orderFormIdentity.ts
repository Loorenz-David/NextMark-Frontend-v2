type OrderFormIdentityInput = {
  orderScalarId?: number | null;
  referenceNumber?: string | null;
  externalSource?: string | null;
};

/** Header subtitle: the external reference when the order came from outside, else the scalar id. */
export const resolveOrderFormIdentity = ({
  orderScalarId,
  referenceNumber,
  externalSource,
}: OrderFormIdentityInput): string | null => {
  const normalizedReferenceNumber = referenceNumber?.trim();
  const normalizedExternalSource = externalSource?.trim();
  if (normalizedExternalSource && normalizedReferenceNumber) {
    return normalizedReferenceNumber;
  }
  return typeof orderScalarId === "number" ? `#${orderScalarId}` : null;
};
