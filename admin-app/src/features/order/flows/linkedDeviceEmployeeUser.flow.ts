import { sessionStorage } from "@/features/auth/login/store/sessionStorage";

/**
 * The employee id that keys every linked-device store (pending requests and
 * live progress). Single derivation so all participants — send flow, live
 * merge, bootstrap overlay, widget — agree on the key. Returns -1 when no
 * session is active, which matches no store entry.
 */
export const getLinkedDeviceEmployeeUserId = (): number => {
  const session = sessionStorage.getSession();
  return Number(
    session?.user?.id ??
      (session as { userId?: string | number | null } | null)?.userId ??
      -1,
  );
};
