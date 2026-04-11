import { renderSlateBlocks } from './renderSlateContent'
import type { StepCardProps } from './CustomInstructions.types'

export const StepCard = ({ step, index, className, maxWidth }: StepCardProps) => {
  const containerClassName =
    `flex min-w-[280px] flex-1 flex-col gap-4 rounded-[20px] border border-[#83ccb9]/24 bg-[linear-gradient(135deg,rgba(131,204,185,0.16),rgba(94,209,215,0.07))] p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl ${className ?? ''}`.trim()

  return (
    <article className={containerClassName} style={{ maxWidth: maxWidth }}>
      <header className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#83ccb9]/24 bg-[#83ccb9]/14 text-sm font-semibold text-[#b9f7e8]">
          {index + 1}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          {renderSlateBlocks(step.header, `step-${index}-header`)}
        </div>
      </header>

      <section className="flex flex-col gap-2 border-t border-[#83ccb9]/16 pt-3">
        {renderSlateBlocks(step.body, `step-${index}-body`)}
      </section>
    </article>
  )
}
