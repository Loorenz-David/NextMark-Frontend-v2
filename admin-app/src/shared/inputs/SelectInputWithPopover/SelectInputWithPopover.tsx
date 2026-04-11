import { SelectInputWithPopoverLayout } from './SelectInputWithPopover.layout'
import type { SelectInputWithPopoverProps } from './SelectInputWithPopover.types'
import { useSelectInputWithPopover } from './useSelectInputWithPopover'

export const SelectInputWithPopover = <TValue,>(props: SelectInputWithPopoverProps<TValue>) => {
  const layoutProps = useSelectInputWithPopover(props)
  return <SelectInputWithPopoverLayout {...layoutProps} />
}
