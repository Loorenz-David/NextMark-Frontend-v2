import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMessageHandler } from "@shared-message-handler";

import { DEFAULT_PREFIX } from "@/constants/dropDownOptions";
import { useRegisterMutations } from "@/features/auth/register/hooks/useRegisterMutations";
import {
  registerCountryOptions,
  resolveCountryCodeByName,
} from "@/features/auth/register/domain/registerCountryOptions";
import { useRegisterError, useRegisterLoading } from "@/features/auth/register/hooks/useRegisterSelectors";
import { useAddressCurrentLocationFlow } from "@/shared/inputs/address-autocomplete/hooks/useAddressCurrentLocationFlow";
import type { Phone } from "@/types/phone";

const detectTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export const useRegisterFormController = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessageHandler();
  const { register } = useRegisterMutations();
  const { getCurrentLocationAddress } = useAddressCurrentLocationFlow();
  const isLoading = useRegisterLoading();
  const error = useRegisterError();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState<Phone>({
    prefix: DEFAULT_PREFIX,
    number: "",
  });
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const isSubmitDisabled = useMemo(
    () =>
      isLoading ||
      isDetectingLocation ||
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !phone.number.trim() ||
      !countryCode ||
      !city.trim(),
    [city, countryCode, email, isDetectingLocation, isLoading, password, phone.number, username],
  );

  const handleUseCurrentLocation = useCallback(async () => {
    setIsDetectingLocation(true);

    try {
      const address = await getCurrentLocationAddress();
      const resolvedCountryCode = resolveCountryCodeByName(address.country);

      if (address.city) {
        setCity(address.city);
      }

      if (resolvedCountryCode) {
        setCountryCode(resolvedCountryCode);
      }
    } catch (locationError) {
      const message =
        locationError instanceof Error
          ? locationError.message
          : "Unable to determine current location.";
      showMessage({ status: 500, message });
    } finally {
      setIsDetectingLocation(false);
    }
  }, [getCurrentLocationAddress, showMessage]);

  const handleSubmit = useCallback(async () => {
    if (!countryCode || !city.trim()) {
      return;
    }

    const outcome = await register({
      username: username.trim(),
      email: email.trim(),
      password,
      phone_number: phone,
      time_zone: detectTimeZone(),
      country_code: countryCode,
      city: city.trim(),
    });

    if (outcome) {
      navigate("/auth/login");
    }
  }, [city, countryCode, email, navigate, password, phone, register, username]);

  return {
    fields: {
      username,
      email,
      password,
      phone,
      countryCode,
      city,
    },
    options: {
      countryOptions: registerCountryOptions,
    },
    status: {
      isLoading,
      isDetectingLocation,
      isSubmitDisabled,
      error,
    },
    actions: {
      setUsername,
      setEmail,
      setPassword,
      setPhone,
      setCountryCode,
      setCity,
      handleSubmit,
      handleUseCurrentLocation,
    },
  };
};
