type Props = {
  text: string | number
  bgColor: string
  textColor: string
}

export const CounterBadge = ({ text, bgColor, textColor }: Props) => {
  return (
    <span
      className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {text}
    </span>
  )
}
