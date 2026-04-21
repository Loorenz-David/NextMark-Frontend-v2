import type { DriverLocationUpdatedPayload } from "@shared-realtime";

type DriverLiveSeedPositionConfig = {
  driver_id: number;
  coords: {
    lat: number;
    lng: number;
  };
  timestamp?: string | null;
};

const DRIVER_LIVE_DEV_SEED_ENABLED =
  (import.meta.env.VITE_DRIVER_LIVE_DEV_SEED_ENABLED as string | undefined)
    ?.trim()
    .toLowerCase() === "true";

const DRIVER_LIVE_DEV_SEED_POSITIONS = (
  import.meta.env.VITE_DRIVER_LIVE_DEV_SEED_POSITIONS as string | undefined
)?.trim();

const isFiniteCoordinate = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isDriverLiveSeedPositionConfig = (
  value: unknown,
): value is DriverLiveSeedPositionConfig => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DriverLiveSeedPositionConfig>;
  return (
    typeof candidate.driver_id === "number" &&
    Number.isFinite(candidate.driver_id) &&
    !!candidate.coords &&
    isFiniteCoordinate(candidate.coords.lat) &&
    isFiniteCoordinate(candidate.coords.lng) &&
    (candidate.timestamp == null || typeof candidate.timestamp === "string")
  );
};

const parseDriverLiveSeedPositions = (): DriverLiveSeedPositionConfig[] => {
  if (!DRIVER_LIVE_DEV_SEED_POSITIONS) {
    return [];
  }

  try {
    const parsed = JSON.parse(DRIVER_LIVE_DEV_SEED_POSITIONS) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isDriverLiveSeedPositionConfig);
  } catch {
    return [];
  }
};

const DRIVER_LIVE_DEV_SEED_POSITIONS_PARSED = parseDriverLiveSeedPositions();

export const getDriverLiveDevSeedPositions = (
  teamId: number,
): DriverLocationUpdatedPayload[] => {
  if (!DRIVER_LIVE_DEV_SEED_ENABLED) {
    return [];
  }

  const recordedAt = new Date().toISOString();

  return DRIVER_LIVE_DEV_SEED_POSITIONS_PARSED.map((position) => ({
    driver_id: position.driver_id,
    team_id: teamId,
    coords: position.coords,
    timestamp: position.timestamp ?? recordedAt,
  }));
};

export const isDriverLiveDevSeedEnabled = () =>
  DRIVER_LIVE_DEV_SEED_ENABLED &&
  DRIVER_LIVE_DEV_SEED_POSITIONS_PARSED.length > 0;
