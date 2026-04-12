type BrowserCoordinates = {
  lat: number;
  lng: number;
};

type GeolocationLikeError = {
  code?: number;
  message?: string;
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
};

const GEOLOCATION_PERMISSION_DENIED = 1;
const GEOLOCATION_POSITION_UNAVAILABLE = 2;
const GEOLOCATION_TIMEOUT = 3;

const getErrorCode = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return null;
  }

  const code = (error as GeolocationLikeError).code;
  return typeof code === "number" ? code : null;
};

const isRetryableGeolocationError = (error: unknown) => {
  const code = getErrorCode(error);
  return (
    code === GEOLOCATION_POSITION_UNAVAILABLE || code === GEOLOCATION_TIMEOUT
  );
};

const requestBrowserPosition = (options: PositionOptions) =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

export const getBrowserCurrentPosition = async (): Promise<GeolocationPosition> => {
  try {
    return await requestBrowserPosition({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  } catch (error) {
    if (!isRetryableGeolocationError(error)) {
      throw error;
    }

    // CoreLocation can fail transiently on the initial precise lookup.
    return requestBrowserPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    });
  }
};

export const getBrowserCurrentCoordinates =
  async (): Promise<BrowserCoordinates> => {
    const position = await getBrowserCurrentPosition();
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  };

export const resolveBrowserCurrentCoordinates =
  async (): Promise<BrowserCoordinates | null> => {
    try {
      return await getBrowserCurrentCoordinates();
    } catch {
      return null;
    }
  };

export const mapBrowserGeolocationError = (error: unknown) => {
  const code = getErrorCode(error);

  switch (code) {
    case GEOLOCATION_PERMISSION_DENIED:
      return new Error("Geolocation permission denied");
    case GEOLOCATION_POSITION_UNAVAILABLE:
      return new Error("Geolocation position unavailable");
    case GEOLOCATION_TIMEOUT:
      return new Error("Geolocation timeout");
    default:
      if (error instanceof Error) {
        return error;
      }

      const message =
        error && typeof error === "object"
          ? (error as GeolocationLikeError).message
          : null;
      return new Error(message || "Geolocation failed");
  }
};
