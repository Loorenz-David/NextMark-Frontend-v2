import { AnimationRenderer } from "@/shared/spiners";
import { LoadingBar } from "@/shared/spiners/loading-bar/LoadingBar";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type Props = {
 message:React.ReactNode
 startedAt?: number | null
 orderCount: number
 perOrderMs?: number
 minDurationMs?: number
 maxDurationMs?: number
 startCap?: number
 endCap?: number
}
export const OptimizationLoading = ({
    message,
    startedAt,
    orderCount,
    perOrderMs = 120,
    minDurationMs = 8000,
    maxDurationMs = 30000,
    startCap = 12,
    endCap = 95,
}: Props) => {
    const computedDurationMs = clamp(
        minDurationMs + Math.max(orderCount, 0) * perOrderMs,
        minDurationMs,
        maxDurationMs,
    );
    const durationSeconds = computedDurationMs / 1000;

    return ( 
        <div className="flex flex-col h-full w-full items-center justify-center px-4 gap-4">
            <div className="flex flex-col items-center justify-center w-full">
                <AnimationRenderer
                    animation={"sandClock"}
                    width={"100%"}
                    height={'100px'}
                />

                <div className="w-[200px]">
                    <LoadingBar 
                        durationSeconds={durationSeconds}
                        startedAt={startedAt}
                        startCap={startCap}
                        endCap={endCap}
                        curve="easeOutCubic"
                        height={8}
                        randomized
                    />
                </div>

            </div>
            <div className="flex flex-col items-center justify center">
                {message}
            </div>
        </div>
    );
}
