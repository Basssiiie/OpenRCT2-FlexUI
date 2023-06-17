/**
 * All available events for controls to subscribe to.
 *  - `open`: is triggered when the window or tab is opened by the user.
 *  - `redraw`: is triggered whenever a redraw is started. Widget groups can use this
 *      to update their size and position relative to any child widget changes.
 *  - `update`: is triggered every frame (as in frames per second) while the window or
 *      tab is open. Be careful with heavy usage.
 *  - `close`: is triggered when the window is closed by the user.
 */
export type FrameEvent = "open" | "redraw" | "update" | "close";