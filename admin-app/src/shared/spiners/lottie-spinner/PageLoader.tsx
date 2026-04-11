import Lottie from "lottie-react"
import loadingAnimation from "./loading.json"
import sandClockAnimation from './SandClock.json'

interface LoaderParams{
  size?:number
  loadingText?:string
  containerStyle?:Record<string,any>
  animation?:  keyof typeof animationMap
  inline?:boolean
}





const animationMap = {
  jumpUp: {animation: loadingAnimation, heightDivisor:1.5, topDivisor:10},
  sandClock: {animation: sandClockAnimation, heightDivisor:1, topDivisor:0},

} 


export function LottieSpinner({
  size = 150,
  loadingText = '',
  animation = 'jumpUp',
  containerStyle,
  inline = false
}: LoaderParams) {

  const variant = animationMap[animation]

  return (
    <div
      className={
        inline
          ? "inline-flex items-center justify-center"
          : "flex flex-col justify-center items-center rounded-xl"
      }
      style={{ ...containerStyle }}
    >
      <div
        className="overflow-hidden relative flex items-center justify-center"
        style={{
          width: `${size}px`,
          height: inline
            ? `${size}px`
            : `${size / variant.heightDivisor}px`
        }}
      >
        <Lottie
          animationData={variant.animation}
          loop
          style={{
            width: `${size}px`,
            height: `${size}px`,
            position: "absolute",
            top: `${variant.topDivisor
              ? size / variant.topDivisor
              : 0}px`
          }}
        />
      </div>

      {!inline && (
        <span className="font-[500] text-gray-500">
          {loadingText}
        </span>
      )}
    </div>
  )
}
