import {
  mapLinkedDeviceFormToOrderUpdate,
  resolveLinkedDeviceSendDecision,
} from "../orderLinkedDeviceForm.domain";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderLinkedDeviceFormDomainTests = () => {
  const address = {
    street_address: "12 Example Street",
    city: "Stockholm",
    postal_code: "111 22",
    country: "Sweden",
    coordinates: { lat: 59.3293, lng: 18.0686 },
  };
  const patch = mapLinkedDeviceFormToOrderUpdate({
    client_first_name: "Ada",
    client_last_name: "Lovelace",
    client_email: "ada@example.com",
    client_primary_phone: { prefix: "+46", number: "701234567" },
    client_secondary_phone: null,
    client_address: address,
  });

  assert(patch.client_first_name === "Ada", "first name should be mapped");
  assert(patch.client_address === address, "address should be preserved");
  assert(
    patch.client_secondary_phone === null,
    "nullable contact fields should be preserved",
  );

  const persisted = resolveLinkedDeviceSendDecision({
    pendingOrderId: null,
    targetOrderId: 42,
  });
  assert(
    persisted.status === "send" && persisted.closeAfterSend,
    "persisted orders should close after dispatch",
  );

  const draft = resolveLinkedDeviceSendDecision({
    pendingOrderId: null,
    targetOrderId: null,
  });
  assert(
    draft.status === "send" && !draft.closeAfterSend,
    "draft orders should remain open",
  );

  const conflict = resolveLinkedDeviceSendDecision({
    pendingOrderId: 42,
    targetOrderId: 84,
  });
  assert(
    conflict.status === "blocked",
    "a different pending order should block a new request",
  );

  const retry = resolveLinkedDeviceSendDecision({
    pendingOrderId: 42,
    targetOrderId: 42,
  });
  assert(
    retry.status === "send" && retry.closeAfterSend,
    "the same persisted order may be resent safely",
  );
};
