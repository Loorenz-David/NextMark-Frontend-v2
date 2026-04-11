const SCROLL_ROOT_ATTR = 'data-bottom-sheet-scroll-root'
const GESTURE_LOCK_ATTR = 'data-bottom-sheet-gesture-lock'
function isElement(value: EventTarget | null): value is HTMLElement {
  return value instanceof HTMLElement
}

function isEditableElement(element: HTMLElement) {
  if (element.isContentEditable) {
    return true
  }

  const tagName = element.tagName.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function isScrollableElement(element: HTMLElement) {
  const style = window.getComputedStyle(element)
  const overflowY = style.overflowY

  return (overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight
}

export function shouldIgnoreBottomSheetContentGesture(target: EventTarget | null, contentRoot: HTMLElement | null) {
  if (!isElement(target)) {
    return false
  }

  let current: HTMLElement | null = target
  while (current && current !== contentRoot) {
    if (current.getAttribute(GESTURE_LOCK_ATTR) === 'true') {
      return true
    }

    if (isEditableElement(current)) {
      return true
    }

    current = current.parentElement
  }

  if (!current) {
    return false
  }

  return current.getAttribute(GESTURE_LOCK_ATTR) === 'true'
}

export function resolveBottomSheetContentScrollContainer(
  target: EventTarget | null,
  contentRoot: HTMLElement | null,
) {
  if (!isElement(target) || !contentRoot) {
    return null
  }

  let current: HTMLElement | null = target
  let hintedScrollRoot: HTMLElement | null = null

  while (current && current !== contentRoot) {
    if (current.getAttribute(GESTURE_LOCK_ATTR) === 'true') {
      return null
    }

    if (isScrollableElement(current)) {
      return current
    }

    if (!hintedScrollRoot && current.hasAttribute(SCROLL_ROOT_ATTR)) {
      hintedScrollRoot = current
    }

    current = current.parentElement
  }

  if (contentRoot.getAttribute(GESTURE_LOCK_ATTR) === 'true') {
    return null
  }

  if (!hintedScrollRoot && contentRoot.hasAttribute(SCROLL_ROOT_ATTR)) {
    hintedScrollRoot = contentRoot
  }

  if (hintedScrollRoot && isScrollableElement(hintedScrollRoot)) {
    return hintedScrollRoot
  }

  return null
}

export function isScrollContainerAtTop(element: HTMLElement) {
  return element.scrollTop <= 0
}

export function isScrollContainerAtBottom(element: HTMLElement) {
  return element.scrollTop + element.clientHeight >= element.scrollHeight - 1
}
