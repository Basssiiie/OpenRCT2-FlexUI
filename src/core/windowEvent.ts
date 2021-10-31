/**
 * All available events for controls to subscribe to.
 *  - `open`: is triggered when the window is opened by the user.
 *  - `update`: is triggered every frame while the window is open. Be careful with heavy usage.
 *  - `close`: is triggered when the window is closed by the user.
 */
export type WindowEvent = "open" | "update" | "close";