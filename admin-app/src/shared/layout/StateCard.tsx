import { verifyHexColor } from './stateCardColor.domain'

const defaultState = 'undefined'
const defaultColor = '#494949'
type Props = {
 label?:string | typeof defaultState | null
 color?:string | typeof defaultColor | null
 style?: React.CSSProperties
}

export const StateCard = ({ label, color, style }: Props) => {

  return (
    <div
      className="flex items-center justify-center px-2 py-[3px] border  rounded-sm"
      style={{
        ...style,
        backgroundColor: `${verifyHexColor(color) ?? defaultColor}1A`, // 20% opacity
        borderColor: `${verifyHexColor(color) ?? defaultColor}80`,     // 60% opacity
      }}
    >
      <span
        className="text-xs"
        style={{ color: `${verifyHexColor(color) ?? defaultColor}E6` }} // 90% opacity
      >
        {label ?? defaultState }
      </span>
    </div>
  )
}
