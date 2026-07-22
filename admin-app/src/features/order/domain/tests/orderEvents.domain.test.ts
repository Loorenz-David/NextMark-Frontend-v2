import { EMAIL_EVENTS } from "@/features/messaging/emailMessage/domain/emailEvents";
import { SMS_EVENTS } from "@/features/messaging/smsMessage/domain/smsEvents";

import { ORDER_EVENTS } from "../orderEvents";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderEventsDomainTests = () => {
  const event = ORDER_EVENTS.find(
    (definition) => definition.key === "client_form_submitted",
  );

  assert(Boolean(event), "client form submitted should be an order event");
  assert(
    event?.label === "Client form submitted",
    "client form submitted should have the event-history label",
  );
  assert(
    EMAIL_EVENTS.some((definition) => definition.key === "client_form_submitted"),
    "client form submitted should be selectable for email templates",
  );
  assert(
    SMS_EVENTS.some((definition) => definition.key === "client_form_submitted"),
    "client form submitted should be selectable for SMS templates",
  );
};
