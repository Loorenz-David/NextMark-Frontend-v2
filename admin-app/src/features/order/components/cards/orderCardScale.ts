/**
 * Size of the order card's content (all lists: main, plans, route stops).
 *
 * TUNE HERE: change ORDER_CARD_SCALE and save; the dev server applies it at
 * once. 1 = the R1 design, 0.8 = 20% smaller. Text, thumbnails, padding and
 * gaps follow it through `--order-card-scale` (index.css, `.order-card*`).
 * The menu keeps a 44px finger target, and on touch screens the small text
 * never drops below 12px.
 */
export const ORDER_CARD_SCALE = 0.8;

/** Below this scale the state pill and arrow badge use their small size. */
export const ORDER_CARD_SMALL_CHIPS_BELOW = 0.9;
