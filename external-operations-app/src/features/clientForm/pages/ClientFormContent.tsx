import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PublicPageShell } from "../../../app/layout/PublicPageShell";
import { useClientForm } from "../context/useClientForm";
import { StepIndicator } from "../components/StepIndicator";
import { StepLayout } from "../components/StepLayout";
import { ClientInfoStep } from "../components/ClientInfoStep";
import { ContactInfoStep } from "../components/ContactInfoStep";
import { DeliveryAddressStep } from "../components/DeliveryAddressStep";
import { ClientFormItemsList } from "../components/ClientFormItemsList";

const STEPS = ["client_info", "contact_info", "delivery_address"] as const;

const stepVariants = {
  initial: (d: number) => ({ x: d * 80, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * -80, opacity: 0 }),
};

export const ClientFormContent = () => {
  const { currentStep, meta } = useClientForm();

  const stepIndex = STEPS.indexOf(currentStep);
  const directionRef = useRef(1);
  const prevIndexRef = useRef(stepIndex);
  if (stepIndex !== prevIndexRef.current) {
    directionRef.current = stepIndex > prevIndexRef.current ? 1 : -1;
    prevIndexRef.current = stepIndex;
  }
  const direction = directionRef.current;

  return (
    <PublicPageShell>
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="space-y-1 text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">
            Order # {meta.order_scalar_id || "—"}
          </h1>
          <p className="text-sm text-white/46">
            Complete all three steps to confirm your delivery details.
          </p>
        </header>

        <StepIndicator />

        <div>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <StepLayout>
                {currentStep === "client_info" && <ClientInfoStep />}
                {currentStep === "contact_info" && <ContactInfoStep />}
                {currentStep === "delivery_address" && <DeliveryAddressStep />}
              </StepLayout>
            </motion.div>
          </AnimatePresence>
        </div>

        <ClientFormItemsList items={meta.items ?? []} />
      </main>
    </PublicPageShell>
  );
};
