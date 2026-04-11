import { shouldTogglePlanFromKeydown } from '../homeDesktopKeyboard.flow'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runHomeDesktopKeyboardFlowTests = () => {
  {
    const shouldToggle = shouldTogglePlanFromKeydown({ key: 'p' }, false)
    assert(shouldToggle, 'p should toggle plan when popup is closed')
  }

  {
    const shouldToggle = shouldTogglePlanFromKeydown({ key: 'P' }, false)
    assert(shouldToggle, 'uppercase P should toggle plan when popup is closed')
  }

  {
    const shouldToggle = shouldTogglePlanFromKeydown({ key: 'p' }, true)
    assert(!shouldToggle, 'p should not toggle plan when popup is open')
  }

  {
    const shouldToggle = shouldTogglePlanFromKeydown({ key: 'x' }, false)
    assert(!shouldToggle, 'non-p keys should not toggle plan')
  }
}
