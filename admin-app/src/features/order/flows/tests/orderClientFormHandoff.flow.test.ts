import { executeOrderClientFormHandoff } from "../orderClientFormHandoff.flow";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderClientFormHandoffFlowTests = async () => {
  const customerCalls: string[] = [];
  const customerResult = await executeOrderClientFormHandoff(
    {
      kind: "customer",
      orderId: 42,
      orderClientId: "order-42",
      hasGeneratedLink: false,
      recipients: {
        email: "customer@example.com",
        phone: null,
      },
    },
    {
      ensureLink: async () => {
        customerCalls.push("ensure-link");
        return {
          hasGeneratedLink: true,
          formUrl: "https://example.test/form",
          expiresAt: null,
        };
      },
      sendToCustomer: async () => {
        customerCalls.push("send");
      },
      sendToLinkedDevice: () => ({ status: "sent" }),
    },
  );

  assert(customerResult.status === "sent", "customer handoff should succeed");
  assert(
    customerCalls.join(",") === "ensure-link,send",
    "customer handoff should ensure the link before sending",
  );

  let linkedCalls = 0;
  const linkedResult = await executeOrderClientFormHandoff(
    {
      kind: "linked_device",
      employeeUserId: 7,
      orderId: 42,
      referenceNumber: "REF-42",
    },
    {
      ensureLink: async () => {
        throw new Error("customer dependency should not run");
      },
      sendToCustomer: async () => {
        throw new Error("customer dependency should not run");
      },
      sendToLinkedDevice: () => {
        linkedCalls += 1;
        return { status: "sent" };
      },
    },
  );

  assert(linkedResult.status === "sent", "linked-device handoff should succeed");
  assert(linkedCalls === 1, "linked-device handoff should emit once");
};
