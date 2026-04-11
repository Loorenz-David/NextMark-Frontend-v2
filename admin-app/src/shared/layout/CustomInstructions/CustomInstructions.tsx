import { StepCard } from './StepCard'
import type { InstructionsRootProps } from './CustomInstructions.types'

export const CustomInstructions = ({
  steps,
  scrollable = false,
  className,
  stepCardClassName,
  stepCardMaxWidth,
}: InstructionsRootProps) => {
  const layoutClass = scrollable
    ? 'flex-nowrap overflow-x-auto overscroll-x-contain pb-2'
    : 'flex-wrap'

  const containerClassName = `w-full ${className ?? ''}`.trim()

  return (
    <section className={containerClassName}>
      <div className={`flex gap-6 ${layoutClass}`}>
        {steps.map((step, index) => (
          <StepCard
            key={`instruction-step-${index}`}
            step={step}
            index={index}
            className={stepCardClassName}
            maxWidth={stepCardMaxWidth}
          />
        ))}
      </div>
    </section>
  )
}
