import { Suspense, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { BackArrowIcon2 } from "@/assets/icons";
import { apiClient } from "@/lib/api/ApiClient";

import type { SectionKey } from "../registry/sectionRegistry";
import { SettingsSectionSkeleton } from "../components/SettingsSectionSkeleton";

type SettingsSections = {
  key: SectionKey | "no-section";
  label: string;
  sections?: SettingsSections[];
};

const SETTINGS_ROUTE_MAP: Record<SectionKey, string> = {
  "user.main": "/settings/profile",
  "team.main": "/settings/team",
  "team.invitations": "/settings/team/invitations",
  "integrations.main": "/settings/integrations",
  "integrations.status": "/settings/integrations/status",
  "messages.main": "/settings/messages",
  "settings.configuration": "/settings",
  "item.main": "/settings/items",
  "vehicle.main": "/settings/vehicles",
  "facility.main": "/settings/facilities",
  "externalForm.access": "/settings/external-form",
  "printDocument.main": "/settings/print-templates/item",
  "emailMessage.main": "/settings/messages/email",
  "smsMessage.main": "/settings/messages/sms",
};

const SETTINGS_SECTIONS: SettingsSections[] = [
  { key: "user.main", label: "Profile" },
  {
    key: "team.main",
    label: "Team",
    sections: [
      { key: "team.main", label: "Memebers" },
      { key: "team.invitations", label: "Invitations" },
    ],
  },
  { key: "integrations.main", label: "External Integrations" },
  { key: "messages.main", label: "Message Automations" },
  {
    key: "no-section",
    label: "Configuration",
    sections: [
      { key: "item.main", label: "Items" },
      { key: "vehicle.main", label: "Vehicles" },
      { key: "facility.main", label: "Facilities" },
      { key: "printDocument.main", label: "Print Templates" },
    ],
  },
  { key: "externalForm.access", label: "External Form" },
];

export const SettingsDesktopView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedKey, setExpandedKey] = useState<
    SectionKey | "no-section" | null
  >(null);

  const sidebarOptions = useMemo(() => SETTINGS_SECTIONS, []);

  const handleSelectSection = (key: SectionKey | "no-section") => {
    if (key === "no-section") return;
    navigate(SETTINGS_ROUTE_MAP[key]);
  };

  const handleToggleSection = (option: SettingsSections) => {
    if (option.key && option.key !== "no-section") {
      handleSelectSection(option.key);
    }
    if (!option.sections?.length) {
      return;
    }
    setExpandedKey((current) => (current === option.key ? null : option.key));
  };

  const handleLogout = () => {
    apiClient.clearSession();
    navigate("/auth/login", { replace: true });
  };

  const isRouteActive = (key: SectionKey | "no-section") => {
    if (key === "no-section") {
      return false;
    }

    const route = SETTINGS_ROUTE_MAP[key];
    return (
      location.pathname === route || location.pathname.startsWith(`${route}/`)
    );
  };

  return (
    <div className="flex h-full w-full bg-[var(--color-page)]">
      <aside className="admin-glass-panel-strong relative flex h-full w-72 min-w-72 flex-col border-r border-[var(--color-border)]/70 px-4 py-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/[0.05]" />
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
        >
          <BackArrowIcon2 className="h-4 w-4" />
          Back
        </button>

        <div className="mt-6 flex flex-1 flex-col gap-2">
          {sidebarOptions.map((option) => (
            <div key={option.key} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleToggleSection(option)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  isRouteActive(option.key)
                    ? "border-[var(--color-border)] bg-white/[0.07] text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "border-transparent text-[var(--color-text)] hover:border-white/[0.08] hover:bg-white/[0.04]"
                }`}
              >
                {option.label}
              </button>
              <AnimatePresence>
                {expandedKey === option.key && option.sections?.length ? (
                  <motion.div
                    className="flex flex-1 flex-col gap-1 pl-4"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {option.sections.map((subSection) => (
                      <button
                        key={subSection.key}
                        type="button"
                        onClick={() => handleSelectSection(subSection.key)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                          isRouteActive(subSection.key)
                            ? "border-[var(--color-light-blue-r)]/40 bg-[rgb(var(--color-light-blue-r),0.12)] text-[rgb(var(--color-light-blue-r))]"
                            : "border-transparent text-[var(--color-muted)] hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-[var(--color-text)]"
                        }`}
                      >
                        {subSection.label}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-border)]/70 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:border-red-400/20 hover:bg-red-500/[0.06] hover:text-red-200"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 overflow-hidden bg-[var(--color-page)]">
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full w-full min-h-0 flex-col bg-[var(--color-page)]"
          >
            <Suspense fallback={<SettingsSectionSkeleton />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
