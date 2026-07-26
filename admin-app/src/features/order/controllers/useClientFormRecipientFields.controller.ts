import { useMemo, useState } from "react";

import { DEFAULT_PREFIX } from "@/constants/dropDownOptions";
import type { Phone } from "@/types/phone";

import {
  resolveClientFormRecipients,
  type ClientFormRecipientValidation,
} from "../domain/clientFormRecipients.domain";
import { useOrderValidation } from "../domain/useOrderValidation";

export type ClientFormRecipientFieldsController =
  ClientFormRecipientValidation & {
    email: string;
    phone: Phone;
    setEmail: (value: string) => void;
    setPhone: (value: Phone) => void;
  };

export const useClientFormRecipientFieldsController = ({
  initialEmail,
  initialPhone,
}: {
  initialEmail?: string | null;
  initialPhone?: Phone | null;
} = {}): ClientFormRecipientFieldsController => {
  const { validateCustomerEmail, validatePhone } = useOrderValidation();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [phone, setPhone] = useState<Phone>(
    initialPhone ?? { prefix: DEFAULT_PREFIX, number: "" },
  );

  const validation = useMemo(
    () =>
      resolveClientFormRecipients({
        email,
        phone,
        defaultPhonePrefix: DEFAULT_PREFIX,
        validators: {
          validateEmail: validateCustomerEmail,
          validatePhone,
        },
      }),
    [email, phone, validateCustomerEmail, validatePhone],
  );

  return {
    email,
    phone,
    setEmail,
    setPhone,
    ...validation,
  };
};
