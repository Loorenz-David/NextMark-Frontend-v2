export type StackComponentProps<P = undefined> = {
  payload?: P
  onClose?: () => void
}
export type EmptyParams = Record<string, never>
