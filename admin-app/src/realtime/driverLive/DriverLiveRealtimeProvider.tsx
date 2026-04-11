import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createDriverLiveChannel } from "@shared-realtime";
import type { DriverLocationUpdatedPayload } from "@shared-realtime";
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

const buildDevSeedDriverPositions = (
  teamId: number,
): DriverLocationUpdatedPayload[] => {
  const recordedAt = new Date().toISOString();

  return [
    {
      driver_id: 1,
      team_id: teamId,
      coords: { lat: 59.33258, lng: 18.0649 },
      timestamp: recordedAt,
    },
    {
      driver_id: 102,
      team_id: teamId,
      coords: { lat: 59.32893, lng: 18.07112 },
      timestamp: recordedAt,
    },
    {
      driver_id: 103,
      team_id: teamId,
      coords: { lat: 59.33621, lng: 18.05847 },
      timestamp: recordedAt,
    },
  ];
};

const withDevSeedDriverPositions = (
  positions: DriverLocationUpdatedPayload[],
  teamId: number | null,
): DriverLocationUpdatedPayload[] => {
  if (!import.meta.env.DEV || teamId == null) {
    return positions;
  }

  const mergedByDriverId = new Map<number, DriverLocationUpdatedPayload>();

  positions.forEach((position) => {
    mergedByDriverId.set(position.driver_id, position);
  });

  buildDevSeedDriverPositions(teamId).forEach((position) => {
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

    if (!import.meta.env.DEV || teamId == null) {
      return;
    }

    useDriverLiveStore
      .getState()
      .setSnapshot(buildDevSeedDriverPositions(teamId));
  }, []);

  return <>{children}</>;
}
