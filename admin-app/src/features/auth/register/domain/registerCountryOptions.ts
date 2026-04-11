import { phonePrefixes } from "@/shared/inputs/PhoneField/phonePrefixes";

export type RegisterCountryOption = {
  label: string;
  value: string;
};

const normalizeCountryName = (value: string) => value.trim().toLowerCase();

export const registerCountryOptions: RegisterCountryOption[] = Array.from(
  new Map(
    phonePrefixes.map((option) => [
      option.countryCode,
      {
        label: option.countryName,
        value: option.countryCode,
      } satisfies RegisterCountryOption,
    ]),
  ).values(),
).sort((left, right) => left.label.localeCompare(right.label));

export const resolveCountryCodeByName = (countryName: string | null | undefined) => {
  const normalizedCountryName = normalizeCountryName(countryName ?? "");
  if (!normalizedCountryName) {
    return null;
  }

  const match = phonePrefixes.find(
    (option) => normalizeCountryName(option.countryName) === normalizedCountryName,
  );

  return match?.countryCode ?? null;
};
