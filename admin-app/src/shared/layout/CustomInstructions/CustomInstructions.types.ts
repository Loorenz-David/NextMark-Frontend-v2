export type SlateTextNode = {
  text: string
  bold?: boolean
  underline?: boolean
  link?: string
}

export type SlateBlock = {
  type: 'title' | 'paragraph'
  children: SlateTextNode[]
}

export type InstructionStep = {
  header: SlateBlock[]
  body: SlateBlock[]
}

export type StepCardProps = {
  step: InstructionStep
  index: number
  className?: string
  maxWidth?: number | string
}

export type InstructionsRootProps = {
  steps: InstructionStep[]
  scrollable?: boolean
  className?: string
  stepCardClassName?: string
  stepCardMaxWidth?: number | string
}
