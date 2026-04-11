export const DRAWING_SELECTION_MODE_EVENT = 'map:drawing-selection-mode'
export const DRAWING_SELECTION_CLEAR_EVENT = 'map:drawing-selection-clear'

export type DrawingSelectionMode = 'circle' | 'rectangle' | 'polygon'

export type DrawingSelectionModeEventDetail = {
  mode: DrawingSelectionMode
}
