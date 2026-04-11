import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckMarkIcon } from "@/assets/icons";

import { ClientInfoStep } from "../components/ClientInfoStep";
import { ContactInfoStep } from "../components/ContactInfoStep";
import { DeliveryAddressStep } from "../components/DeliveryAddressStep";
import { StepIndicator } from "../components/StepIndicator";
import { StepLayout } from "../components/StepLayout";
import { ExternalFormProvider } from "../context/ExternalForm.provider";
import { useExternalForm } from "../context";

type PageLayoutProps = {
  children: ReactNode;
};

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#131a1b]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-14%] top-[-10%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(131,204,185,0.24),transparent_66%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-18%] right-[-12%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(117,168,255,0.16),transparent_70%)] blur-3xl"
      />

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="space-y-2 text-center">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#83ccb9]/58">
            External Customer Form
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">
            Confirm delivery details
          </h1>
          <p className="text-sm text-white/46">
            Complete all three steps to submit customer details.
          </p>
        </header>
        {children}
      </main>
    </div>
  );
};

const ExternalCustomerFormContent = () => {
  const { currentStep, isFormVisible, hasSubmitted } = useExternalForm();

  return (
    <PageLayout>
      <AnimatePresence mode="wait">
        {!isFormVisible ? (
          <motion.div
            key="external-form"
            initial={{ y: -26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="space-y-6"
          >
            <StepIndicator />
            <StepLayout>
              {currentStep === "client_info" && <ClientInfoStep />}
              {currentStep === "contact_info" && <ContactInfoStep />}
              {currentStep === "delivery_address" && <DeliveryAddressStep />}
            </StepLayout>
          </motion.div>
        ) : hasSubmitted ? (
          <motion.section
            key="external-form-submitted"
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.40)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_52%)]" />
            <div className="relative flex min-h-[224px] flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#83ccb9]/30 bg-[#83ccb9]/15 text-[#83ccb9] shadow-[0_0_28px_rgba(131,204,185,0.30)]">
                <CheckMarkIcon className="h-8 w-8" />
              </div>
              <p className="text-xl font-semibold text-white/92">
                Form submitted
              </p>
              <p className="text-sm text-white/46">
                Waiting for a new form request...
              </p>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="external-form-idle"
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.40)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_52%)]" />
            <div className="relative py-10 text-sm text-white/46">
              Waiting for form request...
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export const ExternalCustomerFormPage = () => {
  return (
    <ExternalFormProvider>
      <ExternalCustomerFormContent />
    </ExternalFormProvider>
  );
};
