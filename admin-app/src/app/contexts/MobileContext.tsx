import { createContext, useContext } from "react";

export type MobileObject = {
  isMobile: boolean;
  isMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  setIsMobile: (val: boolean) => void;
};

export const MobileContext = createContext<MobileObject | null>(null);

const desktopMobileFallback: MobileObject = {
  isMobile: false,
  isMenuOpen: false,
  setIsMobileMenuOpen: () => {
    // noop on desktop
  },
  setIsMobile: () => {},
};

export function useMobile() {
  const ctx = useContext(MobileContext);
  return ctx ?? desktopMobileFallback;
}
