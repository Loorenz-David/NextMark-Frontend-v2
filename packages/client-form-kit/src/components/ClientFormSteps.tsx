import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClientForm } from "../context/useClientForm";
import { CLIENT_FORM_STEPS } from "../domain/clientForm.flow";
import { StepIndicator } from "./StepIndicator";
import { StepLayout } from "./StepLayout";
import { ClientInfoStep } from "./ClientInfoStep";
import { ContactInfoStep } from "./ContactInfoStep";
import { DeliveryAddressStep } from "./DeliveryAddressStep";
import { RulesGateSheet } from "./RulesGateSheet";

const stepVariants = {
  initial: (d: number) => ({ x: d * 80, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * -80, opacity: 0 }),
};

/**
 * The whole collection sequence: indicator, the current step, and the rules
 * gate that stands between Submit and the actual write.
 *
 * The gate ships inside rather than beside, because a host that forgot to
 * render it would leave the form silently frozen on Submit — the provider opens
 * the gate and waits for an acknowledgement that could never arrive.
 */
export const ClientFormSteps = () => {
  const { currentStep } = useClientForm();

  const stepIndex = CLIENT_FORM_STEPS.indexOf(currentStep);
  const directionRef = useRef(1);
  const prevIndexRef = useRef(stepIndex);
  if (stepIndex !== prevIndexRef.current) {
    directionRef.current = stepIndex > prevIndexRef.current ? 1 : -1;
    prevIndexRef.current = stepIndex;
  }
  const direction = directionRef.current;

  return (
    <>
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

      <RulesGateSheet />
    </>
  );
};
