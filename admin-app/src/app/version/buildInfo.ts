declare const __APP_BUILD_ID__: string
declare const __APP_BUILD_TIMESTAMP__: string

/**
 * The running build, injected by `vite.config.ts` `define`. The same id is
 * written to `/version.json` at build time, which is what makes comparing the
 * two meaningful.
 */
export const APP_BUILD_ID: string = __APP_BUILD_ID__
export const APP_BUILD_TIMESTAMP: string = __APP_BUILD_TIMESTAMP__
