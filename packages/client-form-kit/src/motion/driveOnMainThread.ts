/**
 * Passed as `onUpdate` to keep framer-motion from running a fade natively.
 *
 * framer-motion hands opacity animations to the browser (WAAPI). When one
 * finishes it cancels the native animation at once but writes the final value
 * to the element's inline style only on its next render frame — so a frame
 * painted in between shows the element at its starting opacity: a one-frame
 * blink at the end of the fade. Whether that frame gets painted depends on
 * timing, which is why the blink came and went with unrelated per-frame work.
 *
 * framer-motion never runs an animation natively for an element with an
 * `onUpdate` handler (it would have no values to report), so this no-op makes
 * it drive the fade on the main thread, writing the value every frame.
 */
export const driveOnMainThread = (): void => {};
