const VERTICAL_GAP = 10
const HORIZONTAL_OFFSET = 5

function isKeyboardOpen(): boolean {
  if (typeof window === "undefined") return false

  // Check if we're on mobile
  const isMobile = window.innerWidth < 768
  if (!isMobile) return false

  // Check if any input/textarea is focused (indicating keyboard might be open)
  const activeElement = document.activeElement
  const isInputFocused =
    activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.contentEditable === "true" ||
      activeElement.getAttribute("contenteditable") === "true")

  return !!isInputFocused
}

function getKeyboardHeight(): number {
  // Estimate keyboard height on mobile devices
  // This is an approximation since we can't directly detect keyboard height
  if (typeof window === "undefined") return 0

  const isMobile = window.innerWidth < 768
  if (!isMobile) return 0

  // Typical mobile keyboard heights (in pixels)
  // iPhone: ~260-300px, Android: ~280-320px
  return 280
}

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET,
): void {
  const scrollerElem = anchorElem.parentElement

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = "0"
    floatingElem.style.transform = "translate(-10000px, -10000px)"
    return
  }

  const floatingElemRect = floatingElem.getBoundingClientRect()
  const anchorElementRect = anchorElem.getBoundingClientRect()
  const editorScrollerRect = scrollerElem.getBoundingClientRect()

  const isMobile = window.innerWidth < 768
  const keyboardOpen = isKeyboardOpen()
  const keyboardHeight = keyboardOpen ? getKeyboardHeight() : 0

  // Calculate initial top and left positions
  let top = targetRect.bottom + verticalGap
  let left = targetRect.left + horizontalOffset

  if (isMobile && keyboardOpen) {
    // Position toolbar above the keyboard
    const viewportHeight = window.innerHeight
    const toolbarHeight = floatingElemRect.height
    const keyboardTop = viewportHeight - keyboardHeight

    // Position toolbar just above the keyboard with some padding
    top = keyboardTop - toolbarHeight - 20 // 20px padding above keyboard

    // Center horizontally on mobile
    left = (window.innerWidth - floatingElemRect.width) / 2

    // Convert to relative positioning within the anchor element
    top -= anchorElementRect.top
    left -= anchorElementRect.left
  } else {
    // Original positioning logic for desktop and mobile without keyboard
    // Ensure the floating element stays within the editor's bounds
    if (top + floatingElemRect.height > editorScrollerRect.bottom) {
      // If it overflows at the bottom, position it above the selection
      top = targetRect.top - floatingElemRect.height - verticalGap
    }

    if (left + floatingElemRect.width > editorScrollerRect.right) {
      // If it overflows on the right, align it with the right edge of the editor
      left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset
    }

    if (left < editorScrollerRect.left) {
      // If it overflows on the left, align it with the left edge of the editor
      left = editorScrollerRect.left + horizontalOffset
    }

    // Adjust for the anchor element's position
    top -= anchorElementRect.top
    left -= anchorElementRect.left
  }

  // Apply smooth transition and positioning
  floatingElem.style.transition = "transform 0.2s ease-in-out, opacity 0.2s ease-in-out"
  floatingElem.style.opacity = "1"
  floatingElem.style.transform = `translate(${left}px, ${top}px)`
}
