import { apiClient } from "@/lib/api/ApiClient";

export const sessionLocationService = {
  getCountryCode: () => apiClient.getSessionCountryCode(),
  getCity: () => apiClient.getSessionCity(),
  getZoneCityKey: () => apiClient.getSessionCity(),
} as const;
