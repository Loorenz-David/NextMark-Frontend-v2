


const defaultState = 'undefined'
const defaultColor = '#494949'
type Props = {
 label?:string | typeof defaultState | null
 color?:string | typeof defaultColor | null
 style?: {}
}

export const verifyHexColor = (color: string| null | undefined): string | null => {
  if (!color) return null
  if(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)){
    return color
  }
  return null
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