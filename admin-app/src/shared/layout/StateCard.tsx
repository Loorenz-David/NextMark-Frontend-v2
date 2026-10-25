import { verifyHexColor } from './stateCardColor.domain'

const defaultState = 'undefined'
const defaultColor = '#494949'
type Props = {
 label?:string | typeof defaultState | null
 color?:string | typeof defaultColor | null
 style?: React.CSSProperties
 size?: 'sm' | 'md'
}

export const StateCard = ({ label, color, style, size = 'sm' }: Props) => {

  return (
    <div
      className={`flex items-center justify-center border ${size === 'md' ? 'rounded-md px-2.5 py-1' : 'rounded-sm px-2 py-[3px]'}`}
      style={{
        ...style,
        backgroundColor: `${verifyHexColor(color) ?? defaultColor}1A`, // 20% opacity
        borderColor: `${verifyHexColor(color) ?? defaultColor}80`,     // 60% opacity
      }}
    >
      <span
        className={size === 'md' ? 'text-sm' : 'text-xs'}
        style={{ color: `${verifyHexColor(color) ?? defaultColor}E6` }} // 90% opacity
      >
        {label ?? defaultState }
      </span>
    </div>
  )
}
