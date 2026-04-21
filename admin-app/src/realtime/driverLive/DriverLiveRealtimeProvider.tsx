import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createDriverLiveChannel } from "@shared-realtime";
import type { DriverLocationUpdatedPayload } from "@shared-realtime";
import { getDriverLiveDevSeedPositions, isDriverLiveDevSeedEnabled } from "@/app/services/driverLiveDevSeed.service";
import { sessionStorage } from "@/features/auth/login/store/sessionStorage";
import { adminRealtimeClient } from "../client";
import { useDriverLiveStore } from "./driverLive.store";

const resolveTeamId = () => {
  const session = sessionStorage.getSession();
  const rawTeamId =
    session?.identity?.active_team_id ?? session?.user?.teamId ?? null;
  const numericTeamId = Number(rawTeamId);
  return Number.isFinite(numericTeamId) ? numericTeamId : null;
};

const withDevSeedDriverPositions = (
  positions: DriverLocationUpdatedPayload[],
  teamId: number | null,
): DriverLocationUpdatedPayload[] => {
  if (teamId == null || !isDriverLiveDevSeedEnabled()) {
    return positions;
  }

  const mergedByDriverId = new Map<number, DriverLocationUpdatedPayload>();

  positions.forEach((position) => {
    mergedByDriverId.set(position.driver_id, position);
  });

  getDriverLiveDevSeedPositions(teamId).forEach((position) => {
    if (!mergedByDriverId.has(position.driver_id)) {
      mergedByDriverId.set(position.driver_id, position);
    }
  });

  return Array.from(mergedByDriverId.values());
};

export function DriverLiveRealtimeProvider({ children }: PropsWithChildren) {
  const session = useSyncExternalStore(
    sessionStorage.subscribe.bind(sessionStorage),
    () => sessionStorage.getSession(),
    () => sessionStorage.getSession(),
  );

  const driverLiveChannel = useMemo(
    () => createDriverLiveChannel(adminRealtimeClient),
    [],
  );

  useEffect(() => {
    const socketToken = session?.socketToken ?? null;
    const teamId = resolveTeamId();

    if (!socketToken || teamId == null) {
      useDriverLiveStore.getState().clear();
      return;
    }

    const release = driverLiveChannel.subscribeTeamDriverLive({
      onSnapshot: (payload) => {
        useDriverLiveStore.getState().setSnapshot(
          withDevSeedDriverPositions(payload.positions ?? [], teamId),
        );
      },
      onUpdated: (payload) => {
        useDriverLiveStore.getState().setSnapshot(
          withDevSeedDriverPositions(
            [
              ...Object.values(useDriverLiveStore.getState().positionsByDriverId),
              payload,
            ],
            teamId,
          ),
        );
      },
    });

    return () => {
      release();
    };
  }, [driverLiveChannel, session]);

  useEffect(() => {
    const teamId = resolveTeamId();

    if (teamId == null || !isDriverLiveDevSeedEnabled()) {
      return;
    }

    useDriverLiveStore.getState().setSnapshot(getDriverLiveDevSeedPositions(teamId));
  }, []);

  return <>{children}</>;
}
